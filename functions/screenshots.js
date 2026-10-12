function screenshotBytes(screenshot) {
    const url = screenshot?.dataUrl;
    if (typeof url !== "string" || url.length > 280000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(url)) {
        throw new Error("Screenshot must be a resized JPEG attachment.");
    }
    const bytes = Buffer.from(url.split(",")[1], "base64");
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
        throw new Error("Screenshot is not a valid JPEG attachment.");
    }
    return bytes;
}

function createScreenshotUploader({ botToken, channelId, fetchImpl = fetch }) {
    return async (screenshot, reportId) => {
        const bytes = screenshotBytes(screenshot);
        const token = botToken();
        const channel = channelId();
        if (!token || token === "UNCONFIGURED" || !/^[CG][A-Z0-9]+$/.test(channel || "")) {
            throw new Error("Slack screenshot delivery is not configured.");
        }
        const api = async (method, body) => {
            try {
                const response = await fetchImpl(`https://slack.com/api/${method}`, {
                    method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(body).toString(),
                });
                const result = await response.json();
                if (!response.ok || !result.ok) throw new Error();
                return result;
            } catch {
                throw new Error(`Slack screenshot operation failed: ${method}.`);
            }
        };
        const upload = await api("files.getUploadURLExternal", { filename: "oatutor-bug-report.jpg", length: String(bytes.length) });
        let uploadUrl;
        try { uploadUrl = new URL(upload.upload_url); } catch { /* validated below */ }
        if (!uploadUrl || uploadUrl.protocol !== "https:" || uploadUrl.hostname !== "files.slack.com" ||
            uploadUrl.username || uploadUrl.password || uploadUrl.port || !uploadUrl.pathname.startsWith("/upload/") ||
            !/^F[A-Z0-9]+$/.test(upload.file_id || "")) {
            throw new Error("Slack returned an invalid screenshot upload destination.");
        }
        try {
            const response = await fetchImpl(uploadUrl, {
                method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
                headers: { "Content-Type": "application/octet-stream" }, body: bytes,
            });
            if (!response.ok) throw new Error();
        } catch {
            throw new Error("Slack screenshot transfer failed.");
        }
        // Keep the upload private to the configured channel; never publish a URL.
        await api("files.completeUploadExternal", {
            files: JSON.stringify([{ id: upload.file_id, title: "OATutor bug report screenshot" }]),
            channel_id: channel,
            initial_comment: `Screenshot for OATutor report ${String(reportId || "").replace(/[^a-zA-Z0-9_ .:|\-]/g, "").slice(0, 120)}`,
        });
        return upload.file_id;
    };
}

module.exports = { createScreenshotUploader, screenshotBytes };
