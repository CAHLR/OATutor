# Anthropology reading review

Status: draft awaiting instructor review. This outline is not an approved answer key.

## Proposed reading outline

1. Establish the question of property and the method of inquiry. Source anchor anthropology-reading::preamble.
2. Examine proposed foundations of property, including civil law, appropriation of land, consent, and prescription. Source anchors ::3-civil-law-as-the-foundation-and-sanction-of-property, ::i-the-land-cannot-be-appropriated, ::2-universal-consent-no-fustification-of-property, ::3-prescription-gives-no-title-to-property.
3. Examine labor, unequal capacities, and the justification of ownership. Source anchors ::7-that-inequality-of-powers-is-the-necessary-condition-of-equality-of-fortunes and ::8-that-from-the-stand-point-of-fustice-labor-destroys-property.
4. Follow the propositions arguing that property produces contradictions. Source anchors ::second-proposition through ::property-is-impossible-because-it-is-the-negation-of-equality.
5. Examine moral sense, sociability, and justice. Source anchors ::part-first, ::2-of-the-first-and-second-degrees-of-sociability, ::3-of-the-third-degree-of-sociability.
6. Compare property and communism, then examine the proposed third form of society. Source anchors ::part-second, ::2-characteristics-of-communism-and-of-property, ::3-determination-of-the-third-form-of-society-conclusion.

An instructor should verify ordering, missing chapter divisions, possession versus property, the premises behind “property is theft,” and liberty in the conclusion. The runtime currently uses extracted source headings, explicitly labeled as unreviewed, plus actual excerpts. It does not present this draft as an approved study guide.

## Source limitations

The inspected live artifact contains 26 indexed sections, some spanning multiple book sections. Every page array contains [0]. Preserve those values for diagnostics, but do not invent or present verified page citations. The source outline is not a verified table of contents.

## Implementation and verification

Textbook passages are bounded to 2,800 characters with approximately 240 characters overlap, preferring sentence/paragraph boundaries. This approximates 500–800 English tokens rather than using a tokenizer. Child IDs contain parent ID, offset, and text hash. Parent document IDs, compiled format, and lesson bindings remain compatible.

Old section-level vectors are ignored when current chunk IDs or saved embedding-text hashes disagree. Lexical retrieval continues until embeddings are regenerated. PromptHive and Oski must use the same document-context module. Run the bundled embed-docs command with --doc anthropology-reading against an isolated working copy of the current runtime artifact. Do not use a global publication to replace the sidecar.

Run npm test in aws/aiAgentGeneration. For the actual-artifact regression, set READING_REGRESSION_ARTIFACT to a downloaded published Anthropology JSON and run npm run test:reading. No network/model calls are made by those tests.

For live verification, start fresh synthetic conversations and check property/theft, universal consent, the third form of society, whole-reading structure, and a short follow-up. Inspect actual answers and CloudWatch includedChunkIds, omittedChunkIds, truncatedChunkIds, referenceChars, and staleEmbeddingDocumentIds. An unrelated course must not receive Anthropology context.

The prompt-assembly fix requires a Lambda code update. The embedding sidecar is a content update. Both require a concrete approved live target and pre-write revision/hash checks. The approved live update was applied on November 10, 2026; verification is recorded below.

## Live verification on November 10, 2026

Approved target: account 127859764376, profile oatutor-docs, Lambda oatutor-ai-agent,
region us-west-1. The Lambda code SHA256 in base64 is
JZNtlb7h2VT+rKWunurbXQOVWcU0yTAnA3lmtN7pwMs=.
The package was built from the previous deployed ZIP and changed only index.mjs,
document-context.mjs, and prompts/PROMPT-anthro-reading-review.txt.

Regenerated 223 vectors with text-embedding-3-small, 512 dimensions, using the
PromptHive bundled CLI and an isolated copy of the published compiled document.
Conditionally replaced only documents/compiled/anthropology/anthropology-reading.embeddings.json
in oatutor-runtime-course-docs. Verified embedding SHA256:
b3fa435ad4d122bebb9c7585795fc192b2bb7b638056bfd8832583b268632d5b.
The manifest, course plans, and compiled document remained byte-identical.

