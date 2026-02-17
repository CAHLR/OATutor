# OATutor AI Agent - BKT Parameters, Analysis, and Formulas Documentation

## Table of Contents
1. [BKT Parameters - How They're Obtained](#bkt-parameters)
2. [probMastery Scope](#probmastery-scope)
3. [analyzeStudentState Calculation](#analyzestudentstate-calculation)
4. [Data Flow](#data-flow)
5. [Memory - Student State Tracking](#memory---student-state-tracking-and-analysis)

---

## BKT Parameters - How They're Obtained

### 1. Initial Values (Static Parameters)

**Location:** `src/content-sources/oatutor/bkt-params/defaultBKTParams.json`

Each **Knowledge Component (KC)** has four BKT parameters defined:

```json
{
    "find_factors": {
        "probMastery": 0.1,      // Initial probability of mastery
        "probTransit": 0.1,      // Probability of learning per opportunity
        "probSlip": 0.1,         // Probability of slipping (knowing but getting wrong)
        "probGuess": 0.1         // Probability of guessing correctly
    }
}

```

**How they're obtained:**

- **Empirically determined** through research/calibration
- Loaded in `App.js` (lines 44-46, 72-82)
- Can be **A/B tested** via `experimentalBKTParams.json`
- **Persisted per student** in browser storage/localStorage

---

### 2. BKT Parameters Overview

### Fixed Parameters

1. **`probTransit`** — Learning rate per opportunity (default: `0.1`)
2. **`probSlip`** — Probability of slipping when known (default: `0.1`)
3. **`probGuess`** — Probability of guessing correctly (default: `0.1`)

### Dynamic Parameter

**`probMastery`** — Current probability of mastery

- **Initial value:** `0.1`
- **Updated after each student answer**
- **Location:** `src/models/BKT/BKT-brain.js`

---

### 3. Mathematical Formulas

### For Correct Answer

$P(L_0|\text{correct}) = \frac{P(\text{correct}|L_0) \times P(L_0)}{P(\text{correct})}$

Where:

- $P(\text{correct}|L_0) = 1 - P(S)$  — student knows it AND doesn't slip
- $P(\text{correct}|\neg L_0) = P(G)$  — student guesses correctly
- $P(\text{correct}) = P(L_0) \times (1 - P(S)) + (1 - P(L_0)) \times P(G)$  — total probability of correct answer

### For Incorrect Answer

$P(L_0|\text{incorrect}) = \frac{P(\text{incorrect}|L_0) \times P(L_0)}{P(\text{incorrect})}$

Where:

- $P(\text{incorrect}|L_0) = P(S)$  — student knows it BUT slips
- $P(\text{incorrect}|\neg L_0) = 1 - P(G)$  — student guesses incorrectly
- $P(\text{incorrect}) = P(L_0) \times P(S) + (1 - P(L_0)) \times (1 - P(G))$  — total probability of incorrect answer

### Transit Probability (Learning Update)

$P(L_0)_{\text{new}} = P(L_0|\text{observation}) + [1 - P(L_0|\text{observation})] \times P(T)$

This accounts for learning during practice: even if the student didn't know it before, they might learn it with probability $P(T)$.

---

### 4. Step-by-Step Calculation Example

### Initial State

```python
probMastery = 0.1
probTransit = 0.1
probSlip = 0.1
probGuess = 0.1
```

---

### Scenario 1: Student Answers CORRECTLY

**Step 1: Calculate posterior probability**

```python
numerator = 0.1 × (1 - 0.1) = 0.1 × 0.9 = 0.09
denominator_component = (1 - 0.1) × 0.1 = 0.9 × 0.1 = 0.09
denominator = 0.09 + 0.09 = 0.18
P(L₀|correct) = 0.09 / 0.18 = 0.5
```

**Step 2: Add learning (transit)**

```python
P(L₀)_new = 0.5 + (1 - 0.5) × 0.1
          = 0.5 + 0.5 × 0.1
          = 0.5 + 0.05
          = 0.55
```

**Result:** `probMastery` updates from **0.1 → 0.55**

---

### Scenario 2: Student Answers INCORRECTLY

**Step 1: Calculate posterior probability**

```python
numerator = 0.1 × 0.1 = 0.01
denominator_component = (1 - 0.1) × (1 - 0.1) = 0.9 × 0.9 = 0.81
denominator = 0.01 + 0.81 = 0.82
P(L₀|incorrect) = 0.01 / 0.82 ≈ 0.0122

```

**Step 2: Add learning (transit)**

```python
P(L₀)_new = 0.0122 + (1 - 0.0122) × 0.1
          = 0.0122 + 0.9878 × 0.1
          = 0.0122 + 0.09878
          ≈ 0.111

```

**Result:** `probMastery` updates from **0.1 → 0.111** (small increase due to learning opportunity)

---

## probMastery Scope

**probMastery is per Knowledge Component (KC), NOT per course or topic**

- Each KC has independent `probMastery` stored in `bktParams[kc].probMastery`
- KCs are assigned to steps via `skillModel.json`: `{"stepID": ["kc1", "kc2", ...]}`
- Problem mastery = product of all KCs' probMastery: `problemMastery = ∏(probMastery_kc)`
- **Location:** `src/platform-logic/Platform.js` (lines 292-310) for problem selection

---

## analyzeStudentState Calculation

**Location:** `aws/aiAgentGeneration/agent-logic.mjs` lines 1-39

**Returns:**
```javascript
{
    strugglingWith: [],      // Array of struggle identifiers
    commonMistakes: [],      // Array of mistake types
    suggestedApproach: "",   // Teaching approach string
    confidenceLevel: "unknown" // "low" | "unknown"
}
```

**Rules:**
1. **Multiple attempts:** `IF attemptCount > 3` → `strugglingWith.push("multiple_attempts")`, `confidenceLevel = "low"`
2. **Low mastery:** `IF probMastery[skill] < 0.5` → add skill to `strugglingWith`
3. **Pattern matching:** Match answer patterns → add to `commonMistakes`, set `suggestedApproach`

**Pattern Matching Approaches:**
1. `"explain_consecutive_integers"` - When answer includes `"x + x + x"` and correct answer includes `"x + (x+1) + (x+2)"`
2. `"guide_variable_identification"` - When answer includes `"="` but not `"x"`

**Implementation:** `aws/aiAgentGeneration/agent-logic.mjs` (lines 24-36)

---

## Data Flow

```
Problem.js → answerMade() updates BKT
  ↓
AgentChatbox.js → getProblemContext() + getStudentState() + extractSkillMastery()
  ↓
AgentHelper.js → buildAgentRequest()
  ↓
Lambda (index.mjs) → analyzeStudentState() + buildAgentPrompt()
```

**Key Files:**
- BKT: `defaultBKTParams.json`, `BKT-brain.js`, `Problem.js`
- Extraction: `AgentChatbox.js` → `extractSkillMastery()`
- Analysis: `agent-logic.mjs` → `analyzeStudentState()`, `buildAgentPrompt()`

---

## Memory - Student State Tracking and Analysis

### Overview

The AI Agent integration uses comprehensive memory and state tracking to provide personalized tutoring. This section details all the memory components that feed into the AI's understanding of the student's learning state.

---

### 1. BKT (Bayesian Knowledge Tracing) Indicators

**Structure:** `bktParams[kc] = {probMastery, probTransit, probSlip, probGuess}`

**Initialization:** Loaded from `defaultBKTParams.json` in `App.js`, persisted per-student in localStorage
**Updates:** Only `probMastery` updates dynamically via `BKT-brain.js` after each answer
**Usage:** Extracted via `AgentChatbox.extractSkillMastery()`, passed as `studentState.skillMastery`

---

### 2. Skill Mastery Levels Extraction

**Location:** `AgentChatbox.js` → `extractSkillMastery()` (lines 325-335)

**Function:** Extracts `probMastery` from `bktParams` → `{skill: probMastery}` format
**Output:** `{"find_factors": 0.25, "prime_factorizations": 0.15, ...}`
**Usage:** Passed to agent as `studentState.skillMastery`, used for struggle detection

---

### 3. Attempt Count Tracking

**Location:** Currently incomplete (needs implementation)

**Current State:**
- **Referenced:** In `AgentChatbox.js` → `getStudentState()` (line 308)
- **Passed as:** `attempts` prop from `Problem.js` → `AgentIntegration`
- **Issue:** `Problem.js` passes `this.state.attempts` but this state doesn't exist
- **Actual tracking:** Happens in `ProblemCard.js` but not aggregated

#### Where It Should Be Tracked:

**Option 1: Per-Step Tracking (Recommended)**
- Track in `ProblemCard.js` state
- Increment on each incorrect submission
- Reset on step completion or problem change

**Option 2: Per-Problem Tracking**
- Track in `Problem.js` state
- Aggregate attempts across all steps
- Reset on problem completion

#### Current Implementation Gap:

```javascript
// Problem.js (line 778) - attempts prop passed but doesn't exist in state
<AgentIntegration
    attempts={this.state.attempts}  // ❌ This doesn't exist
    // ...
/>
```

**What needs to be done:**

1. **Add attempt tracking to ProblemCard.js:**
   ```javascript
   // In ProblemCard.js constructor
   this.state = {
       // ... existing state
       attempts: 0,
   };
   
   // In submit() method
   if (!isCorrect) {
       this.setState(prevState => ({
           attempts: prevState.attempts + 1
       }));
   }
   ```

2. **Pass attempts to Problem.js:**
   - Via callback or prop lifting
   - Aggregate if tracking per-problem

3. **Use in analyzeStudentState:**
   - Already used: `if (studentState.attemptCount > 3)`
   - Threshold: 3+ attempts triggers "multiple_attempts" struggle

#### Usage in AI Agent:

- **Threshold:** `attemptCount > 3` triggers:
  - `strugglingWith.push("multiple_attempts")`
  - `confidenceLevel = "low"`
- **Purpose:** Identifies students who need more help
- **In prompt:** Shown as "Attempt #: X" in student state section

---

### 4. Struggle Areas Analysis

**Location:** `agent-logic.mjs` → `analyzeStudentState()` (lines 1-39)

**Returns:** `{strugglingWith: [], commonMistakes: [], suggestedApproach: "", confidenceLevel: "unknown"}`

**Detection Rules:**
- `attemptCount > 3` → `strugglingWith.push("multiple_attempts")`, `confidenceLevel = "low"`
- `probMastery[skill] < 0.5` → add skill to `strugglingWith`
- Pattern matching → add to `commonMistakes`, set `suggestedApproach`

---

### 5. Common Mistakes Detection

**Mechanisms:**
- **WrongAnswerReasons enum:** `wrong`, `sameAsProblem`, `errored` (from `checkAnswer()`)
- **checkAnswer function:** Returns `[parsed, correctAnswer, WrongAnswerReasons]` - uses KAS for arithmetic comparison
- **Pattern matching:** In `analyzeStudentState()` - detects specific mistake patterns (consecutive integers, missing variables)

**Mistake Types:** `consecutive_integers_concept`, `missing_variable_setup`, `WrongAnswerReasons` enum values

---

### 6. Knowledge Components (KCs)

**Location:** `skillModel.json` - Maps `stepID → [kc1, kc2, ...]`

**How it works:**
- Each step can test multiple KCs simultaneously
- KCs link to BKT parameters in `bktParams.json`
- When student answers, all KCs in step are updated via `Problem.js` → `answerMade()`
- Extracted as `currentStep.knowledgeComponents` for agent context

---

### Memory Summary

**Components:** BKT parameters (probabilistic mastery) → Skill mastery extraction → Attempt tracking → Struggle analysis → Common mistake detection → Knowledge component mapping

**Purpose:** Provides comprehensive student state to enable personalized, context-aware AI tutoring
