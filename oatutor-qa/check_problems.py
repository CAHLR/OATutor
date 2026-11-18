"""
OATutor content checker.

Opens each problem in debug mode (/#/debug/<id>), enters the stored answer for
every step, and checks that the app marks it correct. Failures are screenshotted
and written to results/check_problems/<course>.csv. Re-running a problem only
replaces its own line in that file.

Setup:
    # repo root, the test hooks only exist in dev builds
    echo 'REACT_APP_BUILD_TYPE=development' >> .env
    npm start

    # another terminal, in this folder
    python3 -m venv .venv && source .venv/bin/activate
    pip install playwright
    playwright install chromium

Run:
    python check_problems.py --course "SJSU 1018"              # whole course
    python check_problems.py --course "SJSU 1018" --sample 20  # 20 random problems
    python check_problems.py --ids a6b05b8poly12 a873512coordinates25
    python check_problems.py --ids a005bd5real1 --headed       # watch the browser

For a wrong_answer, open localhost:3001/#/debug/<id> and type the answer yourself.
"Incorrect Answer!" usually means the grader can't read the LaTeX, "Please simplify!"
means the answer is the same as the question.

Limitations:
    - only checks that the stored answer is accepted, so a wrong but readable
      answer passes
    - doesn't check the question text, or other answers a student might type
      (text answers are exact match, so 6,-6 vs -6,6 isn't caught)
    - no hints, scaffolds, grid answers or Canvas/LTI
    - no_feedback is sometimes a timing glitch, rerun those with --ids
    - tests whatever npm start is serving, restart it after editing content
    - answers the grader can't read (±, degree symbol, α/β) show as wrong_answer
"""

import argparse
import csv
import itertools
import json
import os
import random
import re
import sys
import time
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

HERE = os.path.dirname(os.path.abspath(__file__))
# one folder per problem: <id>/<id>.json, then <id>/steps/<id>a/<id>a.json, <id>b ...
CONTENT = os.path.join(HERE, "../src/content-sources/oatutor/content-pool")
OUT_DIR = os.path.join(HERE, "results", "check_problems")

PAUSE_ON_FAIL = False       # same as --pause


# =============================================================================
# PART 1 - READING THE CONTENT JSON   (no browser involved)
# =============================================================================

def load_problem(problem_id):
    """The problem's JSON with its steps added in problem["steps"]. None if it doesn't exist."""
    path = f"{CONTENT}/{problem_id}/{problem_id}.json"
    if not os.path.exists(path):
        return None
    problem = json.load(open(path))

    steps = []
    steps_dir = f"{CONTENT}/{problem_id}/steps"
    if os.path.isdir(steps_dir):
        for step_id in sorted(os.listdir(steps_dir)):      # <id>a, <id>b, ... so sorted = in order
            step_path = f"{steps_dir}/{step_id}/{step_id}.json"
            if os.path.exists(step_path):
                step = json.load(open(step_path))
                # a step uses the problem's variables if it doesn't have its own
                step["_variabilization"] = step.get("variabilization") or problem.get("variabilization") or {}
                steps.append(step)
    problem["steps"] = steps
    return problem


def find_problem_ids(course=None):
    """Every problem ID, or only the ones whose courseName contains `course`."""
    ids = []
    for problem_id in sorted(os.listdir(CONTENT)):
        path = f"{CONTENT}/{problem_id}/{problem_id}.json"
        if not os.path.exists(path):          # skip stray files like stepfiles.txt
            continue
        if course:
            course_name = json.load(open(path)).get("courseName", "")
            if course.lower() not in course_name.lower():
                continue
        ids.append(problem_id)
    return ids


# =============================================================================
# PART 2 - DRIVING THE BROWSER FOR ONE PROBLEM
# =============================================================================

