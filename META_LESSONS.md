# Meta-Lessons

A meta-lesson is a wrapper around several lessons. When a student opens one, it
resolves to a concrete path of lessons and sends them through it. Its main use is
A/B testing: one link, and each student is deterministically routed to one
variant of the same material.

Meta-lessons are **inert by default**. A course with no `metaLessons` array
behaves exactly as it did before — no flag, no configuration.

---

## 1. Data model

Two fields do the work.

| Field | Purpose |
|---|---|
| `id` | What problem content matches against. Variants of the same lesson **share** this, so they serve the same problems, and student progress and BKT mastery stay on one key. |
| `metaId` | Unique per lesson entry. Meta-lessons reference their children by `metaId`, never by `id`. |

`findLessonById` in `src/config/config.js` matches on either:

```js
const findLessonById = (ID) => {
    return _lessonPlansNoEditor.find(
        (lessonPlan) => lessonPlan.id === ID || lessonPlan.metaId === ID
    );
};
```

### Lesson entries

Two variants of the same lesson. They share `id`, differ in `metaId`, and here
differ in which tutor prompt the chatbot uses:

```json
{
    "id": "33ubFGPj-iH8T-IbGf1Lxm3Q",
    "metaId": "pandas-A",
    "name": "Lesson Pandas",
    "chat_display_mode": "Window",
    "learningObjectives": { "pandas": 0.85 }
},
{
    "id": "33ubFGPj-iH8T-IbGf1Lxm3Q",
    "metaId": "pandas-B",
    "name": "Lesson Pandas",
    "chat_display_mode": "Window",
    "chat_prompt": "PROMPT-alternate.txt",
    "learningObjectives": { "pandas": 0.85 }
}
```

Any lesson-level field can differ between variants — `chat_prompt`,
`chat_display_mode`, `fixedProblemOrder`, and so on. What must stay the same is
`id`, or the variants stop resolving to the same problem content.

### Meta-lesson entries

A `metaLessons` array sits as a sibling of `lessons` on the course object:

```json
{
    "courseName": "Midterm 1 Worksheets",
    "lessons": [ ... ],
    "metaLessons": [
        {
            "id": "meta_pandas",
            "type": "meta_lesson",
            "name": "Pandas (A/B)",
            "order": "random",
            "choose": "1",
            "lessons": ["pandas-A", "pandas-B"]
        }
    ]
}
```

- **`id`** — what students link to (`#/lessons/meta_pandas`). Keep it stable;
  anything pointing at it breaks if it changes.
- **`order`** / **`choose`** — the selection mode. See below.
- **`lessons`** — an array of `metaId` values, or the `id` of another
  meta-lesson.

### Selection modes

| `order` | `choose` | Behaviour |
|---|---|---|
| `random` | `"1"` | Pick one child. **Deterministic** when a stable user id is available. |
| `sequence` | `"all"` | Run every child in the listed order. |
| `random` | `"all"` | Run every child in shuffled order. |

Single-child arrays are valid (`% 1` always yields index 0), which is how you run
one lesson through the meta-lesson machinery without a split.

---

## 2. Nesting

A meta-lesson's children can be other meta-lessons, which is how you combine
branching with a multi-lesson sequence:

```
meta_study            (random, choose 1)   ← the link students get
├── meta_study_A      (sequence, all)
│   ├── lesson1-A     variant A of lesson 1
│   └── lesson2-A     variant A of lesson 2
└── meta_study_B      (sequence, all)
    ├── lesson1-B
    └── lesson2-B
```

The student is assigned to one arm, then works through that arm's lessons in
order. Both the deterministic and random resolvers recurse into nested
meta-lessons.

---

## 3. Branch assignment

`src/util/deterministicBranchAssignment.js` hashes a stable user id with a
djb2-style string hash and takes `% numberOfChildren`. The same id always yields
the same branch, on any device and in any session.

`Platform.js` picks the strategy at resolution time:

