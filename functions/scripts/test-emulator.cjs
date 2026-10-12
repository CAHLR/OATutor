// Exercises the real frontend Firebase class and both Firestore triggers.
// Requires root frontend dependencies as well as running emulators.
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "../..");
const requireFrontend = createRequire(path.join(root, "package.json"));
const babel = requireFrontend("@babel/core");
const { doc, setDoc, getDoc, terminate } = requireFrontend("firebase/firestore");

process.env.NODE_ENV = "development";
process.env.REACT_APP_USE_FIREBASE_EMULATOR = "true";
// Even an incorrectly inherited production build type must stay local.
process.env.REACT_APP_BUILD_TYPE = "production";

const originalLoader = require.extensions[".js"];
const frontendLoader = (module, filename) => {
    if (filename.startsWith(path.join(root, "src") + path.sep) ||
        filename.startsWith(path.join(root, "common") + path.sep)) {
        const { code } = babel.transformFileSync(filename, {
            babelrc: false,
            configFile: false,
            presets: [[requireFrontend.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
        });
        module._compile(code, filename);
    } else {
        originalLoader(module, filename);
    }
};
require.extensions[".js"] = frontendLoader;
const Firebase = requireFrontend("./src/components/Firebase.js").default;
const { buildFeedbackContext } = requireFrontend("./src/util/feedbackContext.js");
require.extensions[".js"] = originalLoader;

async function main() {
    const expectUnconfigured = process.argv.includes("--expect-unconfigured");
    if (expectUnconfigured) {
        const secret = fs.readFileSync(path.join(root, "functions/.secret.local"), "utf8");
        assert.match(secret, /^SLACK_WEBHOOK_URL=UNCONFIGURED\s*$/m,
            "Only use --expect-unconfigured with the UNCONFIGURED local webhook sentinel.");
    }
    const client = new Firebase("local-test-user", {}, "local-test", "local", {
        user_id: "synthetic-canvas-user", tool_consumer_info_product_family_code: "canvas",
    });
    // A second instance must reuse the emulator connection without reconfiguring it.
    const secondClient = new Firebase("second-local-test-user", {}, "local-test", "local", null);
    assert.equal(client.db, secondClient.db);
    assert.equal(client.db.app.options.projectId, "demo-oat-local");
    assert.equal(client.db._settings.host, "127.0.0.1:8080");
    assert.equal(client.db._settings.ssl, false);
    assert.equal(client.getCollectionName("feedbacks"), "development_feedbacks");

    const id = `local-slack-test-${Date.now()}`;
    const report = {
        feedback: "Local report-context test: active problem step, hint/sub-hint, and Canvas launch. Synthetic data only.",
        problemID: "local-test-problem",
        siteVersion: "local",
        problemFinished: false,
    };
    const steps = [{ id: "local-step-1", stepTitle: "Solve the equation", stepBody: "x + 2 = 4", answerType: "number" }];
    const reportContext = buildFeedbackContext({ steps }, {
        stepStates: { 0: false }, feedbackHintsByStep: { 0: {
            id: "local-hint-1", number: 1, title: "Isolate x", text: "Subtract 2 from both sides", type: "scaffold",
            subHint: { id: "local-subhint-1", number: 1, text: "Apply the same operation on both sides" },
        } },
    }, { step: steps[0], stepIndex: 0 });
    report.reportContext = reportContext;
    report.access = { accessedViaCanvas: false, source: "Direct / no LTI launch" };
    try {
        await setDoc(doc(client.db, "feedbacks", id), report);
        client._getReadableID = () => id;
        await client.submitFeedback(report.problemID, report.feedback, false, { x: 2 }, "local-test", steps, "local-test", reportContext);
        // React hot reload re-evaluates Firebase.js while the named app and
        // its already-started Firestore instance remain alive.
        const firebaseModulePath = requireFrontend.resolve("./src/components/Firebase.js");
        delete require.cache[firebaseModulePath];
        require.extensions[".js"] = frontendLoader;
        let ReloadedFirebase;
        try {
            ReloadedFirebase = requireFrontend("./src/components/Firebase.js").default;
        } finally {
            require.extensions[".js"] = originalLoader;
        }
        const reloadedClient = new ReloadedFirebase("reloaded-local-test-user", {}, "local-test", "local", null);
        assert.equal(reloadedClient.db, client.db);
        for (const collection of ["feedbacks", "development_feedbacks"]) {
            const reference = doc(client.db, collection, id);
            let snapshot = await getDoc(reference);
            assert.equal(snapshot.exists(), true);
            assert.equal(snapshot.data().feedback, report.feedback);
            assert.equal(snapshot.data().reportContext.activeStep.id, "local-step-1");
            assert.equal(snapshot.data().reportContext.hint.subHint.id, "local-subhint-1");
            assert.equal(snapshot.data().access.accessedViaCanvas, collection === "development_feedbacks");
            console.log(`Created demo-oat-local/${collection}/${id}`);
            if (!expectUnconfigured) {
                const deadline = Date.now() + 30000;
                while (!snapshot.data().notifications?.slackSent && Date.now() < deadline) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    snapshot = await getDoc(reference);
                }
                assert.equal(snapshot.data().notifications?.slackSent, true, "Slack delivery was not acknowledged; check emulator logs.");
                assert.ok(snapshot.data().notifications.slackSentAt.toMillis() > 0);
                console.log(`PASS: Slack acknowledged ${collection}; sent flag and timestamp saved.`);
            } else {
                assert.notEqual(snapshot.data().notifications?.slackSent, true);
            }
        }
        if (expectUnconfigured) {
            console.log("PASS: both local writes and frontend isolation. Slack delivery NOT tested (webhook is unconfigured). Check Functions logs for trigger execution.");
        }
    } finally {
        await terminate(client.db);
    }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
