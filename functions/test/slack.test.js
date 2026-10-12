const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildSlackMessage, createNotifier } = require("../slack");

const webhook = "https://hooks.slack.com/services/test/only/fake";
function fixture({ sent = false, response = { ok: true, status: 200, text: async () => "ok" } } = {}) {
    const posts = [];
    const updates = [];
    const event = { data: {
        data: () => ({ feedback: "Local Slack notification test", problemID: "test" }),
        ref: {
            get: async () => ({ exists: true, data: () => ({ notifications: { slackSent: sent } }) }),
            update: async (value) => updates.push(value),
        },
    } };
    const notify = createNotifier({
        webhookUrl: () => webhook,
        serverTimestamp: () => "server timestamp",
        fetchImpl: async (url, options) => { posts.push({ url, options }); return response; },
    });
    return { posts, updates, event, notify };
}

test("notification allowlists fields, redacts links/email, disables Slack markup, and stays within limits", () => {
    const payload = buildSlackMessage({
        feedback: "<!channel> contact learner@example.com https://example.com/secret " + "x".repeat(5000),
        problemID: "test",
        siteVersion: "local",
        problemFinished: false,
        oats_user_id: "private-user-id",
        lms_user_id: "private-lms-id",
        steps: [{ id: "hidden-step-id", stepAnswer: "private-answer", knowledgeComponents: ["hidden-component"] }],
        variables: { slope: 2, intercept: -3, nested: { enabled: false, token: "private-token" } },
    });
    const serialized = JSON.stringify(payload);
    for (const value of ["learner@example.com", "https://example.com", "private-user-id", "private-lms-id", "private-answer", "hidden-step-id", "hidden-component", "private-token"]) {
        assert.ok(!serialized.includes(value));
    }
    assert.deepEqual(payload.blocks[0].elements[0], {
        type: "rich_text_section",
        elements: [{ type: "text", text: "New OATutor feedback\n", style: { bold: true } }],
    });
    assert.ok(payload.blocks[0].elements[1].elements[0].text.startsWith("Report ID:"));
    for (const block of payload.blocks) {
        assert.equal(block.type, "rich_text");
        for (const section of block.elements) {
            assert.equal(section.type, "rich_text_section");
            for (const element of section.elements) {
                assert.equal(element.type, "text");
                assert.ok(element.text.length <= 2800);
            }
        }
    }
    assert.equal(payload.unfurl_links, false);
    const text = payload.blocks.flatMap((block) => block.elements.map((section) =>
        section.elements.map((element) => element.text).join("")
    )).join("\n");
    assert.ok(text.includes("Problem: test\nProblem finished: no\nNumber of steps: 1"));
    assert.ok(text.includes("slope: 2\nintercept: -3\nnested.enabled: false\nnested.token: [redacted]"));
    assert.ok(text.indexOf("Feedback\n") < text.indexOf("Current problem step\n"));
    assert.ok(text.indexOf("Report details\n") > text.indexOf("Screenshot\n"));
    assert.ok(!text.includes("Site version: Not provided"));
    assert.ok(!text.includes("Hint ID: Not provided"));
    assert.ok(!text.includes("Timestamps (UTC)\n"));
});

test("only an acknowledged Slack delivery sets the sent flag and timestamp", async () => {
    const { notify, event, posts, updates } = fixture();
    await notify(event);
    assert.equal(posts.length, 1);
    assert.equal(posts[0].options.method, "POST");
    assert.deepEqual(updates, [{ "notifications.slackSent": true, "notifications.slackSentAt": "server timestamp" }]);
});

test("report step, hint, Canvas access and screenshot status are included without image bytes", () => {
    const payload = buildSlackMessage({
        access: { accessedViaCanvas: true, source: "Canvas LTI launch", platform: "canvas", user_id: "private-user" },
        screenshot: { dataUrl: "private-image-data" },
        reportContext: { activeStep: { id: "step-3", number: 3, total: 4, body: "Find x" },
            hint: { id: "hint-2", number: 2, text: "Subtract 1", subHint: { id: "subhint-1", number: 1, text: "Both sides" } }, viewedHintCount: 2 },
    });
    const text = JSON.stringify(payload);
    for (const value of ["step-3", "3 of 4", "hint-2", "subhint-1", "Canvas LTI launch", "Accessed through Canvas: Yes"]) assert.ok(text.includes(value));
    for (const value of ["private-user", "private-image-data"]) assert.ok(!text.includes(value));
});

