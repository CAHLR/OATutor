# AI Agent Generation

## Overview
This guide explains how each variable in the LLM prompt is accessed and passed through the system.

This Lambda powers the OATutor AI Tutor. It receives the current problem, active step, student state, attempts, hint usage, optional figure images, and chat mode metadata from the React app, then streams a response from OpenAI back to the browser.


The current implementation supports normal chat turns, suggested-question generation, DynamoDB conversation memory, CloudWatch operational logging, and Firebase chat history logging from the React app.

## System Shape

```text
Problem.js
  -> AgentIntegration / AvatarHelpPanel / StandaloneChatView
  -> AgentChatbox
  -> AgentHelper
  -> aws/aiAgentGeneration Lambda
  -> OpenAI Chat Completions
```

Key files:

| File | Purpose |
| --- | --- |
| `index.mjs` | Lambda entrypoint, CORS, request routing, streaming response, CloudWatch logging, DynamoDB session memory |
| `agent-logic.mjs` | Prompt loading, chat prompt construction, multimodal message construction, suggested-question prompt and parsing |
| `PROMPTv1.txt` / `PROMPTv2.txt` | Allowed chat prompt templates selected by lesson config |
| `src/components/problem-layout/AgentHelper.js` | Frontend API client for chat turns and suggested questions |
| `src/components/problem-layout/AgentChatbox.js` | Shared chat UI used by Window, Avatar, and Full modes |

## Chat Display Modes

The frontend reads `lesson.chat_display_mode` from `coursePlans.json`.

| Mode | Behavior |
| --- | --- |
| `Off` | AI Tutor is not rendered. Problem and normal hint UI behave without chat. |
| `Window` | Floating Oski chat window rendered from `Problem.js` through `AgentIntegration`. |
| `Avatar` | Embedded Window-style chat panel beside the problem. Includes compact Avatar hint UI inside the chat shell and suggested questions below the textbox. |
| `Full` | Full-screen standalone AI Tutor view via `StandaloneChatView`. The current problem step is shown above the embedded chat. |

`AgentChatbox` is shared across modes. `AvatarHelpPanel` uses Avatar-only slots (`afterMessagesContent`, `beforeInputContent`) so compact hint cards and hint buttons do not affect Window mode styling.

## Request Types

All requests are `POST` requests to `REACT_APP_AI_AGENT_URL`.

### 1. Chat Turn

Sent by `AgentHelper.sendMessage()`.

```json
{
  "sessionId": "session_...",
  "turnId": 1,
  "userMessage": "Can you help me start?",
  "problemContext": {},
  "studentState": {},
  "extracted": {
    "text": "...",
    "images": [],
    "condition": "avatar_help_panel",
    "lessonId": "..."
  },
  "chatPrompt": "PROMPTv2.txt",
  "chatDisplayMode": "Avatar",
  "conversationHistory": []
}
```

The Lambda:

1. Loads existing conversation history from DynamoDB.
2. Builds the prompt with `buildAgentPrompt()`.
3. Streams newline-delimited JSON chunks:

```json
{"type":"content","content":"Let's","timestamp":...}
{"type":"content","content":" start...","timestamp":...}
{"type":"complete","fullResponse":"Let's start...","timestamp":...}
```

4. Stores the user/assistant turn back to DynamoDB for multi-turn session memory.

Research chat history (`chat_opened`, `chat_message`, etc.) is logged from the browser to Firebase `chatHistory` / `development_chatHistory` via `Firebase.logChatHistory()`.

### 2. Suggested Questions

Sent by `AgentHelper.fetchSuggestedQuestions()` with:

```json
{
  "requestType": "suggestedQuestions",
  "sessionId": "session_...",
  "problemContext": {},
  "studentState": {},
  "extracted": {
    "condition": "avatar_help_panel",
    "lessonId": "..."
  },
  "chatPrompt": "PROMPTv2.txt",
  "chatDisplayMode": "Avatar"
}
```

The Lambda uses `buildSuggestedQuestionsPrompt()` and `generateSuggestedQuestions()` to return exactly three short questions:

```json
{
  "type": "suggestions",
  "questions": [
    "What should I try first?",
    "How do I use the graph?",
    "Can you explain this step?"
  ],
  "timestamp": ...
}
```

Suggestions use `SUGGESTIONS_MODEL` or default to `gpt-4o-mini`. They do not mutate conversation history. The frontend caches suggestions by problem, active step, and correctness so hint show/hide interactions do not repeatedly call the LLM.

Client lifecycle events such as `chat_opened`, `chat_closed`, and `chat_message` are logged to Firebase from `AgentChatbox`, not to the Lambda.

## Multimodal Input

The chat path supports images for OpenAI vision-capable models. `AgentChatbox.extractConceptExplorationInput()` scans the current user message and problem/step text for OATutor figure tokens such as:

```text
##figure-name.png
```

`fetchFiguresAsBase64()` loads matching files from:

```text
PUBLIC_URL/static/images/figures/<CONTENT_SOURCE>/<problemID>/<filename>
```

The frontend sends them as data URLs in `extracted.images`. `buildAgentPrompt()` then constructs a multimodal final user message:

```javascript
[
  { type: "text", text: userMessage },
  { type: "image_url", image_url: { url: dataUrl, detail: "auto" } }
]
```

The default chat model is `gpt-4o`, which can handle these image parts.

## Prompt Data

`AgentChatbox` builds two major objects.

### `problemContext`

Built by `AgentChatbox.getProblemContext()`:

| Field | Source |
| --- | --- |
| `problemID` | `problem.id` |
| `problemTitle` | `problem.title` |
| `problemBody` | `problem.body` |
| `courseName` | `lesson.courseName` |
| `seed` | `Problem.js` props |
| `currentStep` | `Problem.js.getActiveStepData()` |
| `totalSteps` | `problem.steps.length` |

`getActiveStepData()` prioritizes the expanded accordion, then first incorrect step, then first unanswered step, then the last step.

### `studentState`

Built by `AgentChatbox.getStudentState()`:

| Field | Source |
| --- | --- |
| `isCorrect` | `Problem.js.state.stepStates[stepIndex]` |
| `attemptHistory` | `Problem.js.state.attemptHistory` |
| `currentLessonMastery` | `lessonMasteryMap[lesson.id]`, formatted as a percentage |
| `skillMastery` | BKT params for the active step's knowledge components |
| `hintsUsed` | Manual viewed hints reported by `ProblemCard` through `hintUsageByStep` |

`hintsUsed` intentionally filters out AI-generated dynamic hints and bottom-out answer hints for the chat prompt.

## Prompt Templates

`agent-logic.mjs` only allows these prompt files:

| Template | Notes |
| --- | --- |
| `PROMPTv1.txt` | Older tutor behavior template |
| `PROMPTv2.txt` | Default template |

The frontend passes `lesson.chat_prompt` as `chatPrompt`. If the file name is missing or not allowed, `agent-logic.mjs` falls back to `PROMPTv2.txt`.

`PROMPTv1.txt` is the older expert math tutor prompt. `PROMPTv2.txt` is the newer, more interactive tutor prompt informed by:

- https://doi.org/10.1080/10494820.2025.2488984
- https://doi.org/10.1145/3698205.3729557

The main `PROMPTv2.txt` design changes are:

- **Open inquiry over chatbot-led quizzing:** students can ask their own questions instead of only responding to tutor prompts. This follows the finding that the ITS-style condition, where students mainly answered system questions, performed worse than peer and GPT dialogue conditions.
- **Reciprocal dialogue:** responses should sustain a back-and-forth exchange with follow-ups such as "Does this clarify your question?" or "What part is still unclear?" rather than ending after a single answer.
- **Trust through accuracy and transparency:** the tutor should avoid hallucinating, acknowledge uncertainty or limits when needed, and keep responses reliable enough for students to trust the agent.
- **Agent personification:** the tutor uses the Oski persona and warm greeting style, such as "Hello! I'm Oski, your AI tutor," reflecting findings that personified agent framing can increase engagement compared with impersonal help text.

Template placeholders currently replaced by `buildAgentPrompt()`:

```text
{courseName}
{problemTitle}
{stepTitle}
{stepBody}
{correctAnswer}
{studentAnswer}
{correctnessStatus}
{hintsUsed}
{attemptHistory}
{currentLessonMastery}
{skillMastery}
{userMessage}
```

### Example `PROMPTv1.txt` Input

This is representative of what the LLM sees after `buildAgentPrompt()` fills the `PROMPTv1.txt` template:

```text
You are an expert math tutor helping a student with an OATutor problem.

PROBLEM CONTEXT:
Course: OpenStax: Elementary Algebra
Problem: Solve Number Problems

CURRENT STEP:
Question: Set up the equation
Details: What equation represents the sum of three consecutive integers?
Correct Answer: x + (x+1) + (x+2) = 24

STUDENT'S CURRENT STATE:
Status: Incorrect
Hints already given for this step:
Hints already shown to the student for this step:
- Hint 1: Try writing the sum of three consecutive integers as x + (x+1) + (x+2).

ATTEMPT HISTORY (all questions in this problem):
  Question: "Set up the equation"
  Most recent attempt: 3x = 24
  Previous attempts: x + x + x = 24

  Question: "What is x?"
  Most recent attempt: 8
  Previous attempts: 7

CURRENT LESSON MASTERY:
Lesson 2.5 Solving One-Variable Equations: 58%

RELEVANT SKILL LEVELS FOR THIS PROBLEM:
- linear_equations: 73% mastery
- consecutive_integers: 45% mastery
- algebraic_expressions: 82% mastery

CRITICAL RULES - YOU MUST FOLLOW THESE:
- NEVER reveal the final answer, even if asked directly
- NEVER complete the final calculation - always ask them to do it
- Guide them to the last step, then prompt: "What do you get?" or "Can you calculate that?"
- If asked to "walk through it", break it into steps but Stop ONE step before the final answer - let THEM do the last calculation

TEACHING GUIDELINES:
- Use the Socratic method - ask guiding questions
- Help them discover the answer, don't just give it
- Be encouraging and patient
- Reference their most recent attempt when providing guidance
- Look at their previous attempts to identify patterns in their thinking
- Break problems into smaller steps when needed
- Acknowledge their effort and progress
- Use the attempt history to understand what mistakes they've made before
- If they seem stuck, ask clarifying questions about their approach

Student asks: "I don't understand how to set up the equation for this problem"

Provide helpful, step-by-step guidance.
```