Seven successful synthetic model turns covered property/theft, a short follow-up,
universal consent, source structure, the third form of society, Lesson Reading,
and an unrelated Data 8 lesson. Six Anthropology turns used matching hybrid
embeddings and included 26 excerpt blocks in total. The actual final model payloads
matched the inclusion logs. The unrelated-course prompt received zero excerpt
blocks and no Anthropology document allowlist entry. There were no missing excerpts
or stale embeddings on the six Anthropology turns. One earlier harness request used
an invalid session-ID prefix and was rejected before retrieval/model invocation.

Answer inspection: the tutor correctly named Proudhon and the book, explained the
property argument, addressed universal consent using the passage, and used the
indexed source sections for structure. Some responses exceeded the requested
concise tutoring style. The study outline remains awaiting instructor review.
This is a bounded smoke test, not an exhaustive educational accuracy evaluation.

Private rollback artifacts and synthetic trace records are stored in PromptHive's
ignored instance/course-materials/backups/anthropology-rag-20261110 directory.
Older local re-ingestions differ from the published compiled document, so the new
sidecar was not copied onto those different compiled versions. They require their
own matching embedding generation when approved for publication. PromptHive's
source pipeline is updated; its deployed worker image was outside this live-update
scope and should be rebuilt from the updated source at its next deployment.

## Full-sequence follow-up

A user-supplied eight-turn trace exposed two further retrieval issues: fully stated
questions inherited unrelated prior-answer text, and equal passage budgets could
truncate the actual definition. The runtime now keeps history for referential
follow-ups, prioritizes explicitly named textbook sections and their opening
passages, and preserves the highest-ranked passage before sharing the remaining
budget. Chunk IDs and embedding inputs remain unchanged.

The approved follow-up replay completed ten model turns: the exact eight-question
sequence, deliberately incorrect feedback, and an unrelated-course check. The
conclusion definition reached the actual model payload, and the tutor correctly
answered liberty in the full conversation. There were ten successful context events.

That replay also exposed an answer-interpretation error: the tutor sometimes treated
labor as legitimizing the property right Proudhon criticizes. A further prompt
correction distinguishes quoted objections from the author's conclusions, explicitly
corrects prior assistant errors, and uses two exact source-checked statements from
the conclusion: “To speak more exactly, labor destroys property” and “Suppress
property while maintaining possession.” These constraints are not represented as an
instructor-reviewed study guide. The final prompt correction and four-turn grounding replay were subsequently approved and completed, as recorded below. Response length remains a
soft model instruction; the ten-turn replay sometimes exceeded 150 words.

## Final approved grounding replay

Deployed the source-checked prompt correction on the same Lambda. Current code SHA256
(base64): 8wmq6sKUYjKkA5gGe+iPtqyRWWIFxS05PepaPKKQnmM=.
Four gpt-4o turns in one fresh conversation checked property/theft, the overall
argument, deliberately incorrect feedback, and the liberty distinction. Normal
hybrid query embeddings were used; no document embeddings were regenerated and no
S3 content or configuration was written in this follow-up.

All four traces included reading excerpts and the new grounding constraints.
The final actual model payload included the sentence naming liberty. The model
correctly rejected labor as legitimizing the criticized property right, distinguished
possession, rejected the deliberately incorrect claims about property and communism,
and named liberty. Source grounding and section retrieval fixes are deployed.

Remaining limitations: the feedback called an answer with two incorrect claims
“partly correct” before correcting both, and one reply reached 162 words despite the
150-word instruction. Whole-book summaries still need instructor review for nuance
and ordering. These checks establish improvements on the reported regressions;
they do not certify every educational judgment. The proposed study outline remains
unreviewed. PromptHive's deployed worker image remains outside this deployment scope.

## Feedback and evidence continuity update

