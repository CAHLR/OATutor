export const MAX_VISIBLE_CHAT_MESSAGES = 80;
export const MAX_VISIBLE_CHAT_CHARS = 80_000;

export function boundChatMessages(messages, keep = 'latest') {
    const result = keep === 'oldest'
        ? messages.slice(0, MAX_VISIBLE_CHAT_MESSAGES)
        : messages.slice(-MAX_VISIBLE_CHAT_MESSAGES);
    let chars = result.reduce((total, message) => total + (message.content || '').length, 0);
    while (result.length > 1 && chars > MAX_VISIBLE_CHAT_CHARS) {
        const removed = keep === 'oldest' ? result.pop() : result.shift();
        chars -= (removed.content || '').length;
    }
    if (keep === 'latest' && result[0]?.role === 'assistant' && result[0]?.sequence != null && result.length > 1) result.shift();
    if (keep === 'oldest' && result[result.length - 1]?.role === 'user' && result.length > 1) result.pop();
    return result;
}

export function historyPageMessages(turns) {
    return turns.flatMap((turn) => turn.messages.map((message, index) => ({
        ...message,
        id: `archive-${turn.sequence}-${index}`,
        sequence: turn.sequence,
        timestamp: turn.timestamp || null,
    })));
}

export function boundedLegacyHistory(messages) {
    const history = messages.filter((message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        !message.isError && !message.isGenerating && typeof message.content === 'string'
    ).map(({ role, content }) => ({ role, content })).slice(-40);
    let chars = history.reduce((total, message) => total + message.content.length, 0);
    while (history.length && chars > 24_000) chars -= history.shift().content.length;
    while (history.length && history[0].role !== 'user') history.shift();
    return history;
}
