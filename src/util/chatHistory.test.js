import { boundChatMessages, boundedLegacyHistory, historyPageMessages } from './chatHistory';

it('bounds long browser transcripts by count and content size', () => {
    const messages = Array.from({ length: 2000 }, (_, id) => ({ id, role: id % 2 ? 'assistant' : 'user', content: 'x'.repeat(2000) }));
    const latest = boundChatMessages(messages);
    expect(latest.length).toBe(40);
    expect(latest[39].id).toBe(1999);
    expect(boundChatMessages(messages, 'oldest')[0].id).toBe(0);
    expect(messages.length).toBe(2000);
});

it('does not bootstrap model history with error or in-flight messages', () => {
    const history = boundedLegacyHistory([
        { role: 'assistant', content: 'greeting' },
        { role: 'user', content: 'question' },
        { role: 'assistant', content: 'failed', isError: true },
        { role: 'assistant', content: 'partial', isGenerating: true },
    ]);
    expect(history).toEqual([{ role: 'user', content: 'question' }]);
});

it('keeps archive message identities stable across pages', () => {
    const messages = historyPageMessages([{ sequence: 4, messages: [
        { role: 'user', content: 'question' }, { role: 'assistant', content: 'reply' },
    ] }]);
    expect(messages.map(({ id }) => id)).toEqual(['archive-4-0', 'archive-4-1']);
    expect(messages.every(({ sequence }) => sequence === 4)).toBe(true);
});
