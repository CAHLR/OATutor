"""
OATutor answer checker (no browser).

Goes through every stored answer in the content pool (steps and hint scaffolds)
and checks it with the same parser the app's grader uses (src/kas.js). Much
faster than check_problems.py since nothing is opened in a browser: the whole
content pool takes a few seconds.

What it flags:
    unreadable          the grader can't read the stored answer, so no student
                        can get it right. If a small fix makes it readable
                        (missing/extra parenthesis, √ -> \\sqrt{}, \\operatorname{sec}
                        -> \\sec, ...) the fix is in the "suggestion" column.
                        fix = one clear fix, choose = more than one possible fix,
                        pick by hand. The note also says when it can't be fixed in
                        the content (±, degree symbol, Greek letters, x'), when the
                        answer is plain text marked as math, or a #NAME? sheet error.
    same_as_question    the answer is the same as the expression in the question.
                        The grader rejects that with "Please simplify!", so it
                        can't be answered either.
    duplicate_question  the step has the exact same question as another problem
                        in the same lesson. If the answers are different too, one
                        was probably copied from the row above by mistake.

Setup: needs node (same as npm start), nothing else to install.

Run (from this folder):
    python3 check_answers.py                                  # everything
    python3 check_answers.py --course "OpenStax: Pre-Calculus"
    python3 check_answers.py --ids a17ac4finverse16 ad9ac1cpolarform26

Results go to results/check_answers/<course>.csv (one row per flagged answer).
Re-running a problem only replaces that problem's lines in the file.

Limitations:
    - only checks that answers can be read, not that they're mathematically right
      (polarform24 passes but is wrong)
    - only arithmetic answers; multiple choice and text answers aren't checked
    - suggestions are guesses that make the answer readable. Always check them
      against the question before changing the sheet.
    - variabilized answers (@{a}) are checked with the first value only
"""

import argparse
import csv
import glob
import json
import os
import re
import subprocess
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, "../src/content-sources/oatutor/content-pool")
KAS = os.path.join(HERE, "../src/kas.js")
OUT_DIR = os.path.join(HERE, "results", "check_answers")
STAGING = "https://cahlr.github.io/OATutor-Content-Staging/#/debug/"


# =============================================================================
# PART 1 - THE PARSER
# =============================================================================

# Same steps the app does before parsing (checkAnswer.js parse()): drop the $$,
# and wrap a single |...| in parentheses. Then sends back the parsed form of
# each string (two answers are the same if their parsed forms are), or null.
JS = r"""
const KAS = require(process.argv[1]);
const items = JSON.parse(require("fs").readFileSync(0, "utf8"));
function prep(s) {
  if (s.split("|").length === 3) {
    const l = s.indexOf("|"), r = s.lastIndexOf("|");
    s = s.slice(0, l) + "(" + s.slice(l, r + 1) + ")" + s.slice(r + 1);
  }
  return s.replace(/\$\$/g, "");
}
const out = items.map(s => {
  try {
    const p = KAS.parse(prep(s));
    return p.parsed ? p.expr.repr() : null;
  } catch (e) { return null; }
});
process.stdout.write(JSON.stringify(out));
"""


