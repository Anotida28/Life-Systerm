# Life System Backend

Fastify + TypeScript API service for Life System, backed by Prisma and SQLite.

## Role in the Repo

The backend is the canonical source of truth for:

- Prisma schema
- database setup
- seed data
- validation and persistence rules
- API error semantics

The local development database lives at `frontend/prisma/dev.db`, but it is owned by the backend setup flow.

## Setup

From repository root:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Before running the server, copy `.env.example` to `.env`.

Defaults:

- API: `http://127.0.0.1:4000`
- Health: `GET /health`

## Environment Variables

Defined in `.env.example`:

- `DATABASE_URL` default `file:../../frontend/prisma/dev.db`
- `PORT` default `4000`
- `NODE_ENV` default `development`
- `BACKEND_API_TOKEN` required bearer token for `/api/*`
- `DEFAULT_USER_ID` default seeded user and request fallback
- `SEED_DEMO_DAY` optional demo-data toggle for `npm run prisma:seed`

## Authentication and User Isolation

- `/health` is public.
- All `/api/*` routes require:
  - `Authorization: Bearer <BACKEND_API_TOKEN>`
  - `x-user-id: <user-id>`
- User records are auto-upserted on authenticated requests.
- Core records are scoped by `userId`.

## Error Contract

The API returns a consistent response envelope:

- `success`
- `data`
- `error`

Structured backend errors currently resolve to:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `409 CONFLICT`
- `500 INTERNAL_ERROR`

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
- `PATCH /api/daily/tasks/:id/move`
- `DELETE /api/daily/tasks/:id`
- `PATCH /api/daily/habits/:id/toggle`
- `PATCH /api/daily/notes`
- `PATCH /api/daily/review`

### History

- `GET /api/history`
- `GET /api/history/:date`

### Weekly

- `GET /api/weekly/summary`
- `PATCH /api/weekly/reviews/:id`

### Insights

- `GET /api/insights`
- `POST /api/insights/refresh`

## Business Rules

- Dates normalize to `Africa/Harare`.
- Habits are weighted at 50%, personal tasks 25%, work tasks 25%.
- Success threshold is 80%.
- Creating a new day loads active habits and rolls over incomplete personal and work tasks.
- Score-changing mutations recalculate daily metrics and streak snapshots.

## Scripts

- `npm run dev` start backend in watch mode
- `npm run build` compile TypeScript
- `npm run start` run compiled output
- `npm run typecheck` TypeScript no-emit check
- `npm run test` run backend tests
- `npm run prisma:generate` generate Prisma client
- `npm run prisma:push` push schema to the local DB
- `npm run prisma:seed` seed default habits and optional demo data
