# Life System Backend

Fastify + TypeScript API service for Life System, backed by Prisma.

## Role in the Repo

The backend owns:

- Prisma schema and client generation
- user/session authentication
- seed data
- scoring and persistence rules
- API error semantics

## Database Mode

The backend is designed to work in two modes:

- Local dev: SQLite at `frontend/prisma/dev.db`
- Railway / production: PostgreSQL

`npm run prisma:generate` and `npm run prisma:push` automatically detect the database type from `DATABASE_URL` and select the matching Prisma schema.

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

Copy `.env.example` to `.env` before running the server.

## Seeded Login

Default seeded login:

- Username: `Lourence`
- Password: `RuvaMakoAno28`

By default the seeded login is attached to `DEFAULT_USER_ID`, which lets the login account reuse the main local dataset.

## Environment Variables

Important variables in `.env.example`:

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `DEFAULT_USER_ID`
- `SEED_LOGIN_USERNAME`
- `SEED_LOGIN_DISPLAY_NAME`
- `SEED_LOGIN_PASSWORD`
- `SESSION_TTL_DAYS`
- `SEED_DEMO_DAY`
- `BACKEND_API_TOKEN` optional internal service token for non-session automation and tests

## Authentication

Public endpoints:

- `GET /health`
- `POST /api/auth/login`

Authenticated user endpoints accept a bearer session token:

- `Authorization: Bearer <session-token>`

The old internal token + `x-user-id` flow is still supported for automated tests and internal service access when `BACKEND_API_TOKEN` is configured.

## Error Contract

The API response envelope is:

- `success`
- `data`
- `error`

Current structured errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `409 CONFLICT`
- `500 INTERNAL_ERROR`

## Implemented Endpoints

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

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

## Railway

This directory includes `railway.toml`.

Recommended Railway service settings:

- service root: `backend/`
- attached database: Railway PostgreSQL
- start command: `npm run start:railway`
- health check: `/health`

`npm run start:railway` runs:

1. `prisma db push`
2. `prisma seed`
3. `node dist/server.js`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run start:railway`
- `npm run typecheck`
- `npm run test`
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`
