# Bounded Chat Memory

`conversation-memory.mjs` owns runtime history. The browser sends a new message
and current tutoring context, rather than repeatedly uploading the full transcript.
The first request may include a bounded legacy bootstrap; after a server
`memoryVersion: 1` acknowledgment, the browser sends no transcript.

## Storage and Request Lifecycle

The existing DynamoDB table needs only its current string partition key `sessionId`.
No sort key or secondary index is required. Three item types share that table:

- Original session key: bounded recent turns, structured summary, summary cursor,
  sequence/version, and a temporary lease.
- `memory:turn:<session hash>:<sequence>`: exact completed exchange and problem/step
  identity, for scrollback and compaction.
- `memory:request:<session hash>:<request hash>`: committed reply for idempotent replay.

A chat request acquires a conditional session lease, checks its request ID,
prepares bounded context, streams the model reply, and atomically commits the
session, archived turn, and replay record. Only then is `type: complete` emitted.
A reused request ID with a different message/context is rejected. The browser
reuses an interrupted request ID when the same message is resent in the same context.

Concurrent requests fail with a retryable message instead of overwriting each
other. The lease outlives the Lambda's remaining invocation time. Crashed
invocations release their lease by expiration; successful/error paths release it
explicitly. Archive and session writes require DynamoDB availability: a failed
commit produces a stream error, not a false success acknowledgment.

Legacy `messages` arrays are archived and converted under the lease before the
new reply is generated. A failed archive write leaves the original history intact.
All items have a 24-hour TTL; enable TTL on the table's `ttl` attribute. Archive
turns expire 24 hours after they are written; active session metadata refreshes its
expiry on each successful turn. Expired items are ignored even before DynamoDB
physically deletes them. Firebase research logging remains separate.

## Compaction

At 12 recent exchanges or 24 KB of recent state, summarize older exchanges while
keeping the latest four intact. Summary input is capped at 64 KB and recovery
processes at most 24 archived exchanges per request. The hard recent-state limit
is 12 exchanges / 48 KB. These UTF-8 byte budgets are conservative size guards,
not exact model token measurements; the current problem/RAG budget is separate.

The validated summary is at most 6 KB and contains topics, student approaches,
misconceptions, corrections, hints given, unresolved questions, and preferences.
Problem/step identities accompany source turns. The summary prompt forbids copying
solutions, inventing mastery, or preserving instructions to change teaching rules.
Memory enters the model as explicitly untrusted user-role data; current platform
state and teaching instructions remain authoritative.

The summary call has a 12-second timeout and no automatic retries. Failure keeps
the last valid summary and a bounded recent window. Unsummarized exchanges remain
in the archive and can be recovered on subsequent requests while their TTL is valid.
The summary cursor advances only with a valid summary and a successful turn commit.

## Browser Limits

React retains at most 80 visible messages / 80,000 characters. Completed Markdown
rendering is memoized. Streaming paints are limited to roughly 20 per second,
with an immediate final update. Requests are aborted when clearing/unmounting.
Individual student messages and assistant replies are limited to 16 KB.

`requestType: chatHistory` returns at most 10 archived exchanges. `beforeSequence`
is an exclusive integer cursor; omit it for the latest page. Earlier messages
can be loaded without retaining the whole conversation, and Latest messages
returns to the current end of the thread. Sending from an older page first reloads
the latest page. Session IDs use browser cryptographic randomness and act as
bearer secrets for runtime history; never log/share them outside trusted systems.
This change does not add account authentication to the existing Lambda endpoint.

## Deployment

1. Include `conversation-memory.mjs` with the existing Lambda runtime files.
2. On the existing table ARN, grant the Lambda `dynamodb:GetItem`,
   `dynamodb:UpdateItem`, `dynamodb:PutItem`, and `dynamodb:BatchWriteItem`.
   The three-item transaction uses `PutItem` permissions for each item.
3. Enable DynamoDB TTL on `ttl` and confirm the table partition key is `sessionId`.
4. Set `CHAT_SUMMARY_MODEL` if needed (default `gpt-4o-mini`). Set
   `CHAT_SUMMARIZATION_ENABLED=false` to disable LLM compaction while retaining
   bounded recent history, archiving, and pagination.
5. Deploy backend before frontend. Older browsers are supported, but browser
   memory limits require the updated frontend. A new browser can talk to the old
   backend using bounded bootstrap history until it receives the acknowledgment.
6. In staging, test long math-heavy sessions, scrollback, problem switches,
   interrupted connections, overlapping requests, and summary-provider failure.
   Check `memory_compacted`, `memory_compaction_failed`, and `memory_release_failed`
   alongside existing turn events. Compaction logs contain sizes/cursors, not text.

Run `npm test` in this directory and the focused `chatHistory.test.js` /
`AgentHelper.test.js` frontend tests. The memory regression uses fake DynamoDB and
a deterministic summarizer to exercise 200 turns, failure recovery, pagination,
migration, idempotency, and concurrency. It verifies mechanics, not real-model
summary fidelity. Live AWS IAM/TTL behavior and summary quality must be verified
in staging; no cloud resources are modified by those tests.
