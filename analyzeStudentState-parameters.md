# All Available States - Source and Usage

## Overview

**Total state categories: 10**

1. BKT State (per KC)
2. Student State
3. Problem State
4. Step State
5. Hint State
6. Agent Chat State
7. Platform State
8. Conversation History
9. Problem Context
10. Student Analysis

---

## 1. BKT State (per Knowledge Component)

**Source:** `src/content-sources/oatutor/bkt-params/defaultBKTParams.json` → loaded into `App.js` context → persisted in localStorage

**Location:** `bktParams[kc]` in React context

**Fields (4 per KC):**
```javascript
bktParams = {
    "skill_name": {
        probMastery: 0.1,    // Initial: 0.1, updates after each answer
        probTransit: 0.1,    // Fixed: 0.1 (learning rate)
        probSlip: 0.1,       // Fixed: 0.1 (slipping probability)
        probGuess: 0.1       // Fixed: 0.1 (guessing probability)
    }
}
```

**How We Use It:**
- `probMastery` extracted → passed to `studentState.skillMastery`
- Used in `analyzeStudentState()` to identify low mastery skills (< 0.5)
- Updated via `BKT-brain.js` → `update()` function when student answers

**Update Logic:**
- Only updates on **first attempt** per step (`firstAttempts[cardIndex]`)
- Formula: `probMastery = f(probMastery, probTransit, probSlip, probGuess, isCorrect)`

**How to Get Each Parameter:**

**probMastery:**
- **Access:** `bktParams[kc].probMastery` or `context.bktParams[kc].probMastery`
- **Type:** Number (float)
- **Range:** `0.0` to `1.0` (probability)
- **Initial:** `0.1` (from JSON)
- **Update:** After each answer via `BKT-brain.js` → `update()`
- **Extract:** `AgentChatbox.js` → `extractSkillMastery(bktParams)` → `skillMastery[skill] = probMastery`

