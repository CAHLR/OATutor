"""
OATutor AI answer checker.

For every step of every problem: sends the question (from the content files) to
an AI, then checks the AI's answer with the app's own grader
(src/platform-logic/checkAnswer.js, run in node). So "rejected" here means a
student typing the same thing would be marked wrong. No browser or npm start
needed, unless you add --in-browser.

When the AI's answer is rejected, the question, the AI's answer and the stored
answer are saved so someone can look at it. It means one of three things, and a
person has to decide which:
    - the AI got it wrong
    - the stored answer is wrong (the kind of error check_problems.py can't see)
    - the grader rejects a correct answer written another way

Setup (from this folder):
    pip install anthropic             (only for Claude)
    npm install                       (in the repo root, once: the grader needs it)

    Claude:  export ANTHROPIC_API_KEY=...        (costs money per question)
    Ollama:  ollama pull qwen2.5:7b               (free, runs on your laptop)

Run (from this folder):
    python check_with_ai.py --ids a17ac4finverse16 --ai stored   # free test, see below
    python check_with_ai.py --course "Solid Foundations" --sample 10
    python check_with_ai.py --course "OpenStax: Pre-Calculus" --ai ollama
    python check_with_ai.py --course "SJSU 1018" --in-browser     # double-check in the app

    --ai stored answers with the stored answer instead of asking an AI. It costs
    nothing and is only for testing that the script works.

    --in-browser opens every rejected answer in the app (needs `npm start` and
    playwright, see check_problems.py) and types it in, to make sure the app
    rejects it too. The result goes in the "browser" column.

Results go to results/check_with_ai/<course>.csv (only answers that weren't
accepted). Re-running a problem only replaces that problem's lines.
AI answers are saved in results/check_with_ai/ai-answers.json, so re-running
the same question doesn't ask (or pay) again.

Limitations:
    - the AI can be wrong, so every row needs a person to look at it
    - pictures/graphs aren't sent to the AI, so questions that need a figure
      will mostly show up as rejected (the note says "has a figure")
    - problems with variables (@{a}) use the first value of each variable.
      --in-browser skips those, since the app picks random values.
    - matrix answers and hint scaffolds aren't checked, only the main steps
"""

import argparse
import hashlib
import json
import os
import random
import re
import subprocess
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from check_answers import STAGING, fill_variables, save_results
from check_problems import find_problem_ids, load_problem

# ---- which AI ----------------------------------------------------------------
# Change these (or use --ai / --model) to switch AI. Everything else stays the same.
AI = "claude"                       # "claude", "ollama" or "stored"
CLAUDE_MODEL = "claude-opus-5-5"
CLAUDE_EFFORT = "medium"            # low / medium / high: how hard it thinks (and cost)
OLLAMA_MODEL = "qwen2.5:7b"
WORKERS = 4                         # questions sent to the AI at the same time

SHOW_PROMPTS = False                # --show-prompts prints what's sent to the AI

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT_DIR = os.path.join(HERE, "results", "check_with_ai")
CACHE = os.path.join(OUT_DIR, "ai-answers.json")


# =============================================================================
# PART 1 - THE PROMPT
# =============================================================================

RULES = """You are checking a math tutoring system. Solve the question and give
the answer the way a student would type it into the answer box.

Think it through, then end your reply with one last line:
ANSWER: <your answer>"""

FORMAT = {
    "arithmetic": """The answer box is a math box that reads LaTeX.
- Write only the final answer: no words, no $$, no units.
- Only write "x =" / "f(x) =" if the question asks for an equation.
- Use LaTeX: \\frac{a}{b}, \\sqrt{x}, \\sqrt[3]{x}, x^{2}, \\sin(x), \\ln(x), \\log_{b}(x), \\pi, e, i.
- Keep exact values (fractions, roots, pi) unless the question says to round.
  If it does, round the way it says.
- If there are several answers, separate them with commas.""",
    "string": """The answer box is plain text and is compared as exact text.
- Write only the answer, as short as possible, no $$.""",
    "MultipleChoice": """Pick one of the numbered choices. After ANSWER: write only
its number.""",
}