def answer_step(page, i, step):
    """Answer step i (0-based) with the stored answer.

    Returns "ok", or "<status>: <detail>" with the status that goes in the CSV.
    """
    panel = f"#problem-step-{i}-content"
    submit = page.locator(f"[data-selenium-target=submit-button-{i}]")

    # only step 0 starts open
    if not submit.is_visible():
        toggle = page.locator(f"[data-selenium-target=problem-step-toggle-{i}]")
        if toggle.count() == 0:
            return f"ui_issue: step {i} toggle not found"
        toggle.click()
        page.wait_for_timeout(300)
    if not submit.is_visible():
        return f"ui_issue: step {i} could not be expanded"

    answers = step.get("stepAnswer") or []
    if not answers:
        return f"content_issue: step {i} has no stepAnswer"
    answer = answers[0]

    # with @{var} answers the app picks a random value on every load, even in
    # debug mode, so try each value until one works
    candidates = variable_options(answer, step.get("_variabilization") or {})

    icon = page.locator(f"[data-selenium-target=step-correct-img-{i}]")
    for candidate in candidates:
        error = fill_answer(page, panel, i, step, candidate)
        if error:
            return error
        submit.click(timeout=5000)
        try:
            icon.wait_for(timeout=5000)
        except PWTimeout:
            return f"no_feedback: step {i} no icon after submit"
        if len(candidates) > 1:
            page.wait_for_timeout(500)      # the last try's red X may still be showing
        if icon.get_attribute("alt") == "Green Checkmark Icon":
            return "ok"

    if len(candidates) > 1:
        return f"wrong_answer: step {i} expected {answer!r} was rejected for every value {candidates}"
    return f"wrong_answer: step {i} expected {answer!r} was rejected"


def variable_options(answer, variables):
    """Every version of `answer` with its @{var} filled in.

    e.g. variables {"b": ["2", "3"]} and "@{b}+1" -> ["2+1", "3+1"].
    """
    names = [v for v in variables if "@{" + v + "}" in answer]
    options = []
    for values in itertools.product(*(variables[v] for v in names)):
        filled = answer
        for v, value in zip(names, values):
            filled = filled.replace("@{" + v + "}", str(value))
        if filled not in options:
            options.append(filled)
    return options


def fill_answer(page, panel, i, step, answer):
    """Put `answer` in step i's input box. Returns None, or an error string."""
    # everything is looked up inside `panel`, otherwise step 1 finds step 0's box
    if step["problemType"] == "MultipleChoice":
        # compared in python because choices with LaTeX break a [value=...] selector
        radios = page.locator(f"{panel} input[type=radio]")
        values = [radios.nth(k).get_attribute("value") for k in range(radios.count())]
        if answer not in values:
            return f"ui_issue: step {i} choice {answer!r} not on page (choices: {values})"
        radios.nth(values.index(answer)).check()
        return None

    if step.get("answerType") == "string":
        box = page.locator(f"{panel} input[type=text]")
        if box.count() == 0:
            return f"ui_issue: step {i} no text box"
        box.first.fill(str(answer))
        return None

    # arithmetic: a MathLive math-field. .fill() doesn't work on it, so set the
    # value and send an input event so React sees it
    field = page.locator(f"{panel} math-field")
    if field.count() == 0:
        return f"ui_issue: step {i} no math-field"
    field.first.evaluate(
        "(el, v) => { el.value = v; el.dispatchEvent(new Event('input', {bubbles:true})) }",
        str(answer).strip("$"))
    return None


def check_problem(page, base, problem):
    """Open the problem in debug mode and answer every step. Returns (status, detail)."""
    # KaTeX errors in the console mean bad LaTeX in the content
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    page.goto(f"{base}/#/debug/{problem['id']}")
    try:
        page.wait_for_selector("[data-selenium-target=problem-header]", timeout=10000)
    except PWTimeout:
        return "render_fail", "problem header never appeared"

    # stop at the first failure, later steps usually need the earlier ones
    for i, step in enumerate(problem["steps"]):
        result = answer_step(page, i, step)
        if result != "ok":
            status, detail = result.split(": ", 1)
            if PAUSE_ON_FAIL:
                print("   PAUSED on failure - press Resume in the Playwright Inspector window")
                page.pause()
            return status, detail

    katex = [e for e in console_errors if "KaTeX" in e or "ParseError" in e]
    if katex:
        return "katex_error", katex[0][:150]
    return "ok", ""