test("diagnostics include version, browser, dimensions, state, and a safe problem link", () => {
    const problemUrl = "https://cahlr.github.io/OATutor/#/debug/test";
    const payload = buildSlackMessage({ problemID: "test", feedback: "Something broke",
        access: { accessedViaCanvas: true, ltiVersion: "1.3.0" },
        client: { browser: "Chrome 124", operatingSystem: "Windows", layout: "Desktop-sized layout",
            viewport: { width: 1280, height: 720, devicePixelRatio: 2 },
            screen: { width: 1440, height: 900 }, embedded: true, route: "#/lessons/one", problemUrl },
        reportContext: { stateSummary: { correctSteps: 1, incorrectSteps: 2, viewedHints: 3, agentChatVisible: true },
            platformState: { lessonId: "lesson-1", drawerOpen: false, problemSeed: "123" } },
    });
    const serialized = JSON.stringify(payload);
    for (const value of ["LTI version: 1.3.0", "Browser: Chrome 124", "Operating system: Windows",
        "Viewport (CSS px): 1280 × 720", "Viewed hints: 3", "Problem seed: 123"]) assert.ok(serialized.includes(value));
    const links = payload.blocks.flatMap(block => block.elements.flatMap(section => section.elements))
        .filter(element => element.type === "link");
    assert.deepEqual(links, [{ type: "link", url: problemUrl, text: problemUrl }]);
    const unsafe = buildSlackMessage({ problemID: "test", client: { problemUrl: "https://evil.example/#/debug/test?token=private" } });
    assert.ok(!JSON.stringify(unsafe).includes("evil.example"));
    const leakedQuery = buildSlackMessage({ problemID: "test", client: { problemUrl: "https://cahlr.github.io/OATutor/?token=private#/debug/test" } });
    assert.ok(!JSON.stringify(leakedQuery).includes("private"));
});

test("retrying a screenshot failure does not resend an acknowledged text notification", async () => {
    const saved = { notifications: {} };
    let posts = 0;
    let uploads = 0;
    const event = { data: { data: () => ({ screenshot: { dataUrl: "test-image" } }), ref: {
        get: async () => ({ exists: true, data: () => saved }),
        update: async fields => { for (const [key, value] of Object.entries(fields)) saved.notifications[key.split(".")[1]] = value; },
    } } };
    const notify = createNotifier({ webhookUrl: () => webhook, serverTimestamp: () => "timestamp",
        fetchImpl: async () => { posts++; return { ok: true, text: async () => "ok" }; },
        uploadScreenshot: async () => { uploads++; if (uploads === 1) throw new Error("test failure"); return "F123"; },
    });
    await assert.rejects(notify(event), /screenshot delivery failed/);
    assert.equal(saved.notifications.slackSent, true);
    assert.equal(saved.notifications.slackScreenshotStatus, "failed");
    await notify(event);
    assert.equal(posts, 1);
    assert.equal(saved.notifications.slackScreenshotSent, true);
    await notify(event);
    assert.equal(uploads, 2);
});

test("an already delivered event does not post again", async () => {
    const { notify, event, posts, updates } = fixture({ sent: true });
    await notify(event);
    assert.equal(posts.length, 0);
    assert.equal(updates.length, 0);
});

test("Slack errors leave the report unsent so delivery can be retried", async () => {
    for (const response of [
        { ok: false, status: 429, text: async () => "rate_limited" },
        { ok: true, status: 200, text: async () => "unexpected" },
    ]) {
        const { notify, event, updates } = fixture({ response });
        await assert.rejects(notify(event), /Slack rejected/);
        assert.equal(updates.length, 0);
    }
});

test("invalid secrets fail before network access and errors do not expose the credential", async () => {
    const { event } = fixture();
    const notify = createNotifier({
        webhookUrl: () => "https://example.com/secret-credential",
        serverTimestamp: () => null,
        fetchImpl: () => { assert.fail("must not send to arbitrary endpoints"); },
    });
    await assert.rejects(notify(event), (error) => !error.message.includes("secret-credential"));
    const failingNotify = createNotifier({
        webhookUrl: () => webhook,
        serverTimestamp: () => null,
        fetchImpl: () => { throw new Error(webhook); },
    });
    await assert.rejects(failingNotify(event), (error) => !error.message.includes(webhook));
});
