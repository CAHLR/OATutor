# Course Document Workflow

This directory supports an **offline course-document compiler** for OATutor.

PDFs are parsed at build/development time with **Amazon Bedrock Data Automation (BDA)** in `us-west-2`, compiled into canonical learning-object JSON, and then made available to the existing `aiAgentGeneration` Lambda in `us-west-1`.

BDA is **never called during a student chat turn**.

---

## Directory layout

```text
aws/aiAgentGeneration/
├── documents/
│   ├── manifest.json
│   ├── course-docs-env.sh
│   ├── raw/
│   ├── bda-raw/
│   ├── compiled/
│   └── assets/
│       ├── pages/
│       ├── figures/
│       └── tables/
├── scripts/
├── schemas/
└── package.json
```

### What each folder contains

- `raw/` — original PDFs.
- `bda-raw/` — cached BDA output used by `--skip-bda`.
- `compiled/` — canonical learning-object JSON produced by the semantic compiler.
- `assets/pages/` — full rectified page images from BDA.
- `assets/figures/` — actual extracted figures, charts, and diagrams.
- `assets/tables/` — extracted table assets and CSV files.

Full-page files such as `rectified_image_0.png` are normal BDA page assets. They should be stored under `assets/pages/`, not treated as instructional figures.

---

# End-to-end workflow

Run all commands below from:

```bash
cd aws/aiAgentGeneration
```

## 1. Load the document-compiler environment

The AWS profile, BDA project, bucket, and Region are already defined in:

```text
documents/course-docs-env.sh
```

Load them whenever you open a new terminal:

```bash
source documents/course-docs-env.sh
```

Verify AWS authentication:

```bash
aws sts get-caller-identity
```

The account should be the expected OATutor AWS account.

### OpenAI semantic compiler

When using the OpenAI compiler provider, enter the API key securely for the current terminal session:

```bash
read -s "OPENAI_API_KEY?OpenAI API key: "
export OPENAI_API_KEY
echo
```

Do not commit API keys to the repository or place them in `course-docs-env.sh`.

---

## 2. Add a PDF

Place the PDF under:

```text
documents/raw/
```

Use a stable, course-specific filename. Example:

```text
documents/raw/data100-disc01.pdf
```

Avoid misleading IDs such as naming Data 100 material `data8-*`.

---

## 3. Register the document in `manifest.json`

Documents are not automatically registered. Add an entry to:

```text
documents/manifest.json
```

Follow the existing manifest structure. A typical entry looks like:

```json
{
  "data100-disc01": {
    "source": "raw/data100-disc01.pdf",
    "compiled": "compiled/data100-disc01.json",
    "course": "data100",
    "visibility": "private_tutor"
  }
}
```

The manifest key is the stable document ID:

```text
data100-disc01
```

Use this ID in compiler commands and later in `coursePlans.json`.

---

## 4. Compile a new or changed PDF

For the first compile of a document, run:

```bash
npm run compile-docs -- --doc data100-disc01
```

This performs the complete pipeline:

```text
local PDF
→ temporary upload to S3 in us-west-2
→ asynchronous BDA extraction
→ download Markdown, tables, figures, page images, and bounding boxes
→ semantic compiler
→ canonical learning-object JSON
```

Expected local outputs include:

```text
documents/bda-raw/data100-disc01/
documents/compiled/data100-disc01.json
documents/assets/
documents/compiled/_compile-report.json
```

The temporary S3 objects may be cleaned up after the output has been downloaded successfully.

---

## 5. Validate the compiled document

Run:

```bash
npm run validate-docs -- --doc data100-disc01
```

Validation checks the JSON schema and document relationships. A validation pass does **not** guarantee that the educational content is correct.

---

## 6. Inspect the result manually

Compare the original PDF against:

```text
documents/compiled/data100-disc01.json
```

Check all of the following:

- Every numbered question is present.
- Subparts such as `(a)`, `(b)`, and `(c)` belong to the correct parent question.
- Each solution is associated with the correct prompt.
- Solutions and answer keys are marked as private tutor material.
- Math, matrices, symbols, and equations preserve their meaning.
- Python, SQL, and other code retain indentation and language tags.
- Figures, charts, and diagrams are associated with the correct question.
- Tables are represented correctly.
- Page numbers and bounding boxes are present.
- Cross-page question or solution continuations are preserved.
- The compiler did not invent, omit, or silently rewrite important content.

Suggested status labels:

```text
PASS
PASS_WITH_WARNINGS
NEEDS_REVIEW
FAIL
```

---

## 7. Recompile without calling BDA again

BDA extraction is usually a one-time operation for an unchanged PDF.

When changing only the semantic compiler, schema, rules, validation, or concept tagging, reuse the cached BDA output:

```bash
npm run compile-docs -- --doc data100-disc01 --skip-bda
npm run validate-docs -- --doc data100-disc01
```

`--skip-bda` means:

```text
do not upload the PDF
→ do not call BDA
→ reuse documents/bda-raw/data100-disc01/
→ rerun semantic compilation
```

Run without `--skip-bda` only when:

- The source PDF changed.
- The BDA project settings changed.
- The BDA cache is missing, incomplete, or incorrect.
- A fresh BDA extraction is intentionally required.

---

## 8. Bind the document to a lesson

In the matching lesson in `coursePlans.json`, reference the stable manifest ID:

```json
"chat_documents": [
  "data100-disc01"
]
```

Do not use raw paths or filenames in `coursePlans.json`.

