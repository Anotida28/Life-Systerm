# Life System Backend

Dedicated API service for Life System, built with Fastify + TypeScript + Prisma.

## Current Status

Initial backend scaffold is implemented with:

- API server bootstrap and centralized error handling
- Prisma client and local SQLite connection support
- Contract-style response envelope (`success`, `data`, `error`)
- Health endpoint
- Habit endpoints (list/create/update/activate/reorder)
- Daily endpoints (today load/create, task create/update/toggle/delete, habit toggle, notes/review update)
- Weekly and insights route placeholders (`501 Not Implemented`)

## Setup

From repository root:

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run dev
```

Server default:

- `http://127.0.0.1:4000`

Health check:

- `GET /health`

## Environment Variables

Defined in `.env.example`:

- `DATABASE_URL` defaults to `file:../../frontend/prisma/dev.db`
- `PORT` defaults to `4000`
- `NODE_ENV` defaults to `development`
- `BACKEND_API_TOKEN` token required for all `/api/*` endpoints
- `DEFAULT_USER_ID` default local user bootstrap id

## Authentication and User Isolation

- `/health` is public.
- All `/api/*` endpoints require:
	- `Authorization: Bearer <BACKEND_API_TOKEN>`
	- `x-user-id: <user-id>`
- Backend data is scoped by `userId` on core tables (`Habit`, `DailyRecord`, `WeeklyReview`, `InsightSnapshot`).
- User records are upserted automatically when valid authenticated requests arrive.

## Implemented Endpoints

### Health

- `GET /health`

### Habits

- `GET /api/habits`
- `POST /api/habits`
- `PATCH /api/habits/:id`
- `PATCH /api/habits/:id/active`
- `PATCH /api/habits/:id/position`

### Daily

- `GET /api/daily/today`
- `POST /api/daily/tasks`
- `PATCH /api/daily/tasks/:id/title`
- `PATCH /api/daily/tasks/:id/toggle`
- `DELETE /api/daily/tasks/:id`
- `PATCH /api/daily/habits/:id/toggle`
- `PATCH /api/daily/notes`
- `PATCH /api/daily/review`

### Weekly (placeholder)

- `GET /api/weekly/summary` -> `501`
- `PATCH /api/weekly/reviews/:id` -> `501`

### Insights (placeholder)

- `GET /api/insights` -> `501`
- `POST /api/insights/refresh` -> `501`

## Next Build Targets

1. Move weekly summary domain logic into backend service and implement `GET /api/weekly/summary`.
2. Move insights domain logic into backend service and implement insights endpoints.
3. Add transaction hardening for ordering and streak recalculation paths.
4. Add integration tests and concurrency tests before frontend cutover.
