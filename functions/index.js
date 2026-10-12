const { initializeApp } = require("firebase-admin/app");
const { FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { createNotifier } = require("./slack");
const { createScreenshotUploader } = require("./screenshots");

initializeApp();
const SLACK_WEBHOOK_URL = defineSecret("SLACK_WEBHOOK_URL");
// Opt-in so existing text-only installations do not require a second secret.
const screenshotsEnabled = process.env.SLACK_SCREENSHOTS_ENABLED === "true";
const SLACK_BOT_TOKEN = screenshotsEnabled ? defineSecret("SLACK_BOT_TOKEN") : null;
const secrets = [SLACK_WEBHOOK_URL, ...(SLACK_BOT_TOKEN ? [SLACK_BOT_TOKEN] : [])];
const notifyDevelopers = createNotifier({
    webhookUrl: () => SLACK_WEBHOOK_URL.value(),
    serverTimestamp: () => FieldValue.serverTimestamp(),
    uploadScreenshot: screenshotsEnabled ? createScreenshotUploader({
        botToken: () => SLACK_BOT_TOKEN.value(),
        channelId: () => process.env.SLACK_SCREENSHOT_CHANNEL_ID,
    }) : null,
});

exports.notifyDevelopersOfFeedback = onDocumentCreated(
    {
        document: "feedbacks/{feedbackId}",
        secrets,
        retry: true,
    },
    notifyDevelopers
);

// This trigger is only for testing the development frontend locally.
if (process.env.FUNCTIONS_EMULATOR === "true") {
    exports.notifyDevelopersOfDevelopmentFeedback = onDocumentCreated(
        {
            document: "development_feedbacks/{feedbackId}",
            secrets,
        },
        notifyDevelopers
    );
}
