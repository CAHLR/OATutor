import { AgentHelper } from './AgentHelper';
const originalFetch = global.fetch;

function streamingResponse(records) {
    let index = 0;
    return { ok: true, body: { getReader: () => ({ read: async () => index < records.length
        ? { done: false, value: new TextEncoder().encode(records[index++]) }
        : { done: true } }) } };
}

beforeEach(() => {
    // jsdom does not supply the streaming codecs in this React version.
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
    global.fetch = jest.fn();
    Object.defineProperty(window, 'crypto', { configurable: true,
        value: { getRandomValues: (array) => require('crypto').randomFillSync(array) } });
});

afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
});

it('parses fragmented records and stops sending history after server acknowledgment', async () => {
    const helper = new AgentHelper();
    helper.agentEndpoint = '/agent';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(streamingResponse([
        '{"type":"content","content":"hel',
        'lo"}\n{"type":"complete","memoryVersion":1,"sequence":4}\n',
    ]));
    const committed = jest.fn();
    const completed = jest.fn();
    await helper.sendMessage('why?', {}, {}, {}, undefined, undefined, undefined,
        { onHistoryCommitted: committed, onSuccessfulCompletion: completed },
        [{ role: 'user', content: 'earlier question' }]);
    expect(completed).toHaveBeenCalledWith('hello');
    expect(committed).toHaveBeenCalledWith(expect.objectContaining({ sequence: 4 }));
    const firstRequest = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstRequest.requestId).toBeTruthy();
    expect(firstRequest.conversationHistory).toHaveLength(1);
    expect(helper.buildAgentRequest('next', {}, {}, {}, null, null,
        [{ role: 'user', content: 'must not resend' }]).conversationHistory).toEqual([]);
    helper.initializeSession();
    expect(helper.serverOwnsHistory).toBe(false);
});

it('does not claim a truncated stream completed successfully', async () => {
    const helper = new AgentHelper();
    helper.agentEndpoint = '/agent';
    jest.spyOn(global, 'fetch').mockResolvedValue(streamingResponse(['{"type":"content","content":"partial"}\n']));
    const completed = jest.fn();
    await expect(helper.sendMessage('why?', {}, {}, {}, undefined, undefined, undefined,
        { onSuccessfulCompletion: completed })).rejects.toThrow('interrupted');
    expect(completed).not.toHaveBeenCalled();
    expect(helper.serverOwnsHistory).not.toBeTruthy();
});

it('propagates server commit errors rather than accepting streamed text', async () => {
    const helper = new AgentHelper();
    helper.agentEndpoint = '/agent';
    jest.spyOn(global, 'fetch').mockResolvedValue(streamingResponse([
        '{"type":"content","content":"partial"}\n{"type":"error","error":"commit failed"}\n',
    ]));
    await expect(helper.sendMessage('why?', {}, {})).rejects.toThrow('commit failed');
});

it('rejects malformed records instead of silently losing reply text', async () => {
    const helper = new AgentHelper();
    helper.agentEndpoint = '/agent';
    jest.spyOn(global, 'fetch').mockResolvedValue(streamingResponse([
        'invalid json\n{"type":"complete","memoryVersion":1,"sequence":1}\n',
    ]));
    await expect(helper.sendMessage('why?', {}, {})).rejects.toThrow();
    expect(helper.serverOwnsHistory).not.toBeTruthy();
});

it('reuses the request ID when resending an interrupted message', async () => {
    const helper = new AgentHelper();
    helper.agentEndpoint = '/agent';
    const fetchMock = jest.spyOn(global, 'fetch')
        .mockResolvedValueOnce(streamingResponse(['{"type":"content","content":"partial"}\n']))
        .mockResolvedValueOnce(streamingResponse(['{"type":"complete","fullResponse":"committed reply","memoryVersion":1,"sequence":1}\n']));
    await expect(helper.sendMessage('why?', {}, {})).rejects.toThrow('interrupted');
    await expect(helper.sendMessage('why?', {}, {})).resolves.toBe('committed reply');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).requestId)
        .toBe(JSON.parse(fetchMock.mock.calls[1][1].body).requestId);
});

it('throttles frequent streaming paints and delivers the exact final text', async () => {
    const helper = new AgentHelper();
    helper.agentEndpoint = '/agent';
    let clock = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => clock++);
    jest.spyOn(global, 'fetch').mockResolvedValue(streamingResponse([
        ...Array.from({ length: 1000 }, () => '{"type":"content","content":"x"}\n'),
        '{"type":"complete","memoryVersion":1,"sequence":1}\n',
    ]));
    const paint = jest.fn();
    const completed = jest.fn();
    await helper.sendMessage('why?', {}, {}, {}, undefined, undefined, undefined,
        { onChunkReceived: paint, onSuccessfulCompletion: completed });
    expect(paint.mock.calls.length).toBeLessThanOrEqual(21);
    expect(completed).toHaveBeenCalledWith('x'.repeat(1000));
});
