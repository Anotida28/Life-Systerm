# Server Action Contract Map

This document defines the current server action contracts used by the app.
It is the source blueprint for extracting a dedicated backend API later.

## Conventions

- Validation failures throw from Zod parsing in action handlers.
- Database errors bubble up from Prisma operations.
- Most mutation actions trigger route revalidation using `revalidatePath`.
- Dates in view models are serialized as `yyyy-MM-dd` date keys.

## Shared Type References

- Daily record payload: `DailyRecordView` in `frontend/types/index.ts`
- Habit payload: `HabitView[]` in `frontend/types/index.ts`
- Weekly review payload: `WeeklyReviewView` in `frontend/types/index.ts`
- Insights payload: `InsightsView` in `frontend/types/index.ts`

## Daily Actions (`frontend/actions/daily.ts`)

### `toggleDailyHabitAction`

- Purpose: mark a daily habit complete/incomplete and recalculate metrics.
- Input:
  - `id: string` (required, min length 1)
  - `completed: boolean`
- Validation schema: `toggleEntitySchema`
- Side effects:
  - updates `DailyHabit.completed`
  - recalculates `DailyRecord` aggregate metrics
  - refreshes streak snapshots for all records
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `createTaskAction`

- Purpose: add a task to a daily record.
- Input:
  - `dailyRecordId: string` (required, min length 1)
  - `title: string` (trimmed, 1-120 chars)
  - `type: "PERSONAL" | "WORK"`
- Validation schema: `createTaskSchema`
- Side effects:
  - inserts `DailyTask` with order at end of type bucket
  - recalculates record metrics
  - refreshes streak snapshots
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `updateTaskAction`

- Purpose: rename a task title.
- Input:
  - `taskId: string` (required, min length 1)
  - `title: string` (trimmed, 1-120 chars)
- Validation schema: `updateTaskSchema`
- Side effects:
  - updates `DailyTask.title`
  - does not recalculate score metrics (title-only change)
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `toggleTaskAction`

- Purpose: mark task complete/incomplete and recalculate metrics.
- Input:
  - `id: string` (required, min length 1)
  - `completed: boolean`
- Validation schema: `toggleEntitySchema`
- Side effects:
  - updates `DailyTask.completed`
  - recalculates record metrics
  - refreshes streak snapshots
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `deleteTaskAction`

- Purpose: delete a task from a daily record.
- Input:
  - `id: string` (required, min length 1)
- Validation schema: `toggleEntitySchema.pick({ id: true })`
- Side effects:
  - deletes `DailyTask`
  - recalculates record metrics
  - refreshes streak snapshots
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `moveTaskAction`

- Purpose: reorder tasks within their type (`PERSONAL` or `WORK`).
- Input:
  - `id: string` (required, min length 1)
  - `direction: "up" | "down"`
- Validation schema: `moveEntitySchema`
- Side effects:
  - swaps `DailyTask.order` with neighbor in same type group when possible
  - no score/streak recalculation required (ordering-only change)
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `updateDailyNotesAction`

- Purpose: update day notes.
- Input:
  - `dailyRecordId: string` (required, min length 1)
  - `notes: string` (max 5000 chars)
- Validation schema: `updateNotesSchema`
- Side effects:
  - updates `DailyRecord.notes`
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

### `updateDailyReviewAction`

- Purpose: update end-of-day review fields.
- Input:
  - `dailyRecordId: string` (required, min length 1)
  - `mood: number | null` (if number, integer 1-5)
  - `energy: number | null` (if number, integer 1-5)
  - `winOfTheDay: string` (max 1000 chars)
  - `whatSlowedMeDown: string` (max 1000 chars)
- Validation schema: `updateReviewSchema`
- Side effects:
  - updates review columns on `DailyRecord`
- Revalidation:
  - `/`, `/today`, `/history`, `/weekly`, `/insights`, `/history/{dateKey}`
- Returns: `DailyRecordView`

## Habit Actions (`frontend/actions/habits.ts`)

### `getHabitsAction`

- Purpose: fetch habit library.
- Input: none
- Validation: n/a
- Revalidation: none
- Returns: `HabitView[]`

### `createHabitAction`

- Purpose: create a habit and append to ordering.
- Input:
  - `name: string` (trimmed, 1-80 chars)
- Validation schema: `habitSchema`
- Side effects:
  - inserts `Habit`
  - if today's record exists, inserts matching `DailyHabit` for today
- Revalidation:
  - `/habits`, `/today`, `/`
- Returns: `HabitView[]`

### `updateHabitAction`

- Purpose: rename an existing habit.
- Input:
  - `id: string` (required, min length 1)
  - `name: string` (trimmed, 1-80 chars)
- Validation schema: `habitSchema.extend({ id: z.string().min(1) })`
- Side effects:
  - updates `Habit.name`
  - updates today's matching `DailyHabit.labelSnapshot` if today exists
- Revalidation:
  - `/habits`, `/today`, `/`
- Returns: `HabitView[]`

### `toggleHabitActiveAction`

- Purpose: activate/archive a habit.
- Input:
  - `id: string` (required, min length 1)
  - `isActive: boolean`
- Validation schema: inline `z.object({ id, isActive })`
- Side effects:
  - updates `Habit.isActive`
  - does not remove historical daily habit rows
- Revalidation:
  - `/habits`, `/today`, `/`
- Returns: `HabitView[]`

### `moveHabitAction`

- Purpose: reorder habits.
- Input:
  - `id: string` (required, min length 1)
  - `direction: "up" | "down"`
- Validation schema: `moveEntitySchema`
- Side effects:
  - swaps global `Habit.order`
  - if today's record exists, syncs matching `DailyHabit.order`
- Revalidation:
  - `/habits`, `/today`, `/`
- Returns: `HabitView[]`

## Weekly Action (`frontend/actions/weekly.ts`)

### `updateWeeklyReviewAction`

- Purpose: persist free-text weekly reflection fields.
- Input:
  - `reviewId: string` (required, min length 1)
  - `whatWentWell: string` (max 2000 chars)
  - `whatWentBadly: string` (max 2000 chars)
  - `whatNeedsToImprove: string` (max 2000 chars)
  - `nextWeekGoals: string` (max 2000 chars)
- Validation schema: inline `z.object(...)`
- Side effects:
  - updates `WeeklyReview` text fields
- Revalidation:
  - `/weekly`
- Returns: `WeeklyReviewView`

## Insights Action (`frontend/actions/insights.ts`)

### `refreshInsightsAction`

- Purpose: recompute insight view from latest records.
- Input: none
- Validation: n/a
- Side effects:
  - computes deterministic insights (+ AI boundary passthrough)
  - currently does not persist snapshot rows
- Revalidation:
  - `/insights`
- Returns: `InsightsView`

## Domain-to-API Extraction Notes

When extracting to backend routes later, map actions to HTTP endpoints:

- Daily: `PATCH /daily/habits/{id}`, `POST /daily/tasks`, `PATCH /daily/tasks/{id}`, `DELETE /daily/tasks/{id}`, `PATCH /daily/records/{id}/notes`, `PATCH /daily/records/{id}/review`
- Habits: `GET /habits`, `POST /habits`, `PATCH /habits/{id}`, `PATCH /habits/{id}/active`, `PATCH /habits/{id}/position`
- Weekly: `PATCH /weekly/reviews/{id}`
- Insights: `POST /insights/refresh` or `GET /insights`

Suggested response envelope for backend parity:

- success: boolean
- data: payload type
- error: optional structured error (`code`, `message`, `fieldErrors`)