The reading tutor now classifies turns as explanations, quiz requests, hints, or
feedback. A quiz stores its actual question and included chunk IDs in the existing
conversation turn transaction. The next answer turn restores these IDs through the
same durable conversation store, rechecks them against the current lesson allowlist,
and adds new retrieval matches. Topic/lesson changes clear the pending quiz state.
Older conversations without this field continue using the existing history format.

The feedback rubric distinguishes Correct, Partly correct, Incorrect, and
Insufficient evidence. Partial credit requires a substantively correct point to be
identified. Unavailable evidence permits uncertainty rather than a guessed verdict.
A late system instruction applies the current task after conversation history.
The prompt targets 80–120 words with a 150-word ordinary-response limit and one
question. The new reading_turn_quality event records taskType, wordCount,
questionCount, verdict, exceedsWordBudget, multipleQuestions, and missingVerdict.
These are observable format diagnostics, not an automatic semantic grading verdict.
Responses are not truncated or automatically regenerated.

Local verification includes durable-state restart/failure recovery, retained-source
allowlist checks, lesson/topic switches, hint handling, late prompt placement, and
format diagnostics. PromptHive's bundled retrieval helper is kept identical.
A ten-turn live matrix is prepared for correct, partial, incorrect, unsupported,
short explanations, liberty, and unrelated-course tests. The ten-turn live matrix was subsequently approved and completed; results follow.

## Feedback matrix results and checked claim assessment

The ten-turn matrix verified saved quiz evidence reuse (five retained chunk IDs on
each quiz-answer turn), topic-switch clearing, unrelated-course exclusion, and
shorter replies. The nine Anthropology replies were all at most 136 words.
Correct and incorrect examples received the intended labels. The partial-credit
and unsupported-claim examples both incorrectly received Incorrect, even though
the final prompts contained the intended rubric. Those two cases failed acceptance.

A local revision now uses one structured Chat Completions call for feedback only.
The model decomposes the answer into atomic supported, contradicted, not_established,
or omitted claims and supplies exact evidence quotations. Code checks that each
supporting/contradicting quote occurs in an actual supplied course_context block,
then computes the overall verdict. An unsettled essential claim produces
Insufficient evidence. Supported plus contradicted/omitted claims produce Partly
correct. Malformed, refused, truncated, or unverifiable assessments return uncertainty
without another model call. This checks evidence provenance and rubric aggregation;
it does not independently prove that the model classified each claim correctly.

The existing content packet format is retained. Feedback is validated before its
text is sent, so the first visible feedback waits for the structured assessment.
Other reply types retain their existing streaming path. No separate grader call
is added. The reading_feedback_assessed event records the component assessments.
Local tests cover the four verdict rules, evidence fabrication, platform-instruction
exclusion, single-call behavior, and refusal/length-failure handling. Deployment of
this revision and four live checks are awaiting approval at this entry's writing.

## Structured assessment live verification on November 11, 2026

The approved four-call run returned the expected Incorrect and Insufficient evidence
verdicts for those two cases. Correct and partial cases returned the safe uncertainty
fallback, so those two acceptance cases remain failed. The first implementation's
fallback did not retain completion/validation failure details; the exact cause of
those two failures cannot be established from that run's records.

A local refinement now records completion finish reason, output-token usage, the
specific validation failure, and bounded unverified claim/quote details. Quote
normalization handles OCR word wrapping, typographic quotes, and superscript
footnotes while still rejecting changed words. The request limits evidence quotes
to short contiguous excerpts, targets at most four claims, and allows 2400 output
tokens to avoid cutting off the structured response. Local tests cover fabricated
quotes, missing choices, null claim records, refusal, truncation, diagnostics,
and the existing verdict calculations. A two-case targeted recheck is awaiting
approval; no additional model calls have been made beyond the approved four.

## Targeted rechecks completed on November 11, 2026

