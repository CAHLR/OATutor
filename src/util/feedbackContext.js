// Keep report context about the current UI, without copying learner identity.
export function getFeedbackAccess(ltiContext) {
    const product = ltiContext?.tool_consumer_info_product_family_code;
    const platform = typeof product === "string" ? product.trim().toLowerCase() || null : null;
    const rawVersion = ltiContext?.lti_version || ltiContext?.ltiVersion ||
        ltiContext?.["https://purl.imsglobal.org/spec/lti/claim/version"];
    const ltiVersion = typeof rawVersion === "string" && /^[A-Za-z0-9._-]{1,30}$/.test(rawVersion)
        ? rawVersion : null;
    const viaLti = Boolean(ltiContext?.user_id || platform || ltiVersion);
    return {
        viaLti,
        platform,
        ltiVersion,
        accessedViaCanvas: platform ? platform === "canvas" : viaLti ? null : false,
        source: platform === "canvas" ? "Canvas LTI launch" : viaLti ? "Other or unknown LMS launch" : "Direct / no LTI launch",
    };
}

const text = (value) => typeof value === "string" ? value.slice(0, 2000) : null;
export function describeFeedbackHint(hint, index, subHint = null) {
    if (!hint) return null;
    return {
        id: text(hint.id), number: index + 1, title: text(hint.title),
        type: text(hint.type), text: text(hint.text),
        subHint,
    };
}

export function buildFeedbackContext(problem, state, activeStep) {
    const index = activeStep?.stepIndex;
    const step = activeStep?.step;
    const usage = state.hintUsageByStep?.[index];
    const viewed = usage && step && usage.stepId === step.id ? (usage.hints || []).filter(hint => hint.viewed) : [];
    let hint = state.feedbackHintsByStep?.[index] || null;
    let hintStatus = hint ? "Selected hint" : "No hint selected";
    if (state.isAvatarHintVisible && Number.isInteger(state.avatarVisibleHintIndex)) {
        const hintStepIndex = state.avatarHintStepIndex ?? index;
        const payload = state.avatarHintsByStep?.[hintStepIndex];
        if (payload && problem.steps?.[hintStepIndex] && payload.stepId === problem.steps[hintStepIndex].id) {
            hint = describeFeedbackHint(payload.hints?.[state.avatarVisibleHintIndex], state.avatarVisibleHintIndex);
            if (hint) hint = { ...hint, problemStepId: payload.stepId, problemStepNumber: hintStepIndex + 1 };
            hintStatus = "Visible avatar hint";
        }
    } else if (!hint && viewed.length) {
        const last = viewed[viewed.length - 1];
        hint = describeFeedbackHint(last, (last.displayIndex || viewed.length) - 1);
        hintStatus = "Highest-numbered viewed hint (no current selection)";
    }
    const steps = Array.isArray(problem.steps) ? problem.steps : [];
    const stepResults = steps.map((_, stepIndex) => state.stepStates?.[stepIndex]);
    const viewedHints = steps.reduce((count, currentStep, stepIndex) => {
        const entry = state.hintUsageByStep?.[stepIndex];
        return count + (entry?.stepId === currentStep.id && Array.isArray(entry.hints)
            ? entry.hints.filter(item => item.viewed === true).length : 0);
    }, 0);
    return {
        problemFinished: state.problemFinished === true,
        stateSummary: {
            correctSteps: stepResults.filter(result => result === true).length,
            incorrectSteps: stepResults.filter(result => result === false).length,
            unansweredSteps: stepResults.filter(result => result !== true && result !== false).length,
            viewedHints,
            expandedStepNumber: Number.isInteger(state.expandedAccordion) && state.expandedAccordion >= 0
                ? state.expandedAccordion + 1 : null,
            hintPanelOpen: state.isHintPortalOpen === true,
            avatarHintVisible: state.isAvatarHintVisible === true,
            agentChatVisible: state.isAgentChatVisible === true,
            mathKeyboardVisible: state.isMathKeyboardVisible === true,
            firstHelpAction: state.firstHelpAction === "chat" || state.firstHelpAction === "hint"
                ? state.firstHelpAction : null,
        },
        activeStep: step ? {
            id: step.id, number: index + 1, total: problem.steps?.length || 0,
            title: text(step.stepTitle), body: text(step.stepBody),
            answerType: step.answerType || null, problemType: step.problemType || null,
            result: state.stepStates?.[index] === true ? "Correct" : state.stepStates?.[index] === false ? "Incorrect" : "Unanswered",
        } : null,
        hint: hint ? { ...hint, status: hintStatus } : { status: hintStatus },
        viewedHintCount: viewed.length,
    };
}
