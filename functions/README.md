# Feedback Slack notifications and local testing

`notifyDevelopersOfFeedback` listens for new `feedbacks/{feedbackId}` documents.
The `development_feedbacks` trigger is exported only in the Functions emulator.
Both use the same notification handler. There is no GitHub integration.

The Slack notification leads with the report ID, problem, and the user's feedback.
The current problem step and hint follow, then the lesson, access method,
screenshot status, and technical report details. Fields appear on separate lines;
missing optional fields and empty sections are omitted. Nested variables use
dotted names instead of raw JSON. The full list of problem steps is summarized
as a count; expected answers and knowledge components are omitted.
The currently active problem step is included separately (number, ID, question,
answer type and completion state), along with the selected hint and sub-hint.
If no hint is selected, the highest-numbered viewed hint is explicitly labeled
as a fallback. These are UI snapshots at submission time, not the full answer
or chat history. Canvas access is reported from the LMS platform metadata;
an LMS launch with no platform identifier is labeled unknown, not assumed Canvas.
It excludes learner/LTI identifiers and LMS course membership.
If the launch supplies an LTI version, the Access section shows it. The client
also saves a bounded diagnostic snapshot at submission: approximate browser and
OS, viewport and screen dimensions, pixel ratio, route, language, time zone,
online/embedded state, step-result counts, hint count, visible UI panels, lesson
ID and problem seed. Device labels describe the viewport layout, not a verified
physical device. The Slack report links to `/#/debug/<problemID>` on the OATutor
site; this opens the problem but does not restore the learner's randomized state.
The link accepts only the known OATutor host or local emulator hosts. Neither the
page query string nor the launch JWT, browser storage, student answers or chat
history are copied into diagnostics.
Text is bounded and rendered using Slack `rich_text` blocks with bold headings
in separate paragraphs and literal text elements that preserve line breaks.
User input is not parsed as Slack markup. Email addresses and HTTP(S)
links are redacted; the validated debug-view link is the only exception. This is
basic sanitization, not comprehensive detection of
personal information that a user might type into free text.

## Optional screenshots

The feedback form accepts an optional PNG/JPEG/WebP image up to 5 MB and shows a
preview with a remove button. It resizes the image to at most 1,600 pixels on the
longest side, re-encodes it as JPEG (removing source metadata), and limits its
data URL to 280,000 characters. The image is stored on the feedback document.
Users choose the image explicitly; the app does not silently capture their screen.
Image pixels are not automatically redacted, so the form asks users to attach
only the problem area. Screenshot data is not included in the webhook text.

An incoming webhook cannot upload the local screenshot bytes. To send images
to Slack, configure the same Slack app with `files:write`, install/reinstall it
as needed, and invite its bot to the dedicated test channel. Add to
`functions/.secret.local`:

