import { buildFeedbackClientDiagnostics } from "./feedbackDiagnostics";

test("collects useful browser diagnostics and builds a problem link without launch credentials", () => {
    const browser = {
        navigator: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36", onLine: true, language: "en-US" },
        location: { origin: "https://cahlr.github.io", pathname: "/OATutor/", hash: "#/lessons/lesson-1?token=private-jwt", search: "?token=private-jwt" },
        innerWidth: 412, innerHeight: 800, visualViewport: { width: 412, height: 650 },
        screen: { width: 412, height: 915 }, devicePixelRatio: 2.75,
        document: { visibilityState: "visible" },
    };
    browser.self = browser;
    browser.top = {};
    const result = buildFeedbackClientDiagnostics("problem-1", browser);
    expect(result).toMatchObject({ browser: "Chrome 124.0.0.0", operatingSystem: "Windows",
        layout: "Phone-sized layout", embedded: true,
        route: "#/lessons/lesson-1", problemUrl: "https://cahlr.github.io/OATutor/#/debug/problem-1",
        viewport: { width: 412, height: 800, visualWidth: 412, visualHeight: 650, devicePixelRatio: 2.75 } });
    expect(JSON.stringify(result)).not.toContain("private-jwt");
});

test("does not construct links from unsafe problem IDs or locations", () => {
    const browser = { navigator: {}, location: { origin: "https://example.com", pathname: "/", hash: "#/" },
        innerWidth: 1200, innerHeight: 800, screen: {}, document: {} };
    expect(buildFeedbackClientDiagnostics("bad/id", browser).problemUrl).toBeNull();
    expect(buildFeedbackClientDiagnostics("good-id", { ...browser, location: { ...browser.location, pathname: "/private?token=secret" } }).problemUrl).toBeNull();
    expect(buildFeedbackClientDiagnostics("good-id", null)).toBeNull();
});
