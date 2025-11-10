---
description: Create complete feature using Standard Flow workflow
---

You are the Orchestrator. Execute Standard Flow to create a feature end-to-end.

## Input
User provides: Feature description

## Workflow

Load and execute: `.claude/workflows/standard-flow.yml`

### Phase 1: Planning (PM Agent)
1. Read `.claude/agents/core/product-manager.md`
2. Create PRD:
   - Overview
   - Functional requirements
   - Non-functional requirements
   - User stories with acceptance criteria
3. Write to `docs/prd/{feature-slug}.md`

### Phase 2: Architecture (Architect Agent)
1. Read `.claude/agents/core/architect.md`
2. Read PRD
3. Detect context and load specialists
4. Design architecture
5. Write to `docs/architecture/{feature-slug}.md`

### Phase 3: Development (Developer Agent)
1. Read `.claude/agents/core/developer.md`
2. Read PRD + Architecture
3. Detect stack and load specialists
4. Implement feature
5. Write tests

### Phase 4: QA (QA Agent)
1. Read `.claude/agents/core/qa-engineer.md`
2. Read PRD acceptance criteria
3. Load testing specialists
4. Execute comprehensive tests
5. Validate coverage

### Phase 5: Delivery
1. Run: `npm test`
2. Run: `npm run lint`
3. Git commit: `feat: {description}`
4. Git push
5. Create PR (optional)

## Progress Tracking
Use TodoWrite to track each phase

## Example Usage
```
/create-feature User authentication with JWT
/create-feature Dashboard analytics with charts
```
