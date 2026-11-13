import { describeBrowser, buildReportDetails, REPORT_DETAIL_FIELDS } from "./reportDetails";

const UA = {
    chromeMac:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    safariIphone:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    firefoxWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
    edgeWindows:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
    chromeAndroid:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
    chromebook:
        "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    safariIpad:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
};

describe("describeBrowser", () => {
    test("Chrome on a Mac", () => {
        expect(describeBrowser(UA.chromeMac)).toEqual({ browser: "Chrome 140", os: "macOS" });
    });

    test("Safari on an iPhone reports iOS, not macOS", () => {
        expect(describeBrowser(UA.safariIphone)).toEqual({ browser: "Safari 17.5", os: "iOS" });
    });

    test("Firefox on Windows", () => {
        expect(describeBrowser(UA.firefoxWindows)).toEqual({ browser: "Firefox 130", os: "Windows" });
    });

    test("Edge is not mistaken for Chrome", () => {
        expect(describeBrowser(UA.edgeWindows)).toEqual({ browser: "Edge 140", os: "Windows" });
    });

    test("Chrome on Android is not mistaken for Linux", () => {
        expect(describeBrowser(UA.chromeAndroid)).toEqual({ browser: "Chrome 140", os: "Android" });
    });

    test("Chromebooks report ChromeOS", () => {
        expect(describeBrowser(UA.chromebook).os).toBe("ChromeOS");
    });

    test("desktop Safari", () => {
        expect(describeBrowser(UA.safariIpad)).toEqual({ browser: "Safari 17.4", os: "macOS" });
    });

    test("unknown or missing user agents don't throw", () => {
        expect(describeBrowser("")).toEqual({ browser: "Unknown browser", os: "Unknown OS" });
        expect(describeBrowser(undefined)).toEqual({ browser: "Unknown browser", os: "Unknown OS" });
    });
});

describe("buildReportDetails", () => {
    const base = {
        problem: { id: "ac726d3location12", title: "Interpreting Quartiles", steps: [{}, {}] },
        lesson: { id: "5OuU0RNp-qOuS-Z4LH8fuGRO", courseName: "OpenStax: Introductory Stats" },
        lessonLabel: "2.3 Measures of the Location of the Data",
        activePart: { number: 2, total: 2 },
        pageUrl: "https://oatutor.example/#/lessons/5OuU0RNp-qOuS-Z4LH8fuGRO",
        userAgent: UA.chromeMac,
        viewport: { width: 1440, height: 900 },
        time: new Date("2026-09-30T18:05:00Z"),
        appVersion: "abc1234",
    };

    test("collects the fields triage needs", () => {
        expect(buildReportDetails(base)).toEqual({
            problemId: "ac726d3location12",
            problemTitle: "Interpreting Quartiles",
            part: "2 of 2",
            lessonId: "5OuU0RNp-qOuS-Z4LH8fuGRO",
            lesson: "2.3 Measures of the Location of the Data",
            course: "OpenStax: Introductory Stats",
            url: "https://oatutor.example/#/lessons/5OuU0RNp-qOuS-Z4LH8fuGRO",
            browser: "Chrome 140",
            os: "macOS",
            screen: "1440 × 900",
            time: "2026-09-30T18:05:00.000Z",
            appVersion: "abc1234",
        });
    });

    test("missing pieces become empty strings instead of 'undefined'", () => {
        const details = buildReportDetails({ userAgent: "", time: new Date("2026-09-30T18:05:00Z") });
        Object.values(details).forEach((value) => {
            expect(typeof value).toBe("string");
            expect(value).not.toMatch(/undefined|null|NaN/);
        });
        expect(details.part).toBe("");
        expect(details.appVersion).toBe("dev");
    });

    test("every field has a display label, in a fixed order", () => {
        const details = buildReportDetails(base);
        expect(REPORT_DETAIL_FIELDS.map(([key]) => key).sort()).toEqual(Object.keys(details).sort());
        REPORT_DETAIL_FIELDS.forEach(([, label]) => expect(label).toMatch(/\S/));
    });
});
