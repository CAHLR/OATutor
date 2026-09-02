/** Change this anytime. Used when course/lesson chat_model is missing. */
export const DEFAULT_CHAT_MODEL = "gpt-4o";

export function resolveChatModel(lesson) {
    const name = String(lesson?.chat_model || "").trim();
    return name || DEFAULT_CHAT_MODEL;
}