def make_prompt(problem_text, done_steps, step_text, step, choices):
    kind = "MultipleChoice" if step["problemType"] == "MultipleChoice" else step.get("answerType", "arithmetic")
    parts = [RULES, "Answer format:\n" + FORMAT.get(kind, FORMAT["arithmetic"]),
             "Problem:\n" + problem_text]
    # earlier steps of the same problem, with their correct answers, since later
    # steps often build on them
    for question, answer in done_steps:
        parts.append(f"Earlier step: {question}\nCorrect answer: {answer}")
    parts.append("Question to answer now:\n" + step_text)
    if choices:
        parts.append("Choices:\n" + "\n".join(f"{n}. {c}" for n, c in enumerate(choices, 1)))
    return "\n\n".join(parts)


def read_answer(reply, choices):
    """The text after the last ANSWER:, or None. For multiple choice, the choice itself."""
    found = re.findall(r"ANSWER:\s*(.+)", reply or "")
    if not found:
        return None
    answer = found[-1].strip().strip("$").strip()
    if choices:
        number = re.search(r"\d+", answer)
        if not number or not 1 <= int(number.group()) <= len(choices):
            return None
        return choices[int(number.group()) - 1]
    return answer


# =============================================================================
# PART 2 - ASKING THE AI
# =============================================================================

def ask_claude(prompt):
    import anthropic                   # only needed for this AI
    client = anthropic.Anthropic()     # reads ANTHROPIC_API_KEY
    response = client.beta.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=16000,
        output_config={"effort": CLAUDE_EFFORT},
        # if Claude refuses (it shouldn't for math), let the API retry on another model
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        return None
    return "".join(b.text for b in response.content if b.type == "text")


def ask_ollama(prompt):
    request = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=json.dumps({"model": OLLAMA_MODEL, "stream": False,
                         "messages": [{"role": "user", "content": prompt}]}).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=300) as r:
        return json.load(r)["message"]["content"]


def ask_ai(prompt, cache):
    """The AI's full reply. Saved replies are reused when the same question comes back."""
    model = CLAUDE_MODEL if AI == "claude" else OLLAMA_MODEL
    key = hashlib.sha1((model + "\n" + prompt).encode()).hexdigest()
    if key not in cache:
        reply = ask_claude(prompt) if AI == "claude" else ask_ollama(prompt)
        if not reply:
            return reply                # don't save an empty reply, ask again next time
        cache[key] = reply
    return cache[key]


# =============================================================================
# PART 3 - THE QUESTIONS AND THE GRADER
# =============================================================================

def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


def make_jobs(problem):
    """One job per step: the prompt to send plus what the grader needs.

    The question text comes from the content files, with variables (@{a})
    replaced by their first value. Earlier steps are given with the stored answer.
    """
    variables = problem.get("variabilization") or {}
    problem_text = fill_variables(clean(problem.get("title")) + "\n" + clean(problem.get("body")), variables).strip()
    jobs, done_steps = [], []
    for i, step in enumerate(problem["steps"]):
        step_vars = step["_variabilization"]
        stored = [fill_variables(a, step_vars) for a in step.get("stepAnswer") or []]
        question = fill_variables(clean(step.get("stepTitle")) + "\n" + clean(step.get("stepBody")), step_vars).strip()
        choices = [fill_variables(c, step_vars) for c in step.get("choices") or []]
        if stored and "matrix}" not in stored[0]:
            notes = []
            if "##figure" in problem_text + question:
                notes.append("has a figure")
            if step_vars:
                notes.append("has variables")
            jobs.append({
                "problem": problem["id"], "course": problem.get("courseName", ""),
                "lesson": problem.get("lesson", ""), "step": i + 1, "has_variables": bool(step_vars),
                "question": problem_text + "\n" + question, "choices": choices,
                "prompt": make_prompt(problem_text, done_steps, question, step, choices),
                "expected": stored, "note": ", ".join(notes), "link": STAGING + problem["id"],
                # the same things the app passes to checkAnswer (ProblemCard.js)
                "grade": {"actual": stored, "answerType": step.get("answerType", "arithmetic"),
                          "precision": step.get("precision", 5),
                          "questionText": clean(step.get("stepBody")) or clean(step.get("stepTitle"))},
            })
        done_steps.append((question, stored[0] if stored else ""))
    return jobs