## Models and Environment Variables

Frontend:

| Variable | Required | Purpose |
| --- | --- | --- |
| `REACT_APP_AI_AGENT_URL` | Yes | Lambda Function URL used by `AgentHelper` |

Lambda:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | none | Required OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o` | Streaming chat model; should support vision if images are sent |
| `SUGGESTIONS_MODEL` | `gpt-4o-mini` | Non-streaming model for suggested questions |
| `CONVERSATION_TABLE_NAME` | `agent-conversations` | DynamoDB table for session memory |
| `LOG_FULL_PROMPT` | `false` | If `true`, writes full prompt text to CloudWatch for debugging |
| `LOG_ERROR_STACK` | `false` | If `true`, includes error stacks in CloudWatch error events |

## Persistence and Logging

### DynamoDB Conversation Memory (keep this)

`loadConversationHistory(sessionId)` reads previous turns from DynamoDB. `updateConversationHistory()` appends the new user and assistant messages after each completed chat turn.

This is **not** research logging. It is runtime session memory so Oski remembers earlier messages in the same chat session. The frontend sends `conversationHistory: []` on every request; the Lambda relies on DynamoDB to rebuild context across turns.

Items are written with a 24-hour TTL so stale sessions auto-expire:

```javascript
ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
```

Keep DynamoDB unless you redesign chat to send full history from the browser on every turn.

### Firebase Chat History

The React app writes research/analytics chat events to Firestore via `Firebase.logChatHistory()` in `src/components/Firebase.js`. Local dev uses `development_chatHistory`; production uses `chatHistory`.

### CloudWatch Events

`index.mjs` logs single-line JSON events for CloudWatch Logs Insights:

| Event | When |
| --- | --- |
| `turn_started` | Chat prompt built and model call starting |
| `turn_completed` | Streaming chat response finished |
| `turn_error` | Chat turn failed |
| `suggestions_started` | Suggested-question request starting |
| `suggestions_completed` | Suggested questions returned |
| `suggestions_error` | Suggested-question request failed |

## Avatar Mode Hints

Avatar mode no longer portals the full accordion `HintSystem` into the chatbox. Instead:

1. `ProblemCard` remains the source of truth for hints, unlock state, Firebase logging, and BKT side effects.
2. `ProblemCard` reports compact hint metadata to `Problem.js`.
3. `Problem.js` owns Avatar hint UI state: current step, visible hint index, whether the card is open, and unlock requests.
4. `AvatarHelpPanel` renders `AvatarHintCard` inside the chat message area and a bottom hint button only when the card is closed.

Button states:

| State | UI |
| --- | --- |
| No hint opened yet | Bottom button says `Get a hint` |
| Hint open | No bottom hint button; card shows `Previous hint`, `Next hint`, and top-right `Hide hint` |
| Hint hidden/collapsed | Bottom button says `Show hint` and reopens the same hint |

Opening or advancing to a newly reached hint calls the same underlying unlock path as the normal hint system.

## Local Testing

Frontend:

```bash
npm start
```

Production compile check:

```bash
npm run build
```

Jest currently may fail before tests run if the repo's Jest config does not transform the ESM `react-markdown` package. Use the production build for a broad compile check until that Jest config issue is fixed.

Backend deployment check:

1. Deploy the latest `aws/aiAgentGeneration/index.mjs`, `agent-logic.mjs`, and prompt files.
2. Confirm Lambda env vars, especially `OPENAI_API_KEY`, `OPENAI_MODEL`, `SUGGESTIONS_MODEL`, and `CONVERSATION_TABLE_NAME`.
3. Confirm the frontend `.env` has `REACT_APP_AI_AGENT_URL=<Lambda Function URL>`.
4. Restart the frontend dev server after changing `.env`.
5. Watch CloudWatch for `turn_started`, `turn_completed`, `suggestions_started`, and `suggestions_completed`.

## Troubleshooting

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Frontend says AI endpoint is not configured | Missing `REACT_APP_AI_AGENT_URL` | Put it in frontend `.env` and restart `npm start` |
| Suggested questions always fall back | Lambda is stale or suggestions request is failing | Confirm deployed Lambda includes `requestType: "suggestedQuestions"` handling and `SUGGESTIONS_MODEL` is valid |
| OpenAI error says content is null | Stale Lambda or malformed request | Current code coerces non-string `userMessage` to `""`; redeploy latest backend |
| Images are ignored | No figure tokens found or image fetch failed | Check browser console warnings from `fetchFiguresAsBase64()` |
| Prompt changes do not appear | Prompt file not deployed or `chatPrompt` not allowed | Only `PROMPTv1.txt` and `PROMPTv2.txt` are accepted |
| Mode changes do not appear | `coursePlans.json` change not loaded | Rebuild/restart frontend and confirm `lesson.chat_display_mode` |