**probTransit:**
- **Access:** `bktParams[kc].probTransit`
- **Type:** Number (float)
- **Range:** `0.0` to `1.0` (probability)
- **Value:** Fixed `0.1` (from JSON, doesn't update)

**probSlip:**
- **Access:** `bktParams[kc].probSlip`
- **Type:** Number (float)
- **Range:** `0.0` to `1.0` (probability)
- **Value:** Fixed `0.1` (from JSON, doesn't update)

**probGuess:**
- **Access:** `bktParams[kc].probGuess`
- **Type:** Number (float)
- **Range:** `0.0` to `1.0` (probability)
- **Value:** Fixed `0.1` (from JSON, doesn't update)

**Skill Names (KC):**
- **Access:** `Object.keys(bktParams)` or from `skillModel.json`
- **Type:** String (array)
- **Available:** All KC names from `defaultBKTParams.json` (e.g., `"find_factors"`, `"prime_factorizations"`, etc.)
- **Example:** `["and_least_common_multiples", "evaluate_an_expression"]`

---

## 2. Student State

**Source:** `AgentChatbox.js` → `getStudentState()` method

**Fields (7+):**
```javascript
studentState = {
    currentAnswer: string,        // From props.inputVal
    isCorrect: boolean | null,    // From props.isCorrect
    attemptCount: number,          // From props.attempts (0+)
    hintsUsed: array,             // From props.hintsFinished
    timeOnStep: number,           // Calculated: random(30-150)
    skillMastery: {},             // Extracted from bktParams
    user: {                        // From props.user
        user_id, full_name, course_name, course_id
    }
}
```

**How We Use It:**
- Passed to `analyzeStudentState()` as input parameter
- Used to determine: strugglingWith, commonMistakes, suggestedApproach, confidenceLevel
- Sent to Lambda function via `AgentHelper.buildAgentRequest()`

**Currently Used:**
- ✅ `attemptCount` → strugglingWith, confidenceLevel
- ✅ `currentAnswer` → commonMistakes, suggestedApproach
- ✅ `skillMastery` → strugglingWith
- ❌ `isCorrect`, `hintsUsed`, `timeOnStep`, `user` → not used

**How to Get Each Parameter:**

**currentAnswer:**
- **Access:** `studentState.currentAnswer` or `props.inputVal` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (student input)
- **Source:** `ProblemCard.js` → `this.state.inputVal` → passed as `props.inputVal`
- **Example:** `"x + x + x"`, `"3x = 24"`, `""` (empty if not attempted)

**isCorrect:**
- **Access:** `studentState.isCorrect` or `props.isCorrect` (in `AgentChatbox.js`)
- **Type:** Boolean | null
- **Available Values:** `true` (correct), `false` (incorrect), `null` (not attempted)
- **Source:** `ProblemCard.js` → `this.state.isCorrect` → passed as `props.isCorrect`

**attemptCount:**
- **Access:** `studentState.attemptCount` or `props.attempts` (in `AgentChatbox.js`)
- **Type:** Number (integer)
- **Range:** `0` to `∞` (currently no upper limit)
- **Source:** `ProblemCard.js` → `this.state.attempts` → passed as `props.attempts`
- **Note:** Currently needs implementation (gap identified)

**hintsUsed:**
- **Access:** `studentState.hintsUsed` or `props.hintsFinished` (in `AgentChatbox.js`)
- **Type:** Array of numbers
- **Range:** Array of hint indices, e.g., `[0, 1, 2]` or `[]` (empty if none used)
- **Source:** `ProblemCard.js` → `this.state.hintsFinished` → passed as `props.hintsFinished`
- **Example:** `[0, 1, 2]` means hints 0, 1, 2 were completed

**timeOnStep:**
- **Access:** `studentState.timeOnStep`
- **Type:** Number (integer, seconds)
- **Range:** `30` to `150` seconds (currently random: `Math.floor(Math.random() * 120) + 30`)
- **Source:** `AgentChatbox.js` → `calculateTimeOnStep()` method (currently random, not real tracking)

**skillMastery:**
- **Access:** `studentState.skillMastery` or `extractSkillMastery(bktParams)`
- **Type:** Object (key-value pairs)
- **Structure:** `{skillName: probMastery, ...}`
- **Range:** Each value is `0.0` to `1.0` (probability)
- **Source:** `AgentChatbox.js` → `extractSkillMastery(props.bktParams)` → extracts `probMastery` from each KC
- **Example:** `{"find_factors": 0.25, "prime_factorizations": 0.15}`

**user:**
- **Access:** `studentState.user` or `props.user` (in `AgentChatbox.js`)
- **Type:** Object
- **Fields:**
  - `user_id`: String (unique identifier)
  - `full_name`: String (student name)
  - `course_name`: String (course identifier)
  - `course_id`: String (course ID)
- **Source:** React context → `props.user`

---

## 3. Problem State

**Source:** `Problem.js` → `this.state`

**Fields (7):**
```javascript
problemState = {
    stepStates: {},              // {stepIndex: true/false} - completion status
    firstAttempts: {},           // {stepIndex: true} - BKT update flags
    problemFinished: boolean,    // All steps completed?
    showFeedback: boolean,       // Feedback UI visible?
    feedback: string,            // User feedback text
    feedbackSubmitted: boolean,  // Feedback sent to server?
    showPopup: boolean          // Popup visible?
}
```

**How We Use It:**
- Internal to `Problem.js` component only
- NOT passed to `analyzeStudentState()`
- Used for: step completion tracking, BKT update prevention, UI state

**Key Logic:**
- `stepStates[cardIndex] = true` → step completed correctly
- `firstAttempts[cardIndex] = true` → BKT already updated (prevents duplicate updates)

**How to Get Each Parameter:**

**stepStates:**
- **Access:** `this.state.stepStates` (in `Problem.js`)
- **Type:** Object (key-value pairs)
- **Structure:** `{stepIndex: boolean, ...}`
- **Available Values:** `true` (completed correctly), `false` (attempted incorrectly), `undefined` (not attempted)
- **Keys:** Step indices (0, 1, 2, ...)
- **Example:** `{0: true, 1: true, 2: false}`

**firstAttempts:**
- **Access:** `this.state.firstAttempts` (in `Problem.js`)
- **Type:** Object (key-value pairs)
- **Structure:** `{stepIndex: boolean, ...}`
- **Available Values:** `true` (BKT update performed), `undefined` (not yet updated)
- **Keys:** Step indices (0, 1, 2, ...)
- **Example:** `{0: true, 1: true, 2: undefined}`

**problemFinished:**
- **Access:** `this.state.problemFinished` (in `Problem.js`)
- **Type:** Boolean
- **Available Values:** `true` (all steps completed), `false` (in progress)

**showFeedback:**
- **Access:** `this.state.showFeedback` (in `Problem.js`)
- **Type:** Boolean
- **Available Values:** `true` (visible), `false` (hidden)

**feedback:**
- **Access:** `this.state.feedback` (in `Problem.js`)
- **Type:** String
- **Range:** Any string (user input text)
- **Example:** `"This problem was too hard"` or `""` (empty)

**feedbackSubmitted:**
- **Access:** `this.state.feedbackSubmitted` (in `Problem.js`)
- **Type:** Boolean
- **Available Values:** `true` (submitted to server), `false` (not submitted)

**showPopup:**
- **Access:** `this.state.showPopup` (in `Problem.js`)
- **Type:** Boolean
- **Available Values:** `true` (visible), `false` (hidden)

---

## 4. Step State

**Source:** `ProblemCard.js` → `this.state`

**Fields (13+):**
```javascript
stepState = {
    inputVal: string,            // Current answer input
    isCorrect: boolean | null,  // Answer correctness
    checkMarkOpacity: string,    // "0" or "100"
    displayHints: boolean,       // Hints visible?
    hintsFinished: array,        // Which hints completed [0,1,2...]
    equation: string,            // (unused)
    usedHints: boolean,          // Any hints used?
    dynamicHint: string,         // AI-generated hint
    bioInfo: string,            // (unused)
    enableHintGeneration: boolean, // Can generate hints?
    activeHintType: string,      // "none" | "normal"
    hints: array,                // Array of hint objects
    isGeneratingHint: boolean,   // AI hint generating?
    lastAIHintHash: string       // Hint deduplication
}
```

**How We Use It:**
- Internal to `ProblemCard.js` component
- `inputVal` → passed to `studentState.currentAnswer`
- `isCorrect` → passed to `studentState.isCorrect`
- `hintsFinished` → passed to `studentState.hintsUsed`
- `attempts` → passed to `studentState.attemptCount` (needs implementation)

**How to Get Each Parameter:**

**inputVal:**
- **Access:** `this.state.inputVal` (in `ProblemCard.js`)
- **Type:** String
- **Range:** Any string (student input)
- **Example:** `"x + x + x"`, `"3x = 24"`, `""` (empty)

**isCorrect:**
- **Access:** `this.state.isCorrect` (in `ProblemCard.js`)
- **Type:** Boolean | null
- **Available Values:** `true` (correct), `false` (incorrect), `null` (not attempted)

**checkMarkOpacity:**
- **Access:** `this.state.checkMarkOpacity` (in `ProblemCard.js`)
- **Type:** String
- **Available Values:** `"0"` (hidden), `"100"` (visible)
- **Note:** Used for UI display, not logic

**displayHints:**
- **Access:** `this.state.displayHints` (in `ProblemCard.js`)
- **Type:** Boolean
- **Available Values:** `true` (visible), `false` (hidden)

**hintsFinished:**
- **Access:** `this.state.hintsFinished` (in `ProblemCard.js`)
- **Type:** Array of numbers
- **Range:** Array of hint indices, e.g., `[0, 1, 2]` or `[0, 0, 0]` (initialized with zeros)
- **Example:** `[0, 1, 2]` means hints 0, 1, 2 were completed

**equation:**
- **Access:** `this.state.equation` (in `ProblemCard.js`)
- **Type:** String
- **Range:** Any string (currently unused)

**usedHints:**
- **Access:** `this.state.usedHints` (in `ProblemCard.js`)
- **Type:** Boolean
- **Available Values:** `true` (any hints used), `false` (no hints used)

**dynamicHint:**
- **Access:** `this.state.dynamicHint` (in `ProblemCard.js`)
- **Type:** String
- **Range:** Any string (AI-generated hint text)
- **Example:** `"Try breaking down the problem into smaller parts..."`

**bioInfo:**
- **Access:** `this.state.bioInfo` (in `ProblemCard.js`)
- **Type:** String
- **Range:** Any string (currently unused)

**enableHintGeneration:**
- **Access:** `this.state.enableHintGeneration` (in `ProblemCard.js`)
- **Type:** Boolean
- **Available Values:** `true` (can generate), `false` (cannot generate)

**activeHintType:**
- **Access:** `this.state.activeHintType` (in `ProblemCard.js`)
- **Type:** String
- **Available Values:** `"none"` (no active hint), `"normal"` (normal hint active)

**hints:**
- **Access:** `this.state.hints` (in `ProblemCard.js`)
- **Type:** Array of hint objects
- **Structure:** `[{id, title, text, type, ...}, ...]`
- **Range:** Variable length array

**isGeneratingHint:**
- **Access:** `this.state.isGeneratingHint` (in `ProblemCard.js`)
- **Type:** Boolean
- **Available Values:** `true` (AI generating), `false` (not generating)

**lastAIHintHash:**
- **Access:** `this.state.lastAIHintHash` (in `ProblemCard.js`)
- **Type:** String | null
- **Range:** SHA256 hash string or `null`
- **Example:** `"a3f5d8e9..."` (hash of previous hint for deduplication)

---

## 5. Hint State

**Source:** `HintSystem.js` → `this.state`

**Fields (5+):**
```javascript
hintState = {
    latestStep: number,          // Latest hint step index
    currentExpanded: number,     // Currently expanded hint (-1 = none)
    hintAnswer: string,          // Answer to hint question
    showSubHints: array,         // Boolean array for sub-hints
    subHintsFinished: array      // 2D array tracking sub-hint completion
}
```

**How We Use It:**
- Internal to `HintSystem.js` component
- NOT passed to `analyzeStudentState()`
- Used for: hint UI management, sub-hint tracking

**How to Get Each Parameter:**

**latestStep:**
- **Access:** `this.state.latestStep` (in `HintSystem.js`)
- **Type:** Number (integer)
- **Range:** `0` to `hints.length - 1` (hint index)
- **Example:** `2` (latest hint is hint #2)

**currentExpanded:**
- **Access:** `this.state.currentExpanded` (in `HintSystem.js`)
- **Type:** Number (integer)
- **Range:** `-1` (none expanded) to `hints.length - 1` (hint index)
- **Available Values:** `-1` (no hint expanded), `0+` (expanded hint index)

**hintAnswer:**
- **Access:** `this.state.hintAnswer` (in `HintSystem.js`)
- **Type:** String
- **Range:** Any string (answer to hint question)
- **Example:** `"x + (x+1) + (x+2)"` or `""` (empty)

**showSubHints:**
- **Access:** `this.state.showSubHints` (in `HintSystem.js`)
- **Type:** Array of booleans
- **Range:** Array length matches hints array
- **Available Values:** `true` (sub-hint visible), `false` (hidden)
- **Example:** `[true, false, true]` (sub-hints 0 and 2 visible)

**subHintsFinished:**
- **Access:** `this.state.subHintsFinished` (in `HintSystem.js`)
- **Type:** 2D Array (array of arrays)
- **Structure:** `[[hint0_subhints], [hint1_subhints], ...]`
- **Range:** Variable length, nested arrays
- **Example:** `[[0, 1], [0], [0, 1, 2]]` (tracking which sub-hints completed per hint)

---

## 6. Agent Chat State

**Source:** `AgentChatbox.js` → `this.state`

**Fields (6):**
```javascript
agentChatState = {
    isVisible: boolean,          // Chat UI visible?
    messages: array,             // Conversation messages
    currentMessage: string,       // Current input text
    isTyping: boolean,           // User typing indicator
    isGenerating: boolean,       // AI generating response?
    agentSessionId: string       // Session identifier
}
```

**How We Use It:**
- Internal to `AgentChatbox.js` component
- Used for: chat UI management, message history, session tracking
- Messages sent to Lambda via `AgentHelper.sendMessage()`

**How to Get Each Parameter:**

**isVisible:**
- **Access:** `this.state.isVisible` (in `AgentChatbox.js`)
- **Type:** Boolean
- **Available Values:** `true` (chat visible), `false` (chat hidden)

**messages:**
- **Access:** `this.state.messages` (in `AgentChatbox.js`)
- **Type:** Array of message objects
- **Structure:** `[{role, content, timestamp, isError?}, ...]`
- **Available Values:**
  - `role`: `"user"` | `"assistant"` | `"system"`
  - `content`: String (message text)
  - `timestamp`: Number (milliseconds)
  - `isError`: Boolean (optional, true if error message)
- **Example:** `[{role: "user", content: "Help me", timestamp: 1234567890}]`

**currentMessage:**
- **Access:** `this.state.currentMessage` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (user input text)
- **Example:** `"I don't understand"` or `""` (empty)

**isTyping:**
- **Access:** `this.state.isTyping` (in `AgentChatbox.js`)
- **Type:** Boolean
- **Available Values:** `true` (user typing), `false` (not typing)

**isGenerating:**
- **Access:** `this.state.isGenerating` (in `AgentChatbox.js`)
- **Type:** Boolean
- **Available Values:** `true` (AI generating response), `false` (not generating)

**agentSessionId:**
- **Access:** `this.state.agentSessionId` (in `AgentChatbox.js`)
- **Type:** String | null
- **Range:** UUID string or `null`
- **Example:** `"550e8400-e29b-41d4-a716-446655440000"` or `null` (not initialized)

---

## 7. Platform State

**Source:** `Platform.js` → `this.state`

**Fields (4):**
```javascript
platformState = {
    currProblem: object | null,  // Current problem object
    status: string,              // "courseSelection" | "lessonSelection" | "learning"
    seed: string                 // Problem variabilization seed
}
```

**How We Use It:**
- Internal to `Platform.js` component
- Used for: navigation state, problem selection, seed management
- `seed` → passed to `problemContext.seed`

**How to Get Each Parameter:**

**currProblem:**
- **Access:** `this.state.currProblem` (in `Platform.js`)
- **Type:** Object | null
- **Available Values:** Problem object (with `id`, `title`, `body`, `steps`, etc.) or `null` (no problem selected)
- **Example:** `{id: "a01e792probsolve1", title: "Solve Number Problems", ...}`

**status:**
- **Access:** `this.state.status` (in `Platform.js`)
- **Type:** String
- **Available Values:** `"courseSelection"` (selecting course), `"lessonSelection"` (selecting lesson), `"learning"` (in problem)

**seed:**
- **Access:** `this.state.seed` (in `Platform.js`)
- **Type:** String
- **Range:** Any string (timestamp-based, e.g., `"1703123456789"`)
- **Source:** `Date.now().toString()` (generated on problem load)

---

## 8. Conversation History

**Source:** DynamoDB table → loaded per session via `sessionId`

**Location:** `aws/aiAgentGeneration/index.mjs` → `loadConversationHistory()`

**Fields:**
```javascript
conversationHistory = [
    {role: "user", content: "...", timestamp: number},
    {role: "assistant", content: "...", timestamp: number},
    // ... more messages
]
```

**How We Use It:**
- Loaded from DynamoDB on Lambda request
- Passed to `buildAgentPrompt()` → included in LLM prompt
- Updated after each response → saved to DynamoDB

**Storage:**
- DynamoDB table: keyed by `sessionId`
- Persisted across sessions

**How to Get Each Parameter:**

**conversationHistory:**
- **Access:** `loadConversationHistory(sessionId)` (in `index.mjs`)
- **Type:** Array of message objects
- **Structure:** `[{role, content, timestamp}, ...]`
- **Available Values:**
  - `role`: `"user"` | `"assistant"` | `"system"`
  - `content`: String (message text)
  - `timestamp`: Number (milliseconds, Unix timestamp)
- **Range:** Variable length array (grows with conversation)
- **Example:** `[{role: "user", content: "Help", timestamp: 1234567890}, {role: "assistant", content: "Sure!", timestamp: 1234567900}]`

**sessionId:**
- **Access:** `requestBody.sessionId` (in `index.mjs`)
- **Type:** String
- **Range:** UUID string or unique identifier
- **Example:** `"550e8400-e29b-41d4-a716-446655440000"`

---

## 9. Problem Context

**Source:** `AgentChatbox.js` → `getProblemContext()` method

**Fields (10+):**
```javascript
problemContext = {
    problemID: string,           // From props.problem.id
    lessonID: string,            // From props.lesson.id
    courseName: string,          // From props.courseName
    problemTitle: string,        // From props.problem.title
    problemBody: string,         // From props.problem.body
    currentStep: {               // From props.step
        id, title, body, answerType, problemType,
        correctAnswer, precision, choices,
        knowledgeComponents: array  // KCs tested in this step
    },
    variables: object,           // From props.problemVars
    seed: string                 // From props.seed
}
```

**How We Use It:**
- Passed to `analyzeStudentState()` as input parameter
- Used for: pattern matching (`correctAnswer`), skill filtering (`knowledgeComponents`)
- Sent to Lambda function via `AgentHelper.buildAgentRequest()`

**Currently Used:**
- ✅ `currentStep.correctAnswer` → pattern matching
- ✅ `currentStep.knowledgeComponents` → filter skills (after fix)
- ❌ `problemTitle`, `problemBody`, `currentStep.body`, `answerType`, `choices`, `variables`, `seed` → not used

**How to Get Each Parameter:**

**problemID:**
- **Access:** `problemContext.problemID` or `props.problem.id` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (problem identifier)
- **Example:** `"a01e792probsolve1"`

**lessonID:**
- **Access:** `problemContext.lessonID` or `props.lesson.id` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (lesson identifier)
- **Example:** `"5pH5Clb8-w1p3-vwGhVvzSof"`

**courseName:**
- **Access:** `problemContext.courseName` or `props.courseName` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (course name)
- **Example:** `"OpenStax: Elementary Algebra"`

**problemTitle:**
- **Access:** `problemContext.problemTitle` or `props.problem.title` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (problem title)
- **Example:** `"Solve Number Problems"`

**problemBody:**
- **Access:** `problemContext.problemBody` or `props.problem.body` (in `AgentChatbox.js`)
- **Type:** String (may contain LaTeX/HTML)
- **Range:** Any string (problem description)
- **Example:** `"Find three consecutive integers whose sum is 24"`

**currentStep.id:**
- **Access:** `problemContext.currentStep.id` or `props.step.id` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (step identifier)
- **Example:** `"a01e792probsolve1a"`

**currentStep.title:**
- **Access:** `problemContext.currentStep.title` or `props.step.stepTitle` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (step title)
- **Example:** `"Set up the equation"`

**currentStep.body:**
- **Access:** `problemContext.currentStep.body` or `props.step.stepBody` (in `AgentChatbox.js`)
- **Type:** String (may contain LaTeX/HTML)
- **Range:** Any string (step question/body)
- **Example:** `"What equation represents the sum of three consecutive integers?"`

**currentStep.answerType:**
- **Access:** `problemContext.currentStep.answerType` or `props.step.answerType` (in `AgentChatbox.js`)
- **Type:** String
- **Available Values:** `"arithmetic"`, `"string"`, `"number"`, `"expression"`, etc. (varies by step type)

**currentStep.problemType:**
- **Access:** `problemContext.currentStep.problemType` or `props.step.problemType` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (problem type classification)
- **Example:** `"TextBox"`, `"MultipleChoice"`

**currentStep.correctAnswer:**
- **Access:** `problemContext.currentStep.correctAnswer` or `props.step.stepAnswer` (in `AgentChatbox.js`)
- **Type:** String | Array
- **Range:** String or array of strings (correct answer(s))
- **Example:** `"x + (x+1) + (x+2) = 24"` or `["answer1", "answer2"]`

**currentStep.precision:**
- **Access:** `problemContext.currentStep.precision` or `props.step.precision` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (decimal precision for numeric answers)
- **Example:** `"2"` (2 decimal places)

**currentStep.choices:**
- **Access:** `problemContext.currentStep.choices` or `props.step.choices` (in `AgentChatbox.js`)
- **Type:** Array of strings
- **Range:** Variable length array (multiple choice options)
- **Example:** `["Option A", "Option B", "Option C"]` or `[]` (not multiple choice)

**currentStep.knowledgeComponents:**
- **Access:** `problemContext.currentStep.knowledgeComponents` or `props.step.knowledgeComponents` (in `AgentChatbox.js`)
- **Type:** Array of strings
- **Range:** Variable length array (KC names)
- **Available Values:** KC names from `skillModel.json` (e.g., `"find_factors"`, `"prime_factorizations"`)
- **Example:** `["linear_equations", "consecutive_integers"]`

**variables:**
- **Access:** `problemContext.variables` or `props.problemVars` (in `AgentChatbox.js`)
- **Type:** Object (key-value pairs)
- **Range:** Variable object with any keys/values
- **Example:** `{n: 8, sum: 24}` or `{}` (empty)

**seed:**
- **Access:** `problemContext.seed` or `props.seed` (in `AgentChatbox.js`)
- **Type:** String
- **Range:** Any string (timestamp-based)
- **Example:** `"1703123456789"`

---

## 10. Student Analysis

**Source:** `agent-logic.mjs` → `analyzeStudentState()` function (computed)

**Fields (4):**
```javascript
studentAnalysis = {
    strugglingWith: [],          // Array of struggle identifiers
    commonMistakes: [],          // Array of mistake types
    suggestedApproach: "",       // Teaching approach string
    confidenceLevel: "unknown"   // "low" | "unknown" (no "high" yet)
}
```

**How We Use It:**
- Computed from `studentState` + `problemContext`
- Passed to `buildAgentPrompt()` → included in LLM system prompt
- Used by AI to understand student's situation

**Decision Logic:**

**strugglingWith:**
- `attemptCount > 3` → `["multiple_attempts"]`
- `skillMastery[skill] < 0.5` (for skills in `currentStep.knowledgeComponents`) → `[skill]`

**commonMistakes:**
- Pattern: `"x + x + x"` + correct answer has `"x + (x+1) + (x+2)"` → `["consecutive_integers_concept"]`
- Pattern: `"="` but no `"x"` → `["missing_variable_setup"]`

**suggestedApproach:**
- If consecutive integers pattern → `"explain_consecutive_integers"`
- If missing variable pattern → `"guide_variable_identification"`
- Else → `""`

**confidenceLevel:**
- `attemptCount > 3` → `"low"`
- Else → `"unknown"`

**How to Get Each Parameter:**

**strugglingWith:**
- **Access:** `studentAnalysis.strugglingWith` (from `analyzeStudentState()`)
- **Type:** Array of strings
- **Available Values:**
  - `"multiple_attempts"` (string literal, when `attemptCount > 3`)
  - Skill names (e.g., `"find_factors"`, `"prime_factorizations"`) when `skillMastery[skill] < 0.5`
- **Range:** Variable length array (0+ items)
- **Example:** `["multiple_attempts", "find_factors"]` or `[]` (empty)

**commonMistakes:**
- **Access:** `studentAnalysis.commonMistakes` (from `analyzeStudentState()`)
- **Type:** Array of strings
- **Available Values:**
  - `"consecutive_integers_concept"` (pattern: `"x + x + x"` in answer)
  - `"missing_variable_setup"` (pattern: `"="` but no `"x"` in answer)
- **Range:** Variable length array (0-2 items currently)
- **Example:** `["consecutive_integers_concept"]` or `[]` (empty)

**suggestedApproach:**
- **Access:** `studentAnalysis.suggestedApproach` (from `analyzeStudentState()`)
- **Type:** String
- **Available Values:**
  - `"explain_consecutive_integers"` (when consecutive integers pattern matches)
  - `"guide_variable_identification"` (when missing variable pattern matches)
  - `""` (empty string, default if no pattern matches)
- **Range:** Empty string or approach identifier string

**confidenceLevel:**
- **Access:** `studentAnalysis.confidenceLevel` (from `analyzeStudentState()`)
- **Type:** String
- **Available Values:**
  - `"low"` (when `attemptCount > 3`)
  - `"unknown"` (default, no other conditions match)
  - `"high"` and `"medium"` - NOT currently set (could be added)
- **Range:** Enum of strings (currently only 2 values)

---

## State Flow Summary

```
BKT State (localStorage)
  ↓
Problem.js → extracts probMastery → studentState.skillMastery

Step State (ProblemCard.js)
  ↓
Problem.js → passes props → AgentIntegration → AgentChatbox
  ↓
AgentChatbox.js → getStudentState() → studentState
AgentChatbox.js → getProblemContext() → problemContext
  ↓
AgentHelper.js → buildAgentRequest() → Lambda
  ↓
Lambda (index.mjs) → analyzeStudentState() → studentAnalysis
  ↓
buildAgentPrompt() → includes studentAnalysis in LLM prompt
```

---

## Key Takeaways

1. **BKT State** - Per KC, 4 params, `probMastery` updates, others fixed
2. **Student State** - Extracted from props, 7+ fields, used in analysis
3. **Problem State** - Component state, 7 fields, NOT used in analysis
4. **Step State** - Component state, 13+ fields, feeds into studentState
5. **Hint State** - Component state, 5+ fields, NOT used in analysis
6. **Agent Chat State** - Component state, 6 fields, UI management only
7. **Platform State** - Component state, 4 fields, navigation only
8. **Conversation History** - DynamoDB, persisted, used in LLM prompt
9. **Problem Context** - Extracted from props, 10+ fields, used in analysis
10. **Student Analysis** - Computed from studentState + problemContext, 4 fields, used in LLM prompt
