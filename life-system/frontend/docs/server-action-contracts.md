# Server Action Contract Map

This document defines the current server action contracts used by the app.
Server actions are already thin wrappers around the backend API.

## Conventions

- Input validation happens in the frontend action layer with Zod.
- Persistence and canonical business rules live in the backend.
- Most successful mutations trigger `revalidatePath`.
- Backend failures surface in the frontend as `BackendRequestError`.
- Dates in serialized view models use `yyyy-MM-dd` keys in `Africa/Harare`.

## Shared Payload Types

- Daily record payload: `DailyRecordView` in `frontend/types/index.ts`
- Habit payload: `HabitView[]` in `frontend/types/index.ts`
- Weekly review payload: `WeeklyReviewView` in `frontend/types/index.ts`
- Insights payload: `InsightsView` in `frontend/types/index.ts`

## Current Action to Endpoint Mapping

### Daily (`frontend/actions/daily.ts`)

- `getTodayAction` -> `GET /api/daily/today`
- `refreshTodayAction` -> `GET /api/daily/today`
- `toggleDailyHabitAction` -> `PATCH /api/daily/habits/:id/toggle`
- `createTaskAction` -> `POST /api/daily/tasks`
- `updateTaskAction` -> `PATCH /api/daily/tasks/:id/title`
- `toggleTaskAction` -> `PATCH /api/daily/tasks/:id/toggle`
- `moveTaskAction` -> `PATCH /api/daily/tasks/:id/move`
- `deleteTaskAction` -> `DELETE /api/daily/tasks/:id`
- `updateDailyNotesAction` -> `PATCH /api/daily/notes`
- `updateDailyReviewAction` -> `PATCH /api/daily/review`

### Habits (`frontend/actions/habits.ts`)

- `getHabitsAction` -> `GET /api/habits`
- `createHabitAction` -> `POST /api/habits`
- `updateHabitAction` -> `PATCH /api/habits/:id`
- `toggleHabitActiveAction` -> `PATCH /api/habits/:id/active`
- `moveHabitAction` -> `PATCH /api/habits/:id/position`

### Weekly (`frontend/actions/weekly.ts`)

- `updateWeeklyReviewAction` -> `PATCH /api/weekly/reviews/:id`

### Insights (`frontend/actions/insights.ts`)

- `refreshInsightsAction` -> `POST /api/insights/refresh`

## Revalidation Behavior

- Daily mutations revalidate `/`, `/today`, `/history`, `/weekly`, `/insights`, and the current `/history/[date]` detail route when applicable.
- Habit mutations revalidate `/`, `/today`, and `/habits`.
- Weekly review updates revalidate `/weekly`.
- Insight refresh revalidates `/insights`.

## Backend Error Contract

Backend responses use the envelope:

- `success`
- `data`
- `error`

Current error codes:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `409 CONFLICT`
- `500 INTERNAL_ERROR`
