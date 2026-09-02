/**
 * Never         — never mark wrong for hints or agent
 * AnswerReveal  — hints: last / bottom-out only; agent: SLM judge if answer revealed
 * OnOpen        — first hint unlock or first agent query tags the step; BKT “no credit”
 *                 is applied on the student’s next graded submit (UI may still show correct)
 *
 * Lesson / course fields (mix and match independently):
 *   hint_penalty_mode  — authored hints (default OnOpen)
 *   chat_penalty_mode  — AI tutor (default Never)
 */

export const HELP_PENALTY_MODES = Object.freeze({
    NEVER: "Never",
    ANSWER_REVEAL: "AnswerReveal",
    ON_OPEN: "OnOpen",
});

export const DEFAULT_CHAT_PENALTY_MODE = HELP_PENALTY_MODES.NEVER;
export const DEFAULT_HINT_PENALTY_MODE = HELP_PENALTY_MODES.ON_OPEN;

export const VALID_HELP_PENALTY_MODES = new Set(
    Object.values(HELP_PENALTY_MODES)
);

export function normalizeHelpPenaltyMode(mode, fallback) {
    if (VALID_HELP_PENALTY_MODES.has(mode)) {
        return mode;
    }
    return fallback;
}

export function getHintPenaltyMode(lesson) {
    return normalizeHelpPenaltyMode(
        lesson?.hint_penalty_mode,
        DEFAULT_HINT_PENALTY_MODE
    );
}

export function getChatPenaltyMode(lesson) {
    return normalizeHelpPenaltyMode(
        lesson?.chat_penalty_mode,
        DEFAULT_CHAT_PENALTY_MODE
    );
}

/** UI badge under Hint / AI Tutor promo. */
export function getHelpPenaltyBadgeText(mode, channel) {
    const fallback = channel === "agent"
        ? DEFAULT_CHAT_PENALTY_MODE
        : DEFAULT_HINT_PENALTY_MODE;
    const normalized = normalizeHelpPenaltyMode(mode, fallback);
    if (normalized === HELP_PENALTY_MODES.NEVER) {
        return "Won't affect your mastery score";
    }
    if (normalized === HELP_PENALTY_MODES.ANSWER_REVEAL) {
        return channel === "agent"
            ? "Affects mastery only if the answer is revealed"
            : "Affects mastery only if the final answer hint is opened";
    }
    // OnOpen — deferred: help tags the attempt; credit resolved on submit
    // return "Using help may reduce mastery credit";

    return channel === "agent"
        ? "Using AI tutor will not increase mastery credit"
        : "Using hints will not increase mastery credit";
}

/**
 * Whether unlocking a top-level hint should mark the step wrong.
 * @param {object} opts
 * @param {string} opts.mode
 * @param {number} opts.hintIndex
 * @param {number} opts.hintCount
 * @param {string} [opts.hintType]
 * @param {number[]} [opts.hintsFinished] — prior unlock status (0 / 0.5 / 1)
 */
export function shouldPenalizeTopLevelHintUnlock({
    mode,
    hintIndex,
    hintCount,
    hintType,
    hintsFinished = [],
}) {
    const normalized = normalizeHelpPenaltyMode(mode, DEFAULT_HINT_PENALTY_MODE);
    if (normalized === HELP_PENALTY_MODES.NEVER) {
        return false;
    }

    const isLast =
        Number.isInteger(hintIndex) &&
        Number.isInteger(hintCount) &&
        hintCount > 0 &&
        hintIndex === hintCount - 1;
    const isBottomOut = hintType === "bottomOut";

    if (normalized === HELP_PENALTY_MODES.ANSWER_REVEAL) {
        return isLast || isBottomOut;
    }

    // OnOpen: first unlock only (matches legacy ProblemCard.unlockHint)
    const priorSum = (hintsFinished || []).reduce((a, b) => a + b, 0);
    return priorSum === 0;
}

/**
 * Whether unlocking a sub-hint should mark the step wrong.
 */
export function shouldPenalizeSubHintUnlock({ mode, hintType }) {
    const normalized = normalizeHelpPenaltyMode(mode, DEFAULT_HINT_PENALTY_MODE);
    if (normalized === HELP_PENALTY_MODES.NEVER) {
        return false;
    }
    if (normalized === HELP_PENALTY_MODES.ANSWER_REVEAL) {
        return hintType === "bottomOut";
    }
    // OnOpen — opening any sub-hint counts as using hints
    return true;
}

/**
 * Whether expanding the sub-hint panel (without a specific unlock) should penalize.
 * Only OnOpen; AnswerReveal waits for bottom-out unlock.
 */
export function shouldPenalizeSubHintPanelOpen({ mode }) {
    return normalizeHelpPenaltyMode(mode, DEFAULT_HINT_PENALTY_MODE) === HELP_PENALTY_MODES.ON_OPEN;
}

export function shouldPenalizeAgentOnOpen({ mode }) {
    // OnOpen for agent = first sent query (not merely opening the chat UI).
    return normalizeHelpPenaltyMode(mode, DEFAULT_CHAT_PENALTY_MODE) === HELP_PENALTY_MODES.ON_OPEN;
}

export function shouldJudgeAgentAnswerReveal({ mode }) {
    return normalizeHelpPenaltyMode(mode, DEFAULT_CHAT_PENALTY_MODE) === HELP_PENALTY_MODES.ANSWER_REVEAL;
}
