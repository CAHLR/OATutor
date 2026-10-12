// Capture a small, explicit diagnostic snapshot when the learner sends feedback.
// Never copy the page query string, storage, cookies, or the LTI JWT.
const bounded = (value, limit) => typeof value === "string" ? value.slice(0, limit) : null;
const dimension = (value) => Number.isFinite(value) && value >= 0 && value <= 100000 ? Math.round(value) : null;
const ratio = (value) => Number.isFinite(value) && value > 0 && value <= 100 ? Math.round(value * 100) / 100 : null;

export function buildFeedbackClientDiagnostics(problemId, browserWindow = typeof window === "undefined" ? null : window) {
    if (!browserWindow) return null;
    const { navigator = {}, location = {}, screen = {}, document = {} } = browserWindow;
    const userAgent = bounded(navigator.userAgent, 500) || "";
    const browser = userAgent.match(/(?:EdgA|EdgiOS|Edg)\/([\d.]+)/) ||
        userAgent.match(/OPR\/([\d.]+)/) ||
        userAgent.match(/(?:Firefox|FxiOS)\/([\d.]+)/) ||
        userAgent.match(/(?:Chrome|CriOS)\/([\d.]+)/) ||
        userAgent.match(/Version\/([\d.]+).*Safari/);
    const browserName = browser ?
        /(?:EdgA|EdgiOS|Edg)\//.test(browser[0]) ? "Edge" :
        /OPR\//.test(browser[0]) ? "Opera" :
        /(?:Firefox|FxiOS)\//.test(browser[0]) ? "Firefox" :
        /(?:Chrome|CriOS)\//.test(browser[0]) ? "Chrome" : "Safari" : null;
    const os = /Android/i.test(userAgent) ? "Android" :
        /iPad|iPhone|iPod/i.test(userAgent) ? "iOS / iPadOS" :
        /Windows/i.test(userAgent) ? "Windows" :
        /CrOS/i.test(userAgent) ? "ChromeOS" :
        /Mac OS X|Macintosh/i.test(userAgent) ? "macOS" :
        /Linux/i.test(userAgent) ? "Linux" : null;
    const width = dimension(browserWindow.innerWidth);
    const height = dimension(browserWindow.innerHeight);
    const layout = width === null ? null : width < 600 ? "Phone-sized layout" :
        width < 960 ? "Tablet-sized layout" : "Desktop-sized layout";
    const route = typeof location.hash === "string" && /^#\/[A-Za-z0-9/_-]{0,150}$/.test(location.hash.split("?")[0])
        ? location.hash.split("?")[0] : null;
    const origin = location.origin;
    const pathname = location.pathname;
    const safeId = typeof problemId === "string" && /^[A-Za-z0-9._-]{1,100}$/.test(problemId) ? problemId : null;
    const problemUrl = safeId && /^https?:\/\/[^/?#]+$/.test(origin || "") &&
        typeof pathname === "string" && /^\/[A-Za-z0-9/_/-]{0,150}$/.test(pathname)
        ? `${origin}${pathname}#/debug/${encodeURIComponent(safeId)}` : null;
    let embedded = null;
    try { embedded = browserWindow.self !== browserWindow.top; } catch { /* unavailable */ }
    let timeZone = null;
    try { timeZone = bounded(Intl.DateTimeFormat().resolvedOptions().timeZone, 60); } catch { /* unavailable */ }
    return {
        browser: browserName ? `${browserName} ${browser[1]}` : null,
        operatingSystem: os,
        userAgent: userAgent || null,
        layout,
        viewport: { width, height, visualWidth: dimension(browserWindow.visualViewport?.width),
            visualHeight: dimension(browserWindow.visualViewport?.height),
            devicePixelRatio: ratio(browserWindow.devicePixelRatio) },
        screen: { width: dimension(screen.width), height: dimension(screen.height) },
        embedded,
        online: typeof navigator.onLine === "boolean" ? navigator.onLine : null,
        language: bounded(navigator.language, 32),
        timeZone,
        visibility: bounded(document.visibilityState, 20),
        route,
        problemUrl,
    };
}
