# Life System

Life System is a personal discipline and performance platform built around a daily operating workflow. It combines recurring habits, flexible tasks, streaks, reflection, weekly review, history, and deterministic insights.

## Architecture

The repository has two deployable services:

- `frontend/`: Next.js 16 App Router UI
- `backend/`: Fastify API with Prisma

The backend is the source of truth for schema, persistence, seeding, and auth.

## Authentication

The app now uses real session-based login instead of a hard-coded frontend service user.

Seeded account:

- Username: `Lourence`
- Password: `RuvaMakoAno28`

By default, that login is attached to `DEFAULT_USER_ID`, so the seeded user can keep using the main local dataset.

## Database Strategy

- Local development: SQLite at `frontend/prisma/dev.db`
- Railway / production: PostgreSQL

The backend Prisma commands automatically choose the right schema based on `DATABASE_URL`, so local development stays lightweight while Railway can use a managed Postgres service.

## Local Setup

From repository root:

```bash
# 1) Configure and start the backend
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev

# 2) In a second terminal, start the frontend
cd ../frontend
npm install
npm run dev
```

Before starting:

- copy `backend/.env.example` to `backend/.env`
- copy `frontend/.env.example` to `frontend/.env.local`

App URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:4000`
- Health: `GET http://127.0.0.1:4000/health`

## Railway Deployment

Recommended Railway layout:

- `frontend` Railway service rooted at `frontend/`
- `backend` Railway service rooted at `backend/`
- `Postgres` Railway service attached to `backend`

Environment setup:

### Backend

- `DATABASE_URL` -> Railway Postgres `DATABASE_URL`
- `PORT` -> Railway provided
- `DEFAULT_USER_ID` -> keep `local-zw-user` or change if you want a different seeded account owner
- `SEED_LOGIN_USERNAME` -> `Lourence`
- `SEED_LOGIN_DISPLAY_NAME` -> `Lourence`
- `SEED_LOGIN_PASSWORD` -> `RuvaMakoAno28`
- `SESSION_TTL_DAYS` -> `30`
- `BACKEND_API_TOKEN` -> optional internal automation token only

### Frontend

- `BACKEND_URL` -> backend private URL, for example `http://<backend-private-domain>:<backend-port>`

The backend Railway start command already runs schema push + seed before boot via `npm run start:railway`.

## Core Capabilities

- Auto-create and load today's record
- Recurring habits loaded into each new day
- Personal and work task management
- Automatic rollover of incomplete personal and work tasks
- Weighted daily scoring and success threshold tracking
- Streak snapshots
- Daily notes and end-of-day review fields
- Weekly summary and editable reflection
- Deterministic insights over recent performance

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Fastify + TypeScript
- Prisma ORM
- SQLite for local dev
- PostgreSQL for Railway / production
- Tailwind CSS
- Framer Motion
- Zod

## Verification

Frontend:

- `npm run lint`
- `npm run test`
- `npm run build`

Backend:

- `npm run typecheck`
- `npm run test`
- `npm run build`