Unrelated lessons should omit the document or explicitly use:

```json
"chat_documents": []
```

Only assign documents to lessons that should have access to them. Physics lessons should not receive Data 100 material unless that is intentional.

The backend must enforce the lesson-to-document allowlist. Do not trust an arbitrary `chatDocuments` list sent by the browser.

---

## 9. Phase 3: publish compiled documents for Oski (runtime S3)

There is **no** `lesson-document-map.json`.  
[`src/content-sources/oatutor/coursePlans.json`](../../../src/content-sources/oatutor/coursePlans.json) is the only lesson → document allowlist via `chat_documents`.

### Architecture

```text
Build (us-west-2): PDF → BDA → semantic compile → validated JSON
Publish: npm run publish-docs → private S3 bucket (us-west-1)
Chat (us-west-1 Lambda): lessonId → coursePlans.chat_documents → load compiled JSON
  → score learning objects globally → keep 0–5 matches (char budget)
  → ACCESSIBLE COURSE MATERIALS inventory + <course_context> excerpts → OpenAI
```

Mutable course content lives in S3. The Lambda package should contain **runtime code only** (not `documents/compiled`, `assets`, `raw`, or `bda-raw`).

### Runtime bucket layout

```text
s3://oatutor-runtime-course-docs/documents/
├── coursePlans.json          # uploaded last
├── manifest.json
├── compiled/*.json
└── assets/{figures,tables,pages}/…
```

Do not upload `raw/`, `bda-raw/`, `_compile-report.json`, or `_validation-report.json`.

### Environment

```bash
source documents/runtime-docs-env.sh
# COURSE_DOCS_RUNTIME_BUCKET=oatutor-runtime-course-docs
# COURSE_DOCS_RUNTIME_REGION=us-west-1
# COURSE_DOCS_RUNTIME_PREFIX=documents
# COURSE_DOCS_CACHE_TTL_MS=300000
```

Also set the same variables on the **aiAgentGeneration Lambda** (us-west-1).

### Publish

```bash
source documents/runtime-docs-env.sh
npm test
npm run publish-docs
# preflight only:
npm run publish-docs -- --dry-run
```

`publish-docs` runs tests, validates compiled JSON, checks every `chat_documents` id against the manifest and local assets, syncs assets + compiled, uploads `manifest.json`, then uploads `coursePlans.json` **last**.

### IAM

Lambda execution role (read-only):

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": ["arn:aws:s3:::oatutor-runtime-course-docs/documents/*"]
}
```

Publisher identity may use `s3:ListBucket`, `s3:GetObject`, `s3:PutObject` (no delete yet).

### Chat-time behavior

- Browser sends stable `lessonId` (already in `extracted` / top-level request). It must **not** send `chat_documents`, `documentId`, or `s3Key`.
- Retrieval ranks learning objects **across all** lesson-allowed documents, keeps **0–5** positive lexical matches (no minimum padding), and stops early if the ~12k character budget is hit.
- The private system message has two parts:
  1. **`ACCESSIBLE COURSE MATERIALS`** — full lesson allowlist (`document_id` / `material_type` / `material_title`)
  2. **`<course_context>`** blocks — selected excerpts, each carrying its own source identity
- “What materials can you access?” is answered from the full inventory, not only the selected excerpts.
- Logs use `allowedDocumentIds` + `selectedContexts` (`documentId`, `problemId`, `score`) only — never solution text.
- On S3/selection failure: log ids/error codes only, fall back to existing `problemContext`, continue tutoring.
- Private reference is a server-only system message — never written into client `conversationHistory`.

### Content updates (no Lambda redeploy)

```bash
npm run compile-docs -- --doc data100-disc04 --skip-bda
npm run validate-docs -- --doc data100-disc04
npm run publish-docs
```

Redeploy Lambda only when runtime code (`document-context.mjs`, `index.mjs`, …) changes.

---

# Routine commands

## New or updated PDF

```bash
source documents/course-docs-env.sh

read -s "OPENAI_API_KEY?OpenAI API key: "
export OPENAI_API_KEY
echo

npm run compile-docs -- --doc data100-disc01
npm run validate-docs -- --doc data100-disc01
```

## Compiler or schema changes only

```bash
source documents/course-docs-env.sh

read -s "OPENAI_API_KEY?OpenAI API key: "
export OPENAI_API_KEY
echo

npm run compile-docs -- --doc data100-disc01 --skip-bda
npm run validate-docs -- --doc data100-disc01
```

---

# Current AWS resources

Document compilation uses:

```text
Region: us-west-2
S3 bucket: oatutor-course-docs-bucket
BDA project: oatutor-course-document-parser
BDA project stage: LIVE
```

The existing Oski `aiAgentGeneration` Lambda remains in:

```text
Region: us-west-1
```

Phase 3 runtime course docs (after you create the bucket):

```text
Region: us-west-1
S3 bucket: oatutor-runtime-course-docs
Prefix: documents/
```

---

# Not part of this workflow yet

- No Bedrock Knowledge Base or production vector store.
- No live BDA call during student chat (compile offline; load compiled JSON from runtime S3).
- No Textract primary pipeline.
- No `unpdf` or runtime PDF parsing.
- No student document-upload UI.
- No `lesson-document-map.json` (coursePlans.chat_documents is authoritative).

The current approach is:

```text
parse offline
→ compile and validate
→ bind by stable lesson-scoped ID (chat_documents)
→ publish to runtime S3
→ Lambda retrieves structured learning objects into private prompt context
```
