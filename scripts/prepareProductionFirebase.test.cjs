const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { productionConfig, functionsEnvironment, main } = require("./prepareProductionFirebase.cjs");

const projectId = "oatutor-production-test";
const config = JSON.stringify({
    projectId, apiKey: "public-test-key", appId: "test-app-id", authDomain: "test.firebaseapp.com",
    private_key: "must-not-reach-the-browser",
});

test("Functions target rejects a Firebase project mismatch", () => {
    assert.throws(() => productionConfig(config, "another-project"), /must match/);
    assert.throws(() => productionConfig("not json", projectId), /raw JSON/);
    assert.equal(productionConfig(config, projectId), projectId);
});

test("production preparation writes only Functions settings", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "oatutor-production-config-"));
    fs.mkdirSync(path.join(root, "functions"));
    const previous = {
        FRONTEND_FIREBASE_CONFIG: process.env.FRONTEND_FIREBASE_CONFIG,
        PRODUCTION_FIREBASE_PROJECT_ID: process.env.PRODUCTION_FIREBASE_PROJECT_ID,
        SLACK_SCREENSHOT_CHANNEL_ID: process.env.SLACK_SCREENSHOT_CHANNEL_ID,
    };
    try {
        process.env.FRONTEND_FIREBASE_CONFIG = config;
        process.env.PRODUCTION_FIREBASE_PROJECT_ID = projectId;
        process.env.SLACK_SCREENSHOT_CHANNEL_ID = "C1234567890";
        main(root);
        const backend = fs.readFileSync(path.join(root, "functions", `.env.${projectId}`), "utf8");
        assert.equal(backend, functionsEnvironment("C1234567890"));
        assert.throws(() => functionsEnvironment("not-a-channel"), /channel ID/);
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
        fs.rmSync(root, { recursive: true, force: true });
    }
});
