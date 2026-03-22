# Life System

Life System is a personal discipline and performance platform built around a daily operating workflow. It combines recurring habits, flexible tasks, streaks, weekly review, history, and deterministic insights.

## Current Architecture

The repository has two active apps:

- `frontend/`: Next.js 16 App Router UI and server actions
- `backend/`: Fastify API service with Prisma

The backend is the single source of truth for data, schema, seeding, and local database setup. In local development, both apps point at the same SQLite file: `frontend/prisma/dev.db`.

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

## Score Model

- Habits: `50%`
- Personal tasks: `25%`
- Work tasks: `25%`
- `scorePercent = round(((habitsScore * 0.5) + (personalScore * 0.25) + (workScore * 0.25)) * 100)`
- Success threshold: `scorePercent >= 80`

## Timezone and Date Rules

- App timezone is fixed to `Africa/Harare` for date normalization, streak boundaries, and weekly ranges.

## Local Setup

From repository root:

```bash
# 1) Install and configure the backend
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# 2) Start the backend
npm run dev

# 3) In a second terminal, install and start the frontend
cd ../frontend
npm install
npm run dev
```

Before starting the apps:

- copy `backend/.env.example` to `backend/.env`
- copy `frontend/.env.example` to `frontend/.env.local`

App URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:4000`
- Health: `GET http://127.0.0.1:4000/health`

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="file:../../frontend/prisma/dev.db"
PORT="4000"
NODE_ENV="development"
BACKEND_API_TOKEN="dev-local-token"
DEFAULT_USER_ID="local-zw-user"
SEED_DEMO_DAY="false"
```

### Frontend (`frontend/.env.local`)

```env
BACKEND_URL="http://127.0.0.1:4000"
BACKEND_API_TOKEN="dev-local-token"
BACKEND_USER_ID="local-zw-user"
```

## Route Surface

Frontend routes:

- `/`
- `/today`
- `/habits`
- `/history`
- `/history/[date]`
- `/weekly`
- `/insights`

Backend API groups:

- `/health`
- `/api/habits`
- `/api/daily`
- `/api/history`
- `/api/weekly`
- `/api/insights`

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Fastify + TypeScript
- Prisma ORM
- SQLite
- Tailwind CSS
- Framer Motion
- Zod

## Testing and Quality Commands

Frontend (`frontend/`):

- `npm run lint`
- `npm run test`
- `npm run build`

Backend (`backend/`):

- `npm run typecheck`
- `npm run test`
- `npm run build`
