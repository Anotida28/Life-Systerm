# Backend Build Execution Plan (5 Steps + Review Agent)

This plan converts the current frontend server-action architecture into a dedicated backend service in five controlled steps.

## Agent Roster

- Agent A: API Contract and Transport Agent
- Agent B: Data and Prisma Agent
- Agent C: Domain Service Migration Agent
- Agent D: Frontend Integration Agent
- Agent E: Test and Reliability Agent
- Agent R: Reviewer Agent (bug and failure prevention)

Note: In this environment, one subagent can be run repeatedly with different missions to simulate the roles above.

## Step 1: API Contract Freeze and Backend Scaffolding

- Owner: Agent A
- Inputs:
  - `frontend/docs/server-action-contracts.md`
- Tasks:
  - Create backend project structure and route groups for daily, habits, weekly, insights.
  - Define request and response schemas from current action contracts.
  - Standardize response envelope: success, data, error.
- Deliverables:
  - Backend app scaffold with route placeholders.
  - Shared validation module aligned with current Zod constraints.
- Exit criteria:
  - Every existing server action has a mapped backend endpoint.
  - Route naming is stable and documented.

## Step 2: Database Hardening and Timezone Safety

- Owner: Agent B
- Tasks:
  - Resolve date storage risks before migration (date-only or strict UTC normalization strategy).
  - Add or validate constraints for ordering consistency and foreign-key integrity.
  - Refactor transaction boundaries where multi-step updates can partially commit.
- Deliverables:
  - Prisma schema migration(s) for safer date and ordering behavior.
  - Data migration script for existing records if needed.
- Exit criteria:
  - No duplicate-day risk from timezone drift.
  - No partial commits in ordering and streak paths.

## Step 3: Domain Logic Extraction to Backend Services

- Owner: Agent C
- Tasks:
  - Move daily, habit, weekly, and insights logic to backend services.
  - Preserve scoring and streak behavior exactly unless bug-fix changes are approved.
  - Ensure atomic operations for create-day, reorder, and completion toggles.
- Deliverables:
  - Service modules for daily record lifecycle, habits, weekly summary, insights.
  - Endpoint handlers wired to service layer.
- Exit criteria:
  - Backend outputs match existing payload contracts.
  - Critical race-prone operations are transaction-safe.

## Step 4: Frontend Cutover to Backend APIs

- Owner: Agent D
- Tasks:
  - Replace direct server-action domain calls with HTTP calls to backend.
  - Keep optimistic UI behavior and error rollback behavior in Today and Habits flows.
  - Maintain route revalidation strategy or replace with equivalent cache invalidation.
- Deliverables:
  - API client layer in frontend.
  - Updated action wrappers or direct client/server integration.
- Exit criteria:
  - User workflows unchanged: today tracking, habits, history, weekly review, insights.
  - No regression in perceived latency or interaction reliability.

## Step 5: Verification, Load Safety, and Release Readiness

- Owner: Agent E
- Tasks:
  - Add endpoint integration tests and concurrency tests.
  - Validate DST/timezone edge cases and date round-trip stability.
  - Validate high-volume behavior for streak recalculation and weekly summary reads.
- Deliverables:
  - Test suite and runbook.
  - Release checklist and rollback plan.
- Exit criteria:
  - All tests pass.
  - Concurrency and timezone checks pass.

## Reviewer Agent (Agent R) Follow-Up Workflow

Agent R runs after each PR and blocks merge on critical regressions.

### Mandatory review checks

- Validate timezone-safe date handling and date equality logic.
- Validate transaction integrity for multi-step mutations.
- Validate race conditions on ordering and streak updates.
- Validate structured error handling (no raw stack traces to clients).
- Validate empty-data math and serialization consistency.
- Validate API contract parity with `frontend/docs/server-action-contracts.md`.

### Critical issues Agent R must enforce first

- Habit creation ordering race under concurrent requests.
- Streak snapshot recalculation race and performance risk.
- Date uniqueness and timezone drift risk.
- Partial-commit risk in habit order synchronization.
- Missing exception handling in mutation handlers.

### Review output template

- Severity-ordered findings with file references.
- Failure scenario for each finding.
- Proposed fix and confidence level.
- Pass/fail gate decision for merge.

## Suggested Execution Sequence

1. Agent A and Agent B work first, with Agent R reviewing both before Step 3 starts.
2. Agent C executes service extraction while Agent R performs rolling reviews.
3. Agent D performs frontend cutover only after Step 3 passes Agent R checks.
4. Agent E runs full verification; Agent R performs final release gate review.