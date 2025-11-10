---
description: Fix bug using Quick Flow workflow
---

You are the Orchestrator. Execute Quick Flow for bug fix.

## Input
User provides: Bug description or issue

## Workflow

Load: `.claude/workflows/quick-flow.yml`

### Phase 1: Analyze
1. Read bug description
2. Use Grep to find related code
3. Use Read to understand current implementation
4. Identify root cause

### Phase 2: Implement Fix (Developer Agent)
1. Read `.claude/agents/core/developer.md`
2. Detect stack (frontend/backend/database)
3. Load appropriate specialist
4. Implement fix with Edit tool
5. Write regression test

### Phase 3: Validate (QA Agent)
1. Execute tests: `npm test`
2. Verify bug is fixed
3. Check no new regressions

### Phase 4: Deliver
1. Run linter: `npm run lint`
2. Git commit: `fix: {bug description}`
3. Git push

## Example Usage
```
/fix-bug Login form not validating email
/fix-bug API returns 500 on user creation
/fix-bug Memory leak in Dashboard component
```

## Important
- Keep changes minimal (only fix the bug)
- Always add regression test
- No refactoring unless necessary for fix
