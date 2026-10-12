const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createScreenshotUploader, screenshotBytes } = require("../screenshots");
const screenshot = { dataUrl: "data:image/jpeg;base64," + Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64") };

test("screenshots reject arbitrary URLs, oversized payloads, and non-JPEG content", () => {
    for (const dataUrl of ["https://example.com/image.jpg", "data:image/jpeg;base64,YWJjZA==", "data:image/png;base64,AAAA", "x".repeat(280001)]) {
        assert.throws(() => screenshotBytes({ dataUrl }));
    }
});

test("screenshot upload uses Slack's upload and completion flow for the configured channel", async () => {
    const calls = [];
    const uploader = createScreenshotUploader({ botToken: () => "test-token", channelId: () => "C123TEST",
        fetchImpl: async (url, options) => {
            calls.push({ url: String(url), options });
            return { ok: true, json: async () => calls.length === 1
                ? { ok: true, upload_url: "https://files.slack.com/upload/v1/test", file_id: "F123TEST" }
                : { ok: true } };
        },
    });
    assert.equal(await uploader(screenshot, "report-1"), "F123TEST");
    assert.equal(calls.length, 3);
    assert.equal(calls[0].options.headers.Authorization, "Bearer test-token");
    assert.equal(calls[1].options.headers.Authorization, undefined);
    assert.ok(Buffer.isBuffer(calls[1].options.body));
    assert.equal(new URLSearchParams(calls[2].options.body).get("channel_id"), "C123TEST");
});

test("a file is never sent to an unexpected host and credential-bearing errors are hidden", async () => {
    let calls = 0;
    const uploader = createScreenshotUploader({ botToken: () => "private-token", channelId: () => "C123TEST",
        fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ ok: true, upload_url: "https://example.com/upload/file", file_id: "F123TEST" }) }; },
    });
    await assert.rejects(uploader(screenshot, "test"), /invalid screenshot upload destination/);
    assert.equal(calls, 1);
    const failing = createScreenshotUploader({ botToken: () => "private-token", channelId: () => "C123TEST",
        fetchImpl: () => { throw new Error("private-token"); },
    });
    await assert.rejects(failing(screenshot, "test"), error => !error.message.includes("private-token"));
});
