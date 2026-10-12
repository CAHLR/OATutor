const fs = require("node:fs");
const path = require("node:path");

function productionConfig(rawConfig, projectId) {
    if (!/^[a-z][a-z0-9-]+$/.test(projectId || "")) {
        throw new Error("Set PRODUCTION_FIREBASE_PROJECT_ID to the production Firebase project ID.");
    }
    let source;
    try {
        source = JSON.parse(rawConfig);
    } catch {
        throw new Error("The Firebase config used by the frontend must be raw JSON.");
    }
    if (!source || Array.isArray(source) || typeof source !== "object" ||
        source.projectId !== projectId ||
        typeof source.apiKey !== "string" || !source.apiKey ||
        typeof source.appId !== "string" || !source.appId) {
        throw new Error("The production web config must match PRODUCTION_FIREBASE_PROJECT_ID and include apiKey and appId.");
    }
    return source.projectId;
}

function functionsEnvironment(channelId) {
    if (!/^[CG][A-Z0-9]+$/.test(channelId || "")) {
        throw new Error("Set SLACK_SCREENSHOT_CHANNEL_ID to the production Slack channel ID.");
    }
    return `SLACK_SCREENSHOTS_ENABLED=true\nSLACK_SCREENSHOT_CHANNEL_ID=${channelId}\n`;
}

function main(root = path.resolve(__dirname, "..")) {
    const projectId = process.env.PRODUCTION_FIREBASE_PROJECT_ID;
    productionConfig(process.env.FRONTEND_FIREBASE_CONFIG, projectId);
    fs.writeFileSync(path.join(root, "functions", `.env.${projectId}`),
        functionsEnvironment(process.env.SLACK_SCREENSHOT_CHANNEL_ID));
    console.log("Production Functions project and screenshot settings verified.");
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { productionConfig, functionsEnvironment, main };