The approved two-case recheck passed. The correct answer returned Correct with
three supported atomic claims. The mixed answer returned Partly correct with one
supported and one contradicted claim, and identified the correct point explicitly.
All evidence quotes passed validation. Both model completions finished normally;
the replies contained 43 and 63 words and exactly one question each. The previous
structured run had already verified Incorrect (three contradicted claims) and
Insufficient evidence (two not_established claims). Those two cases were not called
again during the two-case budget. All four verdict outcomes now have verified live
examples across these runs.

Current Lambda code SHA256 (base64):
2MFtleBV8T9gMgDwF28ymG0bYkDT8selHg07eQ9B/Ks=.
The deployed validation refinement also retains diagnostic failure reasons and
bounded unverified claim details. The original two validation failures lack enough
retained detail to attribute their precise cause; the rechecks demonstrate success
after the refinement, not proof of which change resolved each original failure.

The final local regression suite passes, including deterministic verdict mapping,
quote provenance checks, OCR normalization, safe failure behavior, durable quiz
state, and source allowlists. These checks do not replace instructor review of
interpretations or guarantee that every future model claim assessment is correct.
The study outline remains awaiting instructor review. Rollback packages, synthetic
trace events, and acceptance-report.json are saved in the ignored PromptHive backup
directory recorded above. No S3 content/configuration was changed in these checks.


## Real conversation fallback diagnosed on November 11, 2026

CloudWatch for the reported Office Hours session, turn 9, recorded a normally
completed 102-token assessment with a contradicted claim, rejected because its
quote was not in the supplied passages. The quote came from the platform's
source-checked accuracy constraint, not the actual retrieved context. The quiz
had retained five generic passages; putting every retained passage first crowded
out fresh labor-section matches. This was not a truncation or question-count
failure. The evidence check correctly refused the unsupported quotation.

Local changes (not deployed): the pending server-owned quiz question now informs
retrieval; the top two current matches precede retained context. The grader sees
only retrieved course_context blocks and structured question/student-answer data,
excluding platform accuracy quotes, outlines, and previous assistant answers.
Quote validation remains strict; there is no automatic extra model call. Tests
cover instruction isolation, the logged rejected quotation, fresh-versus-retained
priority, unrelated-lesson exclusion, and optional replay against the actual
published Anthropology artifact. No further paid calls or AWS writes were made.
A new live deployment and bounded check still require approval.


## Evidence isolation deployed and checked on November 11, 2026

After explicit approval, deployed only index.mjs, agent-logic.mjs,
reading-assessment.mjs, and document-context.mjs over the verified live package,
guarded by its RevisionId. The new Lambda is Active/Successful with code SHA256
(base64): lCDWGgk2S+1UoyfUUT4lvHWHzM7OULs30ZuN1Yo6ScY=.

Exactly three approved gpt-4o turns with normal query embeddings ran in one fresh
Office Hours conversation: a labor/property quiz, the reported wrong answer, and
a corrected answer. The wrong answer returned Incorrect (44 words); the corrected
answer returned Correct (41 words). Both assessments completed normally and every
evidence quotation passed verification against retrieved passages. Both replies
contained one question. The named labor section reached the prompt first.
There was no validation fallback, extra grader call, S3 write, re-embedding, or
course/configuration change. This is targeted verification; partial/unsupported
cases and a full eight-question lead-in were not rerun within this three-turn budget.

Rollback/candidate ZIPs, bounded test results, CloudWatch events, deployment status,
and acceptance-report.json are retained in the ignored PromptHive backup folder
`anthropology-evidence-isolation-20261111`.


## Generic quizzes, whole-reading summaries, and polish (local changes)

Generic reading quizzes now use one structured, source-isolated generation call.
The model receives only this turn's retrieved passages and the current request,
not the Anthropology accuracy guards or previous assistant answers. The generated
question must cite one retrieved chunk ID and an exact contiguous quotation from
its passage text. Invalid IDs, metadata-only quotations, invented quotes, malformed
responses, refusals, and incomplete output fail closed without saving quiz state.
The evidence quote stays private. Only the verified question is shown, and only
its cited chunk is retained as quiz evidence. Logs record validation results and
bounded evidence. Quote provenance is checked in code; semantic support still
requires model judgment and instructor review, not merely a substring match.

Whole-reading intent is detected server-side for the Anthropology prompt. Retrieval
adds allowlisted passages for the liberty conclusion, labor, and consent alongside
current matches. Summaries use one structured call, with individually cited and
quote-verified progression points and a concluding point. Both the conclusion and
its verified quote must name liberty; the entire visible summary is bounded to
150 words. Missing evidence produces an explicit unavailable-overview response,
not an invented interpretation. The extracted outline remains explicitly unreviewed;
no instructor approval has been claimed or substituted with automated checks.
Other courses and ordinary explanatory streaming retain their existing paths.

Feedback addresses the learner as you/your. Quoted bibliographic question marks in
“What Is Property?” no longer count as extra follow-up questions, invalidate feedback,
or split the saved quiz question. Actual additional questions, including other quoted
questions, continue to count. Intent detection tolerates surrounding quotation marks.

These changes are not yet deployed. No new paid calls or cloud writes have been
made for this follow-up. The previous three-turn live verification describes the
currently deployed evidence-isolation release, not this new quiz/overview path.


## Five-turn quiz/overview rollout on November 11, 2026

Explicitly approved update deployed; exactly five live requests completed. The
whole-book summary included liberty and verified source quotes for its points.
The generic quiz selected the bee-society analogy from a supplied passage,
validated its quote, and retained only that cited chunk. The unrelated Data 8
lesson received zero allowed documents and zero Anthropology passages. Its
general-purpose tutor still discussed Proudhon from general knowledge; document
isolation does not implement a ban on discussing the author's public ideas.

The deliberately wrong bee answer and corrected answer both hit quote validation
fallbacks. Diagnostics identified a terminal period replacing a source semicolon,
then sentence-initial capitalization of a quoted clause. Added focused regressions
and normalized terminal punctuation and letter case while preserving contiguous
words, negation, and internal separators. All captured claims from both failed
turns now validate locally against their actual supplied passages, yielding
Incorrect and Correct. The captured explanations were not logged, so this replay
verifies the failed quote checks, not unseen full completions. The full local
suite passes (20 reading-context tests and 25 feedback/generation tests).

Final deployed Lambda code SHA256 (base64): mD5j9nKOuVi2tbUjMRQ7aOQqI5Ihnv11dwi3yZHn6z4=.
State Active, update Successful. The final normalization correction is deployed;
the exhausted five-turn budget prevents a fresh paid confirmation in this run.
Do not report all five live checks as passed. The wrong/correct grading cases
require a separately approved bounded recheck. No S3 or course-plan writes,
embedding regeneration, or infrastructure changes occurred. Rollback ZIPs,
results, captured events, source evidence, test output, and acceptance-report.json
are in the ignored PromptHive backup folder anthropology-quiz-overview-20261111.
The extracted outline remains unreviewed.


## Two approved grading rechecks passed on November 11, 2026

Confirmed the final deployed package hash remained
`mD5j9nKOuVi2tbUjMRQ7aOQqI5Ihnv11dwi3yZHn6z4=`. Exactly two additional
gpt-4o requests with normal query embeddings were explicitly approved and executed,
in two fresh self-assessment sessions quoting the actual generated bee question.
No extra quiz-generation request or deployment was performed. The wrong answer
returned Incorrect with three contradicted claims; the corrected answer returned
Correct with four supported claims. Every quotation passed source verification.
Both completions finished normally, with no validation fallback. Replies contained
40 and 44 words, one question each, and directly addressed the learner as you/your.
CloudWatch events, visible results, and the updated acceptance report are preserved
in the same ignored backup folder. These targeted checks complete the outstanding
live grading confirmation; they do not prove every possible model assessment or
replace instructor review of the still-unreviewed outline. No S3/configuration
writes, document re-embedding, or infrastructure changes occurred.