# =============================================================================
# PART 3 - LOOP OVER MANY PROBLEMS, WRITE THE REPORT
# =============================================================================

def course_file(folder, course):
    """e.g. results/check_problems/openstax-pre-calculus.csv"""
    name = re.sub(r"[^a-z0-9]+", "-", course.lower()).strip("-") or "no-course"
    return os.path.join(folder, name + ".csv")


def save_results(folder, rows, checked, fields):
    """One CSV per course. `checked` is {problem id: course} for this run: old
    rows of those problems are replaced, everything else in the file stays."""
    os.makedirs(folder, exist_ok=True)
    written = []
    for course in sorted(set(checked.values())):
        path = course_file(folder, course)
        old = list(csv.DictReader(open(path))) if os.path.exists(path) else []
        kept = [r for r in old if r["problem"] not in checked]
        new = [r for r in rows if checked.get(r["problem"]) == course]
        with open(path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(sorted(kept + new, key=lambda r: r["problem"]))
        written.append(path)
    return written


def main():
    ap = argparse.ArgumentParser(description="OATutor content checker")
    ap.add_argument("--ids", nargs="*", help="specific problem IDs to check")
    ap.add_argument("--course", help="only problems whose courseName contains this")
    ap.add_argument("--sample", type=int, default=0, help="check only N random problems")
    ap.add_argument("--base", default="http://localhost:3001", help="site to test")
    ap.add_argument("--headed", action="store_true", help="show the browser window")
    ap.add_argument("--pause", action="store_true", help="with --headed: freeze the browser on each failure")
    args = ap.parse_args()
    global PAUSE_ON_FAIL
    if args.pause:
        PAUSE_ON_FAIL = True
        args.headed = True

    ids = args.ids or find_problem_ids(args.course)
    if args.sample:
        ids = random.sample(ids, min(args.sample, len(ids)))

    shots_dir = os.path.join(OUT_DIR, "screenshots")
    os.makedirs(shots_dir, exist_ok=True)

    rows = []
    start = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headed)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        for n, problem_id in enumerate(ids, 1):
            problem = load_problem(problem_id)
            if problem is None:
                status, detail = "missing_content", ""
            else:
                try:
                    status, detail = check_problem(page, args.base, problem)
                except Exception as e:      # one broken problem shouldn't stop the run
                    status, detail = "exception", str(e).splitlines()[0][:150]

            shot = os.path.join(shots_dir, f"{problem_id}.png")
            if status != "ok":
                page.screenshot(path=shot, full_page=True)
            elif os.path.exists(shot):
                os.remove(shot)             # fixed since last time

            rows.append({
                "problem": problem_id,
                "course": (problem or {}).get("courseName", ""),
                "lesson": (problem or {}).get("lesson", ""),
                "steps": len((problem or {}).get("steps", [])),
                "status": status,
                "detail": detail,
            })
            print(f"[{n}/{len(ids)}] {problem_id:24s} {status:14s} {detail}", flush=True)

        browser.close()

    files = save_results(OUT_DIR, rows, {r["problem"]: r["course"] for r in rows},
                         ["problem", "course", "lesson", "steps", "status", "detail"])

    flagged = [r for r in rows if r["status"] != "ok"]
    print(f"\n{len(rows)} problems, {len(flagged)} flagged, {time.time() - start:.0f}s")
    print("-> " + ", ".join(os.path.relpath(f, HERE) for f in files))
    for r in flagged:
        print(f"  {r['problem']}: {r['status']} - {r['detail']}")

    # exit code 1 if anything is flagged, so it could be used in CI
    sys.exit(1 if flagged else 0)


if __name__ == "__main__":
    main()