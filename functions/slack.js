const PRIVATE_FIELD = /^(oats_user_id|lms_user_id|lis_result_sourcedid|course_id|course_name|course_code|email|password|token|access_token|refresh_token|authorization|api_key|apikey|secret|slack_webhook_url)$/i;

function sanitizedText(value) {
    if (value === null || value === undefined || value === "") return "Not provided";
    const text = typeof value === "string" ? value : JSON.stringify(value, (key, item) =>
        PRIVATE_FIELD.test(key) ? "[redacted]" : item, 2);
    return text
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
        .replace(/https?:\/\/[^\s"<>]+/gi, "[link redacted]")
        .replace(/(?<![A-Z0-9._%+-])[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]") || "Not provided";
}

function readableDetails(value, prefix = "") {
    if (value === null || typeof value !== "object") return sanitizedText(value);
    const entries = Object.entries(value);
    if (!entries.length) return Array.isArray(value) ? "None" : "Not provided";
    return entries.map(([key, item]) => {
        const label = prefix ? `${prefix}.${key}` : key;
        if (PRIVATE_FIELD.test(key)) return `${label}: [redacted]`;
        if (item !== null && typeof item === "object" && Object.keys(item).length) {
            return readableDetails(item, label);
        }
        return `${label}: ${sanitizedText(item)}`;
    }).join("\n");
}

function boundedText(value, limit) {
    const text = sanitizedText(value);
    const suffix = "\n[Truncated for Slack; full value is in the Firestore report.]";
    return text.length <= limit ? text : text.slice(0, limit - suffix.length) + suffix;
}

function timestampText(value) {
    if (value === null || value === undefined || value === "") return "Not provided";
    try {
        const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
        return Number.isNaN(date.getTime()) ? "Invalid timestamp" : date.toISOString();
    } catch {
        return "Invalid timestamp";
    }
}

function safeProblemLink(value, problemId) {
    if (typeof value !== "string" || typeof problemId !== "string" ||
        !/^[A-Za-z0-9._-]{1,100}$/.test(problemId)) return null;
    try {
        const url = new URL(value);
        const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        if ((!local && (url.protocol !== "https:" || url.hostname !== "cahlr.github.io")) ||
            (local && !["http:", "https:"].includes(url.protocol)) ||
            url.username || url.password || url.search ||
            !/^\/[A-Za-z0-9/_-]{0,150}$/.test(url.pathname) ||
            url.hash !== `#/debug/${encodeURIComponent(problemId)}`) return null;
        return url.href;
    } catch {
        return null;
    }
}

function buildSlackMessage(data, context = {}) {
    const blocks = [];
    function section(title, text, limit) {
        const content = boundedText(text, limit);
        // Keep headings and values as literal rich text, so feedback cannot
        // turn into mentions or other Slack markup.
        for (let offset = 0; offset < content.length; offset += 2800) {
            const elements = [];
            if (offset === 0) {
                elements.push({
                    type: "rich_text_section",
                    elements: [{ type: "text", text: `${title}\n`, style: { bold: true } }],
                });
            }
            elements.push({
                type: "rich_text_section",
                elements: [{ type: "text", text: content.slice(offset, offset + 2800) }],
            });
            blocks.push({ type: "rich_text", elements });
        }
    }
    const field = (label, value, limit = 500) => {
        const separator = value !== null && typeof value === "object" ? "\n" : " ";
        return `${label}:${separator}${boundedText(readableDetails(value), limit)}`;
    };
    const present = (value) => value !== null && value !== undefined && value !== "";
    const optionalFields = (entries) => entries
        .filter(([, value]) => present(value))
        .map(([label, value, limit]) => field(label, value, limit));
    const finished = data.problemFinished === true ? "yes" : data.problemFinished === false ? "no" : "Not provided";
    section("New OATutor feedback", [
        field("Report ID", context.feedbackId),
        field("Problem", data.problemID),
        ...optionalFields([
            ["Status", data.status],
            ["Problem finished", data.problemFinished === undefined ? undefined : finished],
            ["Number of steps", Array.isArray(data.steps) ? data.steps.length : undefined],
        ]),
    ].join("\n"), 2500);
    const problemLink = safeProblemLink(data.client?.problemUrl, data.problemID);
    if (problemLink) blocks.push({ type: "rich_text", elements: [
        { type: "rich_text_section", elements: [{ type: "text", text: "Problem link (debug view)\n", style: { bold: true } }] },
        { type: "rich_text_section", elements: [{ type: "link", url: problemLink, text: problemLink }] },
    ] });
    section("Feedback", data.feedback, 9000);
    const step = data.reportContext?.activeStep;
    const hint = data.reportContext?.hint;
    section("Current problem step", step ? optionalFields([
        ["Step", step.number == null ? undefined : `${step.number} of ${step.total}`],
        ["Title", step.title],
        ["Question", step.body, 2000],
        ["Result", step.result],
        ["Answer type", step.answerType],
        ["Step ID", step.id],
    ]).join("\n") || "No step details captured" : "No step details captured", 4000);
    section("Hint at submission", hint ? optionalFields([
        ["Hint state", hint.status],
        ["Hint number", hint.number],
        ["Title", hint.title],
        ["Hint text", hint.text, 2000],
        ["Sub-hint", hint.subHint?.text, 1500],
        ["Sub-hint number", hint.subHint?.number],
        ["Hint type", hint.type],
        ["Hint ID", hint.id],
        ["Sub-hint ID", hint.subHint?.id],
        ["Hint's problem step", hint.problemStepId],
        ["Hints viewed for current step", data.reportContext?.viewedHintCount],
    ]).join("\n") || "No hint details captured" : "No hint captured", 5000);
    const problemContext = optionalFields([
        ["Content / curriculum", data.Content],
        ["Lesson", data.lesson, 2000],
    ]);
    if (problemContext.length) section("Problem context", problemContext.join("\n"), 2600);
    section("Access", [
        field("Accessed through Canvas", data.access?.accessedViaCanvas === true ? "Yes" : data.access?.accessedViaCanvas === false ? "No" : "Unknown"),
        ...optionalFields([
            ["Launch source", data.access?.source],
            ["LMS platform", data.access?.platform],
            ["LTI version", data.access?.ltiVersion],
        ]),
    ].join("\n"), 1600);
    const client = data.client;
    if (client) {
        const environment = optionalFields([
            ["Browser", client.browser],
            ["Operating system", client.operatingSystem],
            ["Layout", client.layout],
            ["Viewport (CSS px)", client.viewport?.width != null && client.viewport?.height != null
                ? `${client.viewport.width} × ${client.viewport.height}` : undefined],
            ["Visible viewport (CSS px)", client.viewport?.visualWidth != null && client.viewport?.visualHeight != null
                ? `${client.viewport.visualWidth} × ${client.viewport.visualHeight}` : undefined],
            ["Screen (CSS px)", client.screen?.width != null && client.screen?.height != null
                ? `${client.screen.width} × ${client.screen.height}` : undefined],
            ["Device pixel ratio", client.viewport?.devicePixelRatio],
            ["Embedded in another page", client.embedded],
            ["Online", client.online],
            ["Language", client.language],
            ["Time zone", client.timeZone],
            ["Page visibility", client.visibility],
            ["Current route", client.route],
            ["User agent", client.userAgent, 600],
        ]);
        if (environment.length) section("Client environment", environment.join("\n"), 3500);
    }
    const state = data.reportContext?.stateSummary;
    const platform = data.reportContext?.platformState;
    if (state || platform) {
        const details = optionalFields([
            ["Correct steps", state?.correctSteps],
            ["Incorrect steps", state?.incorrectSteps],
            ["Unanswered steps", state?.unansweredSteps],
            ["Viewed hints", state?.viewedHints],
            ["Expanded step", state?.expandedStepNumber],
            ["Hint panel open", state?.hintPanelOpen],
            ["Avatar hint visible", state?.avatarHintVisible],
            ["AI tutor open", state?.agentChatVisible],
            ["Math keyboard visible", state?.mathKeyboardVisible],
            ["First help action", state?.firstHelpAction],
            ["Platform status", platform?.status],
            ["Lesson ID", platform?.lessonId],
            ["Contents drawer open", platform?.drawerOpen],
            ["Feedback form open", platform?.feedbackFormOpen],
            ["Problem seed", platform?.problemSeed],
        ]);
        if (details.length) section("Client state", details.join("\n"), 2500);
    }
    section("Screenshot", data.screenshot
        ? context.screenshotStatus || "Attached to the Firestore report"
        : "Not attached", 500);
    const reportDetails = optionalFields([
        ["Site version", data.siteVersion],
        ["Commit", data.siteCommitHash],
        ["Semester", data.semester],
        ["Treatment", data.treatment],
        ["Study ID", data.study_id],
        ["Firebase project", context.projectId],
        ["Document", context.documentPath, 1000],
    ]);
    if (reportDetails.length) section("Report details", reportDetails.join("\n"), 3000);
    const timestamps = optionalFields([
        ["Submitted by client", present(data.time_stamp) ? timestampText(data.time_stamp) : undefined],
        ["Received by Firestore", present(data.server_time) ? timestampText(data.server_time) : undefined],
        ["Document created", present(context.createdAt) ? timestampText(context.createdAt) : undefined],
        ["Trigger event", present(context.eventTime) ? timestampText(context.eventTime) : undefined],
    ]);
    if (timestamps.length) section("Timestamps (UTC)", timestamps.join("\n"), 1000);
    if (present(data.variables)) section("Randomized problem variables", readableDetails(data.variables), 5000);
    return {
        text: "New OATutor feedback",
        blocks,
        unfurl_links: false,
        unfurl_media: false,
    };
}

function createNotifier({ webhookUrl, serverTimestamp, fetchImpl = fetch, uploadScreenshot = null }) {
    return async function notifyDevelopers(event) {
        if (!event.data) return;
        const snapshot = await event.data.ref.get();
        if (!snapshot.exists) return;
        const saved = snapshot.data();
        const report = event.data.data();
        if (saved?.notifications?.slackSent !== true) {

            // Validate without logging the webhook, which contains a credential.
            const secret = webhookUrl();
            let url;
            try { url = new URL(secret); } catch { /* handled below */ }
            if (!url || url.protocol !== "https:" || url.hostname !== "hooks.slack.com" ||
                !url.pathname.startsWith("/services/") || url.username || url.password ||
                url.port || url.search || url.hash) {
                throw new Error("Configure SLACK_WEBHOOK_URL with a Slack incoming webhook.");
            }

            let response;
            try {
                response = await fetchImpl(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(buildSlackMessage(event.data.data(), {
                        feedbackId: event.params?.feedbackId || event.data.id,
                        documentPath: event.data.ref.path,
                        projectId: event.data.ref.firestore?.projectId,
                        createdAt: event.data.createTime,
                        eventTime: event.time,
                        screenshotStatus: uploadScreenshot ? "Attached; screenshot will be shared in this channel separately." : "Saved with the report; Slack image delivery is not configured.",
                    })),
                    signal: AbortSignal.timeout(10000),
                    redirect: "error",
                });
            } catch {
                throw new Error("Slack webhook request failed; delivery is unconfirmed.");
            }
            if (!response.ok || (await response.text()).trim() !== "ok") {
                throw new Error(`Slack rejected the notification (HTTP ${response.status}).`);
            }
            await event.data.ref.update({
                "notifications.slackSent": true,
                "notifications.slackSentAt": serverTimestamp(),
            });
            console.info("Slack notification delivered.");
        }
        if (report.screenshot && saved?.notifications?.slackScreenshotSent !== true) {
            if (!uploadScreenshot) {
                await event.data.ref.update({ "notifications.slackScreenshotStatus": "not_configured" });
                return;
            }
            try {
                const fileId = await uploadScreenshot(report.screenshot, event.params?.feedbackId || event.data.id);
                await event.data.ref.update({
                    "notifications.slackScreenshotSent": true,
                    "notifications.slackScreenshotSentAt": serverTimestamp(),
                    "notifications.slackScreenshotFileId": fileId,
                    "notifications.slackScreenshotStatus": "sent",
                });
            } catch {
                await event.data.ref.update({ "notifications.slackScreenshotStatus": "failed" });
                throw new Error("Slack screenshot delivery failed; the text notification remains delivered.");
            }
        }
    };
}

module.exports = { buildSlackMessage, createNotifier };
