import { getFeedbackAccess, buildFeedbackContext, describeFeedbackHint } from "./feedbackContext";

test("Canvas is identified from platform metadata, not merely an LMS user ID", () => {
    expect(getFeedbackAccess(null)).toMatchObject({ accessedViaCanvas: false, viaLti: false });
    expect(getFeedbackAccess({ user_id: "private", tool_consumer_info_product_family_code: " Canvas " }))
        .toEqual({ accessedViaCanvas: true, viaLti: true, platform: "canvas", ltiVersion: null, source: "Canvas LTI launch" });
    expect(getFeedbackAccess({ user_id: "private" }).accessedViaCanvas).toBeNull();
    expect(getFeedbackAccess({ tool_consumer_info_product_family_code: "moodle" }).accessedViaCanvas).toBe(false);
});

test("reports an explicit LTI version without including the launch token", () => {
    expect(getFeedbackAccess({ user_id: "private", lti_version: "LTI-1p0" }).ltiVersion).toBe("LTI-1p0");
    expect(getFeedbackAccess({ "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0" }))
        .toMatchObject({ viaLti: true, ltiVersion: "1.3.0" });
    expect(getFeedbackAccess({ lti_version: "unexpected secret with spaces" }).ltiVersion).toBeNull();
});

const problem = { steps: [{ id: "s1", stepTitle: "Question one", stepBody: "Solve x + 2 = 4", answerType: "number", stepAnswer: "private-answer" }] };
const active = { stepIndex: 0, step: problem.steps[0] };

test("feedback captures the active step and selected hint/sub-hint without answers or user history", () => {
    const hint = describeFeedbackHint({ id: "h1", text: "Subtract 2" }, 0,
        describeFeedbackHint({ id: "h1a", text: "From both sides" }, 1));
    const context = buildFeedbackContext(problem, { problemFinished: true, stepStates: { 0: true },
        feedbackHintsByStep: { 0: hint }, attemptHistory: { private: "student input" } }, active);
    expect(context.activeStep).toMatchObject({ id: "s1", number: 1, total: 1, result: "Correct" });
    expect(context.hint).toMatchObject({ id: "h1", number: 1, subHint: { id: "h1a", number: 2 } });
    expect(context.problemFinished).toBe(true);
    expect(context.stateSummary).toMatchObject({ correctSteps: 1, incorrectSteps: 0, unansweredSteps: 0 });
    expect(JSON.stringify(context)).not.toMatch(/private-answer|student input/);
});

test("missing current hints are labeled explicitly and stale problem hint usage is ignored", () => {
    const state = { hintUsageByStep: { 0: { stepId: "s1", hints: [
        { id: "h1", displayIndex: 1, viewed: true }, { id: "h2", displayIndex: 2, viewed: false },
    ] } } };
    expect(buildFeedbackContext(problem, state, active).hint).toMatchObject({ id: "h1", status: "Highest-numbered viewed hint (no current selection)" });
    state.hintUsageByStep[0].stepId = "old-problem-step";
    expect(buildFeedbackContext(problem, state, active).hint.status).toBe("No hint selected");
    expect(buildFeedbackContext({ steps: [] }, {}, null).activeStep).toBeNull();
});

test("visible avatar hints preserve their own step even when another problem accordion is selected", () => {
    const context = buildFeedbackContext({ steps: [...problem.steps, { id: "s2" }] }, {
        isAvatarHintVisible: true, avatarHintStepIndex: 1, avatarVisibleHintIndex: 0,
        avatarHintsByStep: { 1: { stepId: "s2", hints: [{ id: "avatar-hint" }] } },
    }, active);
    expect(context.hint).toMatchObject({ id: "avatar-hint", problemStepId: "s2", problemStepNumber: 2 });
});