```js
const stableUserId = this.user?.user_id || this.context?.userID;
const path = stableUserId
    ? resolveMetaLessonDeterministic(metaLesson, stableUserId, ...)
    : resolveMetaLessonBranchAware(metaLesson, ...);
```

- **Canvas launches** supply `lms_user_id` — a real institutional identity, stable
  across devices.
- **Direct links** fall back to `oats_user_id`, generated on first visit and kept
  in localStorage. Stable within a browser, but a cleared cache or a different
  device produces a new id and therefore a new assignment.

With no id at all, `resolveMetaLessonBranchAware` picks randomly and caches the
result under `meta_lesson_path_<metaLessonId>` so the student stays on one branch
within that browser.

Note the deterministic path deliberately ignores that cached path.
`meta_lesson_path_*` is not user-scoped, so on a shared browser a previous
student's saved branch would otherwise override the correct assignment.

---

## 4. What gets logged

Every Firestore row carries `meta_lesson_id` (the root) and `meta_lesson_arm`
(the chosen child), set from `selectMetaLesson` via
`firebase.setMetaLessonAssignment(...)`. The arm is what identifies the
condition — the root is identical for every student.

---

## 5. Rules and failure modes

Most meta-lesson misconfigurations render a **blank page with no error**. The
checks in the next section catch all the known causes.

**`metaId` values must be unique** across the file, and must not collide with
any `id`.

**Every `metaId` referenced by a meta-lesson must exist** on some lesson, or that
meta-lesson resolves to nothing.

**`learningObjectives` keys must exist in `bkt-params/defaultBKTParams.json`**
(and `experimentalBKTParams.json`). A missing KC leaves `probMastery` at 1, the
heuristic skips every problem as already-mastered, and the lesson renders blank.

**Step files need entries in `skillModel.json`.** Knowledge components come from
that mapping keyed by step id, not from the step JSON. Missing entries produce
the same blank page.

**Lessons referenced by a meta-lesson are hidden from the lesson picker**
(`LessonSelection.js` filters them), so students can only reach a variant through
the meta-lesson. Reaching one directly would bypass assignment. A duplicate that
no meta-lesson references stays visible.

**The LTI middleware keeps its own copy of `coursePlans.json`** inside its
deployment zip. If you are using meta-lessons with Canvas, that copy must match
the frontend's or the Lambda will not recognise the lesson — and editing the file
in git does nothing until the zip is rebuilt and redeployed.

**Content regeneration silently drops these fields.** Any pipeline that rewrites
`coursePlans.json` from scratch removes hand-added `metaLessons`, `metaId`, and
per-variant fields. Re-add and re-validate after every regeneration.

---

## 6. Validation

Run after any change to `coursePlans.json`:

```bash
python3 -c "
import json, collections
d = json.load(open('src/content-sources/oatutor/coursePlans.json'))
bkt = json.load(open('src/content-sources/oatutor/bkt-params/defaultBKTParams.json'))

mids = [l['metaId'] for c in d for l in c['lessons'] if l.get('metaId')]
ids = {l['id'] for c in d for l in c['lessons']}
meta_ids = {m['id'] for c in d for m in c.get('metaLessons', [])}
dupes = [k for k, v in collections.Counter(mids).items() if v > 1]
resolvable = set(mids) | meta_ids
broken = [(m['id'], ch) for c in d for m in c.get('metaLessons', [])
          for ch in m['lessons'] if ch not in resolvable]
missing_kc = sorted({k for c in d for l in c['lessons']
                     for k in l.get('learningObjectives', {}) if k not in bkt})

print('metaIds:', len(mids), '| unique:', len(set(mids)), '| duplicates:', dupes)
print('metaId/id collisions:', set(mids) & ids)
print('broken child references:', broken)
print('KCs missing from BKT params:', missing_kc)
"
```

A clean run reports no duplicates, no collisions, no broken references, and no
missing KCs.