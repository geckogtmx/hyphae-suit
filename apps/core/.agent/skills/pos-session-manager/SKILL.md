---
name: pos-session-manager
description: Implements Session state machine, shift management, and cash drawer audits. Use this skill when working on login/logout, opening/closing register, or shift reports.
---

# POS Session Manager

Manages the lifecycle of a sales terminal.

## 1. Lifecycle

`Closed` -> `ShiftOpen` -> `Locked` -> `ShiftOpen` -> `ShiftEnded` -> `Closed`

1. **ShiftOpen:** User logs in, counts cash drawer.
2. **Locked:** Temporary screen lock (Privacy). Background jobs continue.
3. **ShiftEnded:** End of day. Z-Report generated.

## 2. Cash Drawer Management

- **Starting Cash:** Recorded at ShiftOpen.
- **Pay ins/outs:** Any non-sale cash movement (e.g., vendor payment) must be logged with reason.
- **Blind Drop:** Staff counts cash *before* system tells them expected amount to prevent theft.

## 3. Data Schema

```typescript
interface Shift {
  id: string;
  staffId: string;
  terminalId: string;
  startTime: number;
  endTime?: number;
  startingCash: number;
  endingCash?: number; // Declared
  expectedCash?: number; // Calculated
  variance?: number; // expected - declared
  status: 'OPEN' | 'CLOSED';
}
```

## 4. Auto-Lock

If `idleTime > 15min`, transition to `Locked` state.
Require PIN to resume.
Do NOT close the shift; just block input.
