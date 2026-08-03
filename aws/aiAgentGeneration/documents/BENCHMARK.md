# Benchmark inspection checklist

Suite: Data 8 Discussions 01–05 (manifest IDs `data8-disc01` … `data8-disc05`).

## Status (2026-08-02)

| document_id | PDF in raw/ | BDA run | Compiled JSON | Notes |
|-------------|-------------|---------|---------------|-------|
| data8-disc01 | pending drop-in | not run | not yet | Place `raw/data8-disc01.pdf` |
| data8-disc02 | pending drop-in | not run | not yet | Place `raw/data8-disc02.pdf` |
| data8-disc03 | pending drop-in | not run | not yet | Place `raw/data8-disc03.pdf` |
| data8-disc04 | pending drop-in | fixture only | dry-run via fixture | `_fixtures/data8-disc04` exercises compiler |
| data8-disc05 | pending drop-in | not run | not yet | Place `raw/data8-disc05.pdf` |

## Per-document checks (fill after real BDA + LLM compile)

### data8-disc04 (template)

- [ ] Question / subpart boundaries
- [ ] Math / matrix fidelity
- [ ] Code indentation / language
- [ ] Figure ↔ question association
- [ ] Checkbox / marked answers
- [ ] Solution boxes vs definitions
- [ ] Cross-page solution continuation

## How to run the real benchmark

1. Copy the five PDFs into `documents/raw/` with manifest filenames.
2. Set `COURSE_DOCS_S3_BUCKET`, `AWS_ACCOUNT_ID` (or `BDA_PROFILE_ARN`), and compiler credentials.
3. `npm run compile-docs -- --doc data8-disc04`
4. Re-run compiler only: `npm run compile-docs -- --doc data8-disc04 --skip-bda`
5. `npm run validate-docs -- --doc data8-disc04`
6. Update this checklist.

## Fixture dry-run (no AWS / no PDF)

```bash
cp -R documents/bda-raw/_fixtures/data8-disc04 documents/bda-raw/data8-disc04
npm run compile-docs -- --doc data8-disc04 --skip-bda --dry-run
npm run validate-docs -- --doc data8-disc04
```

## data100-disc02 regression (question index)

Pinned BDA fixture: `documents/bda-raw/_fixtures/data100-disc02`.

```bash
npm run test:disc02
```

Asserts `expected_problem_count=10`, `eda-practice=6`, `visualizations=4`, unique IDs, nonempty prompts, validation `errors=0`.