```dotenv
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

Add to `functions/.env.local` (this file is also Git-ignored):

```dotenv
SLACK_SCREENSHOTS_ENABLED=true
SLACK_SCREENSHOT_CHANNEL_ID=C_YOUR_TEST_CHANNEL_ID
```

Use the same channel as the existing webhook, then restart the emulators.
For deployment, set the two non-secret settings in the functions environment
and create `SLACK_BOT_TOKEN` in that Firebase project's Secret Manager. Both
settings must be present during function discovery/deployment and execution.

The backend uses Slack's `files.getUploadURLExternal` and
`files.completeUploadExternal` flow to share a separate screenshot attachment
in the configured channel, labeled with the report ID. It does not publish a
public image URL. Text delivery is tracked independently from image delivery
through `notifications.slackScreenshotStatus`, `slackScreenshotSent`,
`slackScreenshotSentAt` and `slackScreenshotFileId`.

Without this configuration, reports and text notifications still work; the
notification says the image is saved with the Firestore report and image status
is `not_configured`. Upload failures set status `failed`; a retried function
attempts the image again without repeating acknowledged text. The emulator's
development trigger does not automatically retry, so create a new local report
after fixing configuration. A crash around an acknowledged upload can still
produce duplicate files, just as webhook delivery can produce duplicate text.

Reference: [Slack file uploads](https://docs.slack.dev/messaging/working-with-files/).

## Run locally

Requires Node 22, Java 21 or newer, and the root frontend dependencies.
From the repository root:

```sh
npm --prefix functions install
cp functions/.secret.local.example functions/.secret.local
# Replace the placeholder with a webhook for a private Slack test channel.
npm --prefix functions run emulators
```

Keep this command running in its own terminal while using the local feedback
form. If the Firestore emulator stops, the form cannot save a report.

The Firebase CLI is installed locally in `functions`; no global installation or
Firebase login is needed for this demo project. The first run downloads emulators.
`functions/.secret.local` is ignored by Git. Never put the webhook in a
`REACT_APP_*` variable, since those are included in browser bundles.

In `.env.development.local` at the repository root, set:

```dotenv
REACT_APP_USE_FIREBASE_EMULATOR=true
```

Restart `npm start`. With this opt-in flag, a development build uses a separate
Firebase app with project ID `demo-oat-local`, connects to `127.0.0.1:8080`, and
writes to `development_feedbacks`. It does not use production credentials or
fall back to production when the emulator is unavailable. Production builds
ignore the flag. Remove the local flag and restart to return to normal behavior.

- Frontend: http://localhost:3001
- Emulator UI: http://127.0.0.1:4000
- Firestore: `127.0.0.1:8080`
- Functions: `127.0.0.1:5001`

The emulator intentionally uses its default open rules, bound to loopback, for
the demo project. This configuration contains no deployable Firestore rules and
does not test production authorization rules.

## Verify

In the Emulator UI, create a `feedbacks` document with:

```json
{
  "feedback": "Local Slack notification test",
  "problemID": "local-test-problem",
  "siteVersion": "local",
  "problemFinished": false
}
```

Confirm the trigger runs, the private test channel receives the message, and the
document gains `notifications.slackSent: true` and `notifications.slackSentAt`.
Then submit the actual frontend feedback form and check `development_feedbacks`.
No production document or GitHub issue should be created.

Automated checks:

```sh
npm --prefix functions test
# With emulators running and a real test-channel webhook configured:
npm --prefix functions run test:emulator
```

The integration script creates two reports (and therefore sends two Slack
messages): one directly in `feedbacks`, one through the frontend's actual
`Firebase.submitFeedback` method into `development_feedbacks`. It verifies the
project/host, document creation, and Slack sent flags/timestamps. It does not
replace clicking the form in a browser or visually checking Slack.

Without a webhook, set `SLACK_WEBHOOK_URL=UNCONFIGURED` in `.secret.local` and run
`npm --prefix functions run test:emulator -- --expect-unconfigured` to verify
local writes only. Trigger logs should report the missing webhook; sent flags
must not be set. Use the nonempty sentinel: an empty value causes the Firebase
CLI to attempt a Secret Manager lookup. After configuring the webhook, restart the emulators and
create new reports, since document creation triggers do not rerun on edits.

Delivery failures throw, leaving the sent flag unset. The production trigger
enables retries and skips documents already marked as sent. Firestore events
are delivered at least once: concurrent invocations, or a crash between Slack
accepting a message and the Firestore status update, can still produce duplicates.
Incoming webhooks do not provide transactional exactly-once delivery.

## Production rollout

Nothing is deployed by the local setup. The production site must write to the
same Firebase project where `notifyDevelopersOfFeedback` is deployed. The
existing production frontend workflow is unchanged and uses the GitHub secret
`STAGING_FIREBASE_CONFIG` for its Firebase web-app config despite its name.
Verify that secret's `projectId` is the intended production project. The
separate Functions deployment checks that it matches
`PRODUCTION_FIREBASE_PROJECT_ID` before deploying.

Before running the separate Functions workflow, configure these in GitHub's
`production` environment (the frontend workflow can continue using its
existing repository secret):

- Secret `STAGING_FIREBASE_CONFIG`: the same web-app config used by the existing
  production frontend workflow, as a JSON object with `projectId`, `apiKey`,
  and `appId`.
- Variable `PRODUCTION_FIREBASE_PROJECT_ID`: that same Firebase project ID.
- Variable `SLACK_SCREENSHOT_CHANNEL_ID`: the intended production Slack channel
  ID. Invite the Slack bot to that channel and grant it `files:write`.
- Secret `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`: a Google service-account JSON key
  authorized to deploy Firebase Functions in that project. The manual workflow
  uses it as Application Default Credentials; keep it out of the frontend.

The production Firebase project must be on the Blaze plan. In that project,
create the backend secrets with the Firebase CLI; enter the values at its
prompts, rather than passing them as command-line arguments:

```sh
./functions/node_modules/.bin/firebase functions:secrets:set SLACK_WEBHOOK_URL --project YOUR_PRODUCTION_PROJECT_ID
./functions/node_modules/.bin/firebase functions:secrets:set SLACK_BOT_TOKEN --project YOUR_PRODUCTION_PROJECT_ID
```

Use a webhook for the intended production channel. The bot token must belong
to the Slack app authorized to upload there. The local `.secret.local` and
`.env.local` files are emulator-only; they do not configure deployed functions.
The `Deploy feedback notifications` GitHub workflow generates
`functions/.env.<project-id>` from the production channel variable and deploys
only the `feedback` Functions codebase. It runs only when manually selected in
Actions. To deploy from a local terminal instead, copy
`functions/.env.production.example` to `functions/.env.<project-id>`, replace the
channel placeholder, run `npm --prefix functions ci` and
`npm --prefix functions test`, then run:

```sh
./functions/node_modules/.bin/firebase deploy --only functions:feedback --project YOUR_PRODUCTION_PROJECT_ID
```

Review the live Firestore rules before rollout. This repository has no
production rules file; the demo emulator's open rules do not verify production
permissions. Users must be able to create `feedbacks` documents, while report
contents and screenshots should not be publicly readable and clients should
not be able to forge `notifications` delivery fields. Screenshots are stored
on the report document, so test that realistic reports stay within Firestore's
1 MiB document limit. Set the function region near the production Firestore
database if its location differs from the current default.

Deploy the function before publishing the updated frontend when possible. The
frontend push workflow does not deploy Functions, so if it runs first, reports
will still save but new Slack notifications will not start until the separate
Functions deployment completes. Then submit one controlled report through the
live form and verify the `feedbacks` document, Slack message and screenshot,
`notifications` fields, and Functions logs. Existing documents do not trigger
`onDocumentCreated` when the function is deployed.

References: [Firebase local functions](https://firebase.google.com/docs/functions/local-emulator),
[local secrets](https://firebase.google.com/docs/functions/config-env#secrets_and_credentials_in_the_cloud_functions_emulator),
[matching demo project IDs](https://firebase.google.com/docs/emulator-suite/connect_firestore#choose_a_firebase_project),
[Slack incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/).
