---
name: handoff-writer
description: Automates DEV_HANDOFF.md updates for multi-model collaboration (Gemini + Claude). Use this skill at the END of every coding session to document what was completed, what is pending/broken, and specific instructions for the next AI model. Essential for maintaining continuity in the multi-model workflow.
---

# Handoff Writer

This skill enforces the Multi-Model Handoff Protocol for LOOM Engine development.

## The Handoff Mandate

> **You do not share context with the next model.**
> The only bridge between sessions is `DEV_HANDOFF.md`.

## When to Use

**ALWAYS** update `DEV_HANDOFF.md` before ending your session when you have:
- Made code changes
- Identified issues
- Left work incomplete
- Changed architectural decisions

## DEV_HANDOFF.md Format

```markdown
# DEV_HANDOFF.md

> **Last Updated:** [TIMESTAMP]
> **Last Model:** [Claude/Gemini]
> **Session Focus:** [Brief description]

---

## ✅ Completed This Session

- [Specific task 1 - file paths if relevant]
- [Specific task 2]
- [Specific task 3]

## ⚠️ Known Issues / Broken

- [ ] [Issue 1 - with file path and line number if applicable]
- [ ] [Issue 2]

## 🔄 In Progress / Pending

- [ ] [Task 1 - what remains to be done]
- [ ] [Task 2]

## 📋 Instructions for Next Model

[Specific, actionable instructions for the next model]

### Priority Order
1. [Most important task]
2. [Second priority]
3. [Third priority]

### Context Needed
- [File to read first]
- [Relevant documentation]

### Do NOT
- [Things to avoid]
- [Known dead ends]

---

## Session Log (Last 3 Sessions)

### [DATE] - [Model]
- Summary of work

### [DATE] - [Model]
- Summary of work
```

## Writing Effective Handoffs

### ✅ GOOD: Specific and Actionable

```markdown
## ✅ Completed This Session

- Implemented `SessionStateMachine` in `packages/core/src/session/StateMachine.ts`
- Added state transition tests in `StateMachine.test.ts` (all passing)
- Fixed type error in `L1ActiveMemory.flush()` method

## ⚠️ Known Issues / Broken

- [ ] `CheckpointService.createCheckpoint()` throws on empty L1 - needs null check
  - File: `packages/core/src/session/CheckpointService.ts:45`

## 📋 Instructions for Next Model

1. Fix the null check in CheckpointService (5 min fix)
2. Continue with session recovery implementation
3. Read `LOOM_DEVELOPMENT_PLAN.md` Phase 2 for context

### Do NOT
- Don't refactor StateMachine - it's working, just needs the recovery piece
```

### ❌ BAD: Vague and Unhelpful

```markdown
## Completed
- Worked on sessions

## Issues
- Something broken

## Next
- Fix it
```

## Handoff Checklist

Before ending your session, verify your handoff includes:

- [ ] **Timestamp**: When was this written?
- [ ] **Model ID**: Which model wrote this? (Claude/Gemini)
- [ ] **File Paths**: Specific files touched or relevant
- [ ] **Line Numbers**: For bugs/issues, include exact locations
- [ ] **Test Status**: Do tests pass? Which ones fail?
- [ ] **Priority Order**: What should next model do first?
- [ ] **Context Pointers**: What files should next model read?
- [ ] **Anti-Instructions**: What should next model NOT do?

## Updating the Handoff

### Reading First

Always read `DEV_HANDOFF.md` at session start:

```typescript
// Pseudocode for AI behavior
async function startSession() {
  const handoff = await read('DEV_HANDOFF.md');

  // Check what previous model did
  const completedTasks = parse(handoff, 'Completed');
  const knownIssues = parse(handoff, 'Known Issues');
  const instructions = parse(handoff, 'Instructions');

  // Follow the instructions
  await executeInstructions(instructions);
}
```

### Writing Last

Update before ending:

```typescript
async function endSession(workDone: WorkSummary) {
  const currentHandoff = await read('DEV_HANDOFF.md');

  const newHandoff = generateHandoff({
    timestamp: new Date().toISOString(),
    model: 'Claude', // or 'Gemini'
    completed: workDone.completed,
    issues: workDone.issues,
    pending: workDone.pending,
    instructions: generateInstructions(workDone),
    previousSessions: extractLastThreeSessions(currentHandoff),
  });

  await write('DEV_HANDOFF.md', newHandoff);
}
```

## Session Log Rotation

Keep only the last 3 sessions in the log:

```markdown
## Session Log (Last 3 Sessions)

### 2026-01-14 14:30 - Claude
- Implemented CheckpointService
- Fixed StateMachine transitions
- Tests: 12 passing, 0 failing

### 2026-01-14 10:00 - Gemini
- Set up session schema in Drizzle
- Created migration for sessions table
- Tests: 8 passing, 0 failing

### 2026-01-13 16:00 - Claude
- Initial SessionService skeleton
- Defined interfaces
- No tests yet
```

## Emergency Handoff

If you must stop unexpectedly:

```markdown
## ⚠️ EMERGENCY HANDOFF

**Reason:** [Why stopping abruptly]
**State:** [What state is the code in?]

### Critical Info
- Branch: `feature/session-lifecycle`
- Last file edited: `packages/core/src/session/Recovery.ts`
- Was in middle of: [What exactly]
- Tests: [Passing/Failing/Not run]

### To Resume
1. Read file X
2. The function Y was half-written
3. Next step was Z
```

## Integration with AI_CODEX.md

The handoff protocol is defined in `AI_CODEX.md` Section 3:

> 1. **Read First:** Always check `DEV_HANDOFF.md` at the start of your turn
> 2. **Write Last:** Before you exit, you **MUST** update `DEV_HANDOFF.md`

This skill enforces that mandate with structure and best practices.
