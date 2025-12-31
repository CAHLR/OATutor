# AI Agent Data Flow Guide

## Overview
This guide explains how each variable in the LLM prompt is accessed and passed through the system.

---

## Data Flow Chain

```
Platform.js → ProblemWrapper → Problem.js → AgentIntegration → AgentChatbox → AgentHelper → AWS Lambda → OpenAI
```

---

## Variables Fed to LLM

### 1. **Problem Context**

| Variable | Source | Path |
|----------|--------|------|
| `problemID` | `problem.id` | Props from Platform.js → Problem.js → AgentChatbox |
| `problemTitle` | `problem.title` | Props from Platform.js → Problem.js → AgentChatbox |
| `problemBody` | `problem.body` | Props from Platform.js → Problem.js → AgentChatbox |
| `courseName` | `lesson.courseName` | Props from Platform.js → Problem.js → AgentChatbox |
| `seed` | `this.state.seed` | Platform.js state → Problem.js props → AgentChatbox |
| `currentStep` | `getActiveStepData()` | Problem.js method → AgentChatbox calls it |
| `totalSteps` | `problem.steps.length` | Props from Platform.js → Problem.js → AgentChatbox |

**Key Method:** `AgentChatbox.getProblemContext()`

---

### 2. **Current Step (Active Question)**

| Variable | Source | Path |
|----------|--------|------|
| `stepId` | `step.stepId` | Problem.js.getActiveStepData() |
| `stepTitle` | `step.stepTitle` | Problem.js.getActiveStepData() |
| `stepBody` | `step.stepBody` | Problem.js.getActiveStepData() |
| `correctAnswer` | `step.correctAnswer` | Problem.js.getActiveStepData() |
| `knowledgeComponents` | `step.knowledgeComponents` | Problem.js.getActiveStepData() |

**Key Method:** `Problem.js.getActiveStepData()`
- Prioritizes `this.state.expandedAccordion` (currently open accordion)
- Falls back to first incorrect step
- Then first unanswered step
- Finally, last step

---

### 3. **Student State**

| Variable | Source | Path |
|----------|--------|------|
| `isCorrect` | `this.state.stepStates[stepIndex]` | Problem.js state → AgentChatbox |

**Key Method:** `AgentChatbox.getStudentState()`

---

### 4. **Attempt History**

| Variable | Source | Path |
|----------|--------|------|
| `attemptHistory` | `this.state.attemptHistory` | Problem.js state → AgentChatbox |

**Structure:**
```javascript
{
  "Problem Title": {
    "Question Text (Step Title)": ["attempt1", "attempt2", "attempt3"]
  }
}
```

**Updated By:** `Problem.js.answerMade()`
- Called when student submits an answer
- Records: `attemptedAnswer` and `questionText` (step.stepTitle)

---

### 5. **Lesson Mastery**

| Variable | Source | Path |
|----------|--------|------|
| `lessonMasteryMap` | `Platform.js.getLessonMasteryMap()` | Platform → ProblemWrapper → Problem → AgentIntegration → AgentChatbox |

**Structure:**
```javascript
{
  "lesson-id-1": 0.49,  // 49% mastery
  "lesson-id-2": 0.20,  // 20% mastery
}
```

**Processed By:** `AgentChatbox.getLessonGroupMastery()`
- Filters lessons in same main group (e.g., all Lesson 1.x)
- Excludes lessons with mastery < 15% (not attempted)
- Converts to array: `[{name: "Lesson 1.1 ...", mastery: 49}, ...]`

**Calculation:** `Platform.js.getLessonMasteryMap()`
- Averages all KC (Knowledge Component) masteries per lesson
- Uses `this.context.bktParams[kc].probMastery`

---

### 6. **Skill Mastery (for Current Problem)**

| Variable | Source | Path |
|----------|--------|------|
| `skillMastery` | `this.bktParams` | Problem.js (from ThemeContext) → AgentChatbox |

**Extracted By:** `AgentChatbox.extractRelevantSkillMastery()`
- Takes `currentStep.knowledgeComponents` (KC IDs for this problem)
- Looks up each KC in `bktParams`
- Returns object: `{kc1: 0.73, kc2: 0.45, ...}`

**Structure:**
```javascript
{
  "linear_equations": 0.73,          // 73% mastery
  "consecutive_integers": 0.45,      // 45% mastery
  "algebraic_expressions": 0.82      // 82% mastery
}
```

---

### 7. **BKT Parameters (Bayesian Knowledge Tracing)**

| Variable | Source | Path |
|----------|--------|------|
| `bktParams` | `this.context.bktParams` | ThemeContext → Problem.js → AgentChatbox |

**Contains:**
```javascript
{
  "kc_name": {
    probMastery: 0.73,    // Current mastery probability
    probTransit: 0.15,    // Learning rate
    probSlip: 0.10,       // Slip probability
    probGuess: 0.25       // Guess probability
  }
}
```

**Updated By:** Backend BKT algorithm when student answers questions

---

## Final Prompt Structure

```
PROBLEM CONTEXT:
  - courseName, problemTitle, currentStep, correctAnswer

STUDENT'S CURRENT STATE:
  - isCorrect (correct/incorrect/not attempted)

ATTEMPT HISTORY:
  - All previous attempts per question in this problem

LESSON MASTERY:
  - All attempted sub-lessons in same main lesson group
  - Format: "Lesson 1.1 Order of Operations: 49%"

RELEVANT SKILL LEVELS:
  - KCs specific to current problem step
  - Format: "linear_equations: 73% mastery"

CRITICAL RULES & TEACHING GUIDELINES:
  - Hardcoded prompting rules for LLM behavior
```

---

## Key Differences

| Feature | Lesson Mastery | Skill Mastery |
|---------|----------------|---------------|
| **Scope** | Entire sub-lessons (e.g., all of Lesson 1.1) | Individual KCs for current step |
| **Granularity** | Coarse (sub-lesson level) | Fine (KC level) |
| **Purpose** | Context about related lessons | Skill detail for this problem |
| **Example** | "Lesson 1.1 Order of Operations: 49%" | "linear_equations: 73%" |
| **Calculation** | Average of all KCs in sub-lesson | Direct from bktParams for step KCs |

---

## Testing

### Browser Console:
```bash
npm start
# Open http://localhost:3000
# F12 → Console → Look for [getLessonGroupMastery] logs
```

### Backend Prompt:
```bash
cd aws/aiAgentGeneration
node test-clean.mjs
# See full prompt with LESSON MASTERY section
```

### AWS CloudWatch:
```
1. Deploy updated Lambda
2. Use AI Tutor in browser
3. Check CloudWatch Logs for full prompt
```

---

## Summary

**All data flows through props/context:**
1. `Platform.js` calculates lesson mastery & holds BKT params
2. `Problem.js` tracks attempt history & current step state
3. `AgentChatbox` aggregates everything into `problemContext` + `studentState`
4. `AgentHelper` sends to AWS Lambda
5. `agent-logic.mjs` builds final LLM prompt
6. OpenAI receives complete context

**Result:** LLM has full visibility into student's progress, struggles, and current problem context.