def kas_parse(strings):
    """Parse a list of strings with KAS. Returns the parsed form of each, or None."""
    if not strings:
        return []
    result = subprocess.run(["node", "-e", JS, KAS], input=json.dumps(strings),
                            capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def fill_variables(text, variables):
    # first value of each variable, like the app does after picking one
    for name, values in (variables or {}).items():
        if values:
            text = text.replace("@{" + name + "}", str(values[0]))
    return text


# =============================================================================
# PART 2 - READING THE CONTENT
# =============================================================================

def load_answers(problem_ids):
    """One row per answer: every step and every hint scaffold."""
    rows = []
    for pid in problem_ids:
        problem = json.load(open(f"{CONTENT}/{pid}/{pid}.json"))
        problem_vars = problem.get("variabilization") or {}
        info = {
            "problem": pid,
            "course": problem.get("courseName", ""),
            "lesson": problem.get("lesson", ""),
            "problem_text": (problem.get("title", ""), problem.get("body", "")),
        }

        for step_file in sorted(glob.glob(f"{CONTENT}/{pid}/steps/*/*.json")):
            step = json.load(open(step_file))
            step_vars = step.get("variabilization") or problem_vars
            title = step.get("stepTitle") or ""
            body = step.get("stepBody") or ""
            answers = [fill_variables(a, step_vars) for a in step.get("stepAnswer") or []]
            rows.append({**info, "where": step["id"], "kind": "step",
                         # the app compares with the body, or the title if there's no body (ProblemCard.js)
                         "question": body.strip() or title.strip(),
                         "full_question": (title, body, tuple(step.get("choices") or [])),
                         "answer_type": step.get("answerType"),
                         "answers": answers})

            # hint scaffolds are in the step's tutoring folder
            for hints_file in sorted(glob.glob(os.path.dirname(step_file) + "/tutoring/*.json")):
                for hint in json.load(open(hints_file)):
                    if hint.get("type") != "scaffold":
                        continue
                    hint_vars = hint.get("variabilization") or step_vars
                    answers = [fill_variables(a, hint_vars) for a in hint.get("hintAnswer") or []]
                    rows.append({**info, "where": hint["id"], "kind": "scaffold",
                                 "question": hint.get("text", ""),     # what HintTextbox.js compares with
                                 "full_question": None,
                                 "answer_type": hint.get("answerType"),
                                 "answers": answers})
    return rows


def find_problem_ids(course=None):
    # same as in check_problems.py, but uses this file's CONTENT (--content)
    ids = []
    for pid in sorted(os.listdir(CONTENT)):
        path = f"{CONTENT}/{pid}/{pid}.json"
        if not os.path.exists(path):
            continue
        if course and course.lower() not in json.load(open(path)).get("courseName", "").lower():
            continue
        ids.append(pid)
    return ids


# =============================================================================
# PART 3 - SUGGESTING FIXES FOR ANSWERS THAT CAN'T BE READ
# =============================================================================

# simple text swaps, tried before anything else
SWAPS = [
    (r"\\operatorname\{(sin|cos|tan|sec|csc|cot|ln|log|arcsin|arccos|arctan)\}", r"\\\1"),
    (r"\{(sin|cos|tan|sec|csc|cot)\}\^\{?\\left\(-1\\right\)\}?", r"\\\1^{-1}"),
    (r"\{(sin|cos|tan|sec|csc|cot)\}\^\{?\(-1\)\}?", r"\\\1^{-1}"),
    (r"\\operatorname\{log_(\w+)\}", r"\\log_{\1}"),
    (r"\\operatorname\{([0-9.]+)\}", r"\1"),
    (r"√\s*\(([^()]*)\)", r"\\sqrt{\1}"),
    (r"√\s*\{([^{}]*)\}", r"\\sqrt{\1}"),
    (r"√\s*([0-9.]+)", r"\\sqrt{\1}"),
    (r"\bsqrt(\d+)", r"sqrt(\1)"),
    (r"\\sqrt(\d)", r"\\sqrt{\1}"),
    (r"(\\n)+$", ""),                        # stray \n left at the end
]

# things the grader can't read at all, so there's no fix in the content
NOT_FIXABLE = [
    ("#NAME?", "spreadsheet error (#NAME?) instead of an answer"),
    ("±", "± can't be read by the grader"),
    ("\\pm", "± can't be read by the grader"),
    ("\\mp", "∓ can't be read by the grader"),
    ("°", "degree symbol can't be read by the grader"),
    ("\\degree", "degree symbol can't be read by the grader"),
    ("\\circ", "degree symbol can't be read by the grader"),
    ("'", "prime (x') can't be read by the grader"),
    ("′", "prime (x') can't be read by the grader"),
]
# Greek letters (θ, φ and π are fine)
for letter in "αβγδελμσωΔΩ":
    NOT_FIXABLE.append((letter, f"{letter} can't be read by the grader"))
for name in ["alpha", "beta", "gamma", "delta", "epsilon", "lambda", "mu", "sigma", "omega", "Delta", "Omega"]:
    NOT_FIXABLE.append(("\\" + name, f"\\{name} can't be read by the grader"))


def looks_like_text(answer):
    # two real words outside the math, e.g. "It has one 90-degree angle."
    outside = re.sub(r"\$\$.*?\$\$", " ", answer)
    words = re.findall(r"[A-Za-z]{3,}", outside)
    return len(words) >= 2 and not re.search(r"sqrt|sin|cos|tan|log", outside)


def swap_fix(answer):
    fixed = answer
    for pattern, replacement in SWAPS:
        fixed = re.sub(pattern, replacement, fixed)
    return fixed


def paren_candidates(answer):
    """Every version of the answer with one parenthesis removed or added.

    Only tried when the ( and ) counts don't match, so the list stays small.
    """
    s = answer.strip("$")
    opens, closes = s.count("("), s.count(")")
    if opens == closes:
        return []

    def can_add_at(i):
        # not in the middle of a word or number (s(qrt), and not right after a backslash
        in_word = 0 < i < len(s) and s[i - 1].isalnum() and s[i].isalnum()
        return not in_word and s[i - 1:i] != "\\"

    # one ) too many: remove a ) or add a ( somewhere. Same the other way around.
    extra, missing = (")", "(") if closes > opens else ("(", ")")
    out = set()
    for i, ch in enumerate(s):
        if ch == extra:
            out.add(s[:i] + s[i + 1:])
    for i in range(len(s) + 1):
        if can_add_at(i):
            out.add(s[:i] + missing + s[i:])
    return sorted(out)


def suggest(unreadable):
    """For each unreadable answer: (fix, suggestion, note), fix being fix/choose/none."""
    notes = {}
    swapped = {}
    for a in unreadable:
        blocked = [message for symbol, message in NOT_FIXABLE if symbol in a]
        if looks_like_text(a):
            notes[a] = ("none", "", "text answer marked as math (answerType should probably be string)")
        elif blocked:
            notes[a] = ("none", "", blocked[0])
        else:
            swapped[a] = swap_fix(a)

    # 1. does the simple swap alone fix it?
    parsed = kas_parse(list(swapped.values()))
    need_parens = {}
    for (a, fixed), p in zip(swapped.items(), parsed):
        if p is not None and fixed != a:
            notes[a] = ("fix", fixed, "symbol/format fix")
        else:
            need_parens[a] = fixed

    # 2. try adding/removing one parenthesis (on top of the swap)
    tries = [(a, c) for a, fixed in need_parens.items() for c in paren_candidates(fixed)]
    parsed = kas_parse([c for _, c in tries])
    # versions that parse to the same thing count as one option
    found = defaultdict(dict)                 # answer -> {parsed form: first version}
    for (a, c), p in zip(tries, parsed):
        if p is not None:
            found[a].setdefault(p, c)
    for a in need_parens:
        options = list(found[a].values())
        if len(options) == 1:
            notes[a] = ("fix", "$$" + options[0] + "$$", "unbalanced parentheses")
        elif options:
            notes[a] = ("choose", "  OR  ".join("$$" + o + "$$" for o in options[:4]),
                        f"unbalanced parentheses, {len(options)} ways to fix")
        else:
            notes[a] = ("none", "", "no automatic fix found")
    return notes


# =============================================================================
# PART 4 - DUPLICATE QUESTIONS
# =============================================================================

def find_duplicates(rows):
    """Steps with the exact same question as a step in another problem of the same lesson."""
    groups = defaultdict(list)
    for r in rows:
        if r["kind"] != "step" or not any(r["full_question"]):
            continue
        title, body, choices = r["full_question"]
        # same text with a different picture or different numbers is fine
        text = " ".join(r["problem_text"]) + title + " " + body
        if "##figure" in text or "@{" in text:
            continue
        groups[(r["course"], r["lesson"], r["problem_text"], r["full_question"])].append(r)

    flagged = []
    for group in groups.values():
        problems = sorted({r["problem"] for r in group})
        if len(problems) < 2:
            continue
        if len({tuple(r["answers"]) for r in group}) > 1:
            note = "same question but different answers, one is probably copied by mistake: "
        else:
            note = "exact duplicate: "
        for r in group:
            flagged.append({**r, "status": "duplicate_question", "suggestion": "",
                            "note": note + ", ".join(problems)})
    return flagged


# =============================================================================
# PART 5 - SAVING AND MAIN
# =============================================================================

# same as in check_problems.py, copied so this file doesn't need Playwright
def course_file(folder, course):
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
            writer.writerows(kept + new)
        written.append(path)
    return written


def main():
    global CONTENT
    ap = argparse.ArgumentParser(description="OATutor answer checker (no browser)")
    ap.add_argument("--ids", nargs="*", help="specific problem IDs")
    ap.add_argument("--course", help="only problems whose courseName contains this")
    ap.add_argument("--content", help="another content-pool folder to check")
    args = ap.parse_args()
    if args.content:
        CONTENT = args.content

    ids = args.ids or find_problem_ids(args.course)
    rows = load_answers(ids)
    # matrices are graded cell by cell in the app, so they're skipped here
    arith = [r for r in rows if r["answer_type"] == "arithmetic" and r["answers"]
             and "matrix}" not in r["answers"][0]]

    # every answer and every question through the parser, in one go
    parsed_answers = kas_parse([r["answers"][0] for r in arith])
    parsed_questions = kas_parse([r["question"] for r in arith])

    flagged = []
    unreadable = []
    for r, answer, question in zip(arith, parsed_answers, parsed_questions):
        if answer is None:
            unreadable.append(r)
        elif question is not None and answer == question:
            flagged.append({**r, "status": "same_as_question", "suggestion": "",
                            "note": "answer is the same as the question (Please simplify!)"})

    notes = suggest(sorted({r["answers"][0] for r in unreadable}))
    for r in unreadable:
        fix, suggestion, note = notes[r["answers"][0]]
        flagged.append({**r, "status": "unreadable", "fix": fix, "suggestion": suggestion, "note": note})

    flagged += find_duplicates(rows)

    fields = ["problem", "course", "lesson", "where", "kind", "status", "fix", "answer",
              "suggestion", "note", "link"]
    order = {"unreadable": 0, "same_as_question": 1, "duplicate_question": 2}
    flagged.sort(key=lambda r: (r["problem"], order[r["status"]], r["where"]))
    out = [{**r, "fix": r.get("fix", ""), "answer": r["answers"][0], "link": STAGING + r["problem"]}
           for r in flagged]
    checked = {r["problem"]: r["course"] for r in rows}
    files = save_results(OUT_DIR, out, checked, fields)

    print(f"{len(ids)} problems, {len(arith)} arithmetic answers checked")
    for status in order:
        n = sum(r["status"] == status for r in flagged)
        print(f"  {status:20s} {n}")
    fixes = [r for r in flagged if r["status"] == "unreadable"]
    for kind in ("fix", "choose", "none"):
        print(f"    unreadable with {kind:7s} {sum(r['fix'] == kind for r in fixes)}")
    print("-> " + ", ".join(os.path.relpath(f, HERE) for f in files))


if __name__ == "__main__":
    main()