# Loads the app's checkAnswer.js in node (jiti lets node read the app's import
# syntax) and grades every {attempt, actual, answerType, ...} it's given.
# Sends back [accepted, reason] for each, reason being "wrong", "sameAsProblem"
# ("Please simplify!") or "errored".
GRADER = r"""
globalThis.localStorage = { getItem: () => null };
console.debug = console.log = () => {};
const repo = process.argv[1];
const jiti = require(repo + "/node_modules/jiti")(repo + "/x.js");
const { checkAnswer } = jiti(repo + "/src/platform-logic/checkAnswer.js");
const items = JSON.parse(require("fs").readFileSync(0, "utf8"));
const out = items.map(item => {
  try {
    const [, correct, reason] = checkAnswer(item);
    return [!!correct, reason ? reason.toString().split(".").pop() : ""];
  } catch (e) { return [false, "errored"]; }
});
process.stdout.write(JSON.stringify(out));
"""


def grade(items):
    """Run the app's grader on a list of answers. Returns [accepted, reason] for each."""
    if not items:
        return []
    res = subprocess.run(["node", "-e", GRADER, REPO], input=json.dumps(items),
                         capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


# =============================================================================
# PART 4 - DOUBLE-CHECK IN THE BROWSER (only with --in-browser)
# =============================================================================

def check_in_browser(rows, base, headed):
    """Type each rejected AI answer into the app. Fills the "browser" column."""
    from check_problems import sync_playwright     # only needed for --in-browser
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        for row in rows:
            if not row["ai_answer"]:
                continue
            if row["has_variables"]:
                row["browser"] = "skipped (random variables)"
                continue
            try:
                row["browser"] = try_in_browser(page, base, row)
            except Exception as e:      # one broken problem must not stop the whole run
                row["browser"] = "error: " + str(e).splitlines()[0][:100]
            print(f"  browser: {row['problem']} step {row['step']} {row['browser']}", flush=True)
        browser.close()


def try_in_browser(page, base, row):
    from check_problems import PWTimeout, answer_step, fill_answer
    problem = load_problem(row["problem"])
    # blank page first, so the problem loads fresh even if the last row was the same problem
    page.goto("about:blank")
    page.goto(f"{base}/#/debug/{row['problem']}")
    page.locator("[data-selenium-target=problem-header]").wait_for(timeout=10000)
    page.wait_for_timeout(500)
    # answer the earlier steps with the stored answers to get to this one
    i = row["step"] - 1
    if not all(answer_step(page, j, problem["steps"][j]) == "ok" for j in range(i)):
        return "couldn't reach this step"
    toggle = page.locator(f"[data-selenium-target=problem-step-toggle-{i}]")
    if not page.locator(f"[data-selenium-target=submit-button-{i}]").is_visible() and toggle.count():
        toggle.click(timeout=5000)
        page.wait_for_timeout(300)
    if fill_answer(page, f"#problem-step-{i}-content", i, problem["steps"][i], row["ai_answer"]):
        return "couldn't type the answer"
    page.locator(f"[data-selenium-target=submit-button-{i}]").click(timeout=5000)
    icon = page.locator(f"[data-selenium-target=step-correct-img-{i}]")
    try:
        icon.wait_for(timeout=5000)
    except PWTimeout:
        return "no feedback"
    page.wait_for_timeout(500)          # an earlier red X may still be showing
    return "accepted" if icon.get_attribute("alt") == "Green Checkmark Icon" else "rejected"


# =============================================================================
# PART 5 - LOOP OVER MANY PROBLEMS, WRITE THE REPORT
# =============================================================================

def main():
    global AI, CLAUDE_MODEL, OLLAMA_MODEL, SHOW_PROMPTS
    ap = argparse.ArgumentParser(description="OATutor AI answer checker")
    ap.add_argument("--ids", nargs="*", help="specific problem IDs to check")
    ap.add_argument("--course", help="only problems whose courseName contains this")
    ap.add_argument("--sample", type=int, default=0, help="check only N random problems")
    ap.add_argument("--ai", choices=["claude", "ollama", "stored"], help=f"which AI (default: {AI})")
    ap.add_argument("--model", help="model name for that AI")
    ap.add_argument("--show-prompts", action="store_true", help="print what's sent to the AI")
    ap.add_argument("--yes", action="store_true", help="don't ask before a big Claude run")
    ap.add_argument("--in-browser", action="store_true", help="double-check rejected answers in the app")
    ap.add_argument("--base", default="http://localhost:3001", help="site for --in-browser")
    ap.add_argument("--headed", action="store_true", help="show the browser window")
    args = ap.parse_args()
    AI = args.ai or AI
    SHOW_PROMPTS = args.show_prompts
    if args.model:
        if AI == "claude":
            CLAUDE_MODEL = args.model
        else:
            OLLAMA_MODEL = args.model

    ids = args.ids or find_problem_ids(args.course)
    if args.sample:
        ids = random.sample(ids, min(args.sample, len(ids)))
    problems = [p for p in map(load_problem, ids) if p]
    jobs = [job for p in problems for job in make_jobs(p)]

    if AI == "claude" and not os.environ.get("ANTHROPIC_API_KEY"):
        print("No Claude key: run  export ANTHROPIC_API_KEY=...  first, or use --ai ollama / --ai stored")
        return

    # Claude costs money per question, so check before a big run
    if AI == "claude" and len(jobs) > 20 and not args.yes:
        if input(f"{len(jobs)} questions will be sent to {CLAUDE_MODEL}. Continue? [y/N] ").lower() != "y":
            return

    os.makedirs(OUT_DIR, exist_ok=True)
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    start = time.time()

    # 1. ask the AI every question. Each answer takes a while, so WORKERS of
    # them are sent at the same time (the pool runs solve() on every job)
    def solve(job):
        if SHOW_PROMPTS:
            print("-" * 70 + "\n" + job["prompt"] + "\n")
        if AI == "stored":
            # test mode: no AI, just the stored answer
            job["ai_answer"] = job["expected"][0]
            return
        try:
            reply = ask_ai(job["prompt"], cache)
        except Exception as e:      # network/API problem: note it and keep going
            reply = None
            job["note"] = ", ".join(filter(None, [job["note"], str(e).splitlines()[0][:150]]))
        job["ai_answer"] = read_answer(reply, job["choices"]) or ""

    done = 0
    with ThreadPoolExecutor(max_workers=1 if SHOW_PROMPTS else WORKERS) as pool:
        for _ in pool.map(solve, jobs):
            done += 1
            if done % 10 == 0 or done == len(jobs):
                print(f"[{done}/{len(jobs)}] questions answered", flush=True)
                json.dump(cache, open(CACHE, "w"))      # save as we go in case it stops

    # 2. grade the AI answers, and the stored answers too (to know if those work at all)
    asked = [j for j in jobs if j["ai_answer"]]
    ai_results = grade([{**j["grade"], "attempt": j["ai_answer"]} for j in asked])
    stored_results = grade([{**j["grade"], "attempt": j["expected"][0]} for j in asked])

    rows = [{**j, "status": "no_ai_answer", "expected": " | ".join(j["expected"])}
            for j in jobs if not j["ai_answer"]]
    for job, (accepted, reason), (stored_ok, _) in zip(asked, ai_results, stored_results):
        if not accepted:
            status = {"sameAsProblem": "same_as_question", "errored": "grader_error"}.get(reason, "ai_rejected")
            rows.append({**job, "status": status, "expected": " | ".join(job["expected"]),
                         "stored_accepted": stored_ok})
    rows.sort(key=lambda r: (r["problem"], r["step"]))

    if args.in_browser and rows:
        check_in_browser(rows, args.base, args.headed)

    fields = ["problem", "course", "lesson", "step", "status", "question", "ai_answer",
              "expected", "stored_accepted", "browser", "note", "link"]
    checked = {p["id"]: p.get("courseName", "") for p in problems}
    files = save_results(OUT_DIR, rows, checked, fields)
    for r in rows:
        print(f"  {r['problem']:24s} step {r['step']}  {r['status']:16s} AI: {r['ai_answer']!r}  file: {r['expected']!r}")
    print(f"\n{len(problems)} problems, {len(jobs)} steps, {len(rows)} not accepted, "
          f"{time.time() - start:.0f}s")
    print("-> " + ", ".join(os.path.relpath(f, HERE) for f in files))


if __name__ == "__main__":
    main()
