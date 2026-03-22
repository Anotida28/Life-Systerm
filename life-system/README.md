# Life System

Life System is a premium personal discipline and performance platform built as a mobile-first daily operating system. It combines non-negotiables, personal tasks, work tasks, rollover handling, reflection, weighted scoring, streak tracking, weekly review, and deterministic insights in one cohesive product.

## Product Overview

Core daily questions:

1. What must I do today?
2. What did I actually do?
3. How well did I perform?
4. What patterns should I improve?

Life System is designed as a strong MVP with clean expansion points for AI summaries, reminders, PWA installability, authentication, cloud sync, charts, exports, and richer analytics.

## Screenshots

Add screenshots here as the UI evolves:

- `Dashboard`
- `Today`
- `Habits`
- `History`
- `Weekly Review`
- `Insights`

## MVP Features

- Auto-created daily records
- Recurring non-negotiables seeded with `Pray`, `Gym`, and `Course`
- Personal and work task capture with instant save interactions
- Automatic rollover for incomplete personal and work tasks
- Weighted daily score that updates live
- Success threshold and streak tracking
- Daily notes and end-of-day review fields
- Dashboard overview with weekly context
- History list and daily detail views
- Weekly review with saved reflection fields
- Deterministic insights engine with AI-ready boundaries
- Premium dark-first interface with elegant light mode support

## Scoring Logic

Category weights:

- Non-negotiables: `50%`
- Personal tasks: `25%`
- Work tasks: `25%`

Category score formulas:

- `habitsScore = H_total === 0 ? 1 : H_done / H_total`
- `personalScore = P_total === 0 ? 1 : P_done / P_total`
- `workScore = W_total === 0 ? 1 : W_done / W_total`

Final score:

- `score = round(((habitsScore * 0.5) + (personalScore * 0.25) + (workScore * 0.25)) * 100)`

Stored day metrics include:

- completed and missed totals
- per-category completion counts
- per-category scores
- final `scorePercent`
- success flag
- streak snapshots

## Streak Logic

- A successful day is any day with `score >= 80`
- Successful day: current streak increments
- Unsuccessful day: current streak resets to `0`
- Longest streak persists historically
- Each `DailyRecord` stores `currentStreakSnapshot` and `longestStreakSnapshot`

## Rollover Logic

When a new day is created:

- active habits are loaded into the day
- incomplete `PERSONAL` tasks from yesterday are copied forward
- incomplete `WORK` tasks from yesterday are copied forward
- carried tasks keep their title and type
- carried tasks are marked with:
  - `isCarriedOver = true`
  - `carriedOverFromDate`

Non-negotiables do not roll over because they recur automatically.

## Architecture

The app is split into a single working Next.js application in `frontend/` plus a backend placeholder in `backend/`.

High-level architecture:

- `frontend/app/`
  Route entry points for dashboard, today, habits, history, weekly review, and insights.
- `frontend/components/`
  Domain-specific UI grouped by dashboard, daily, habits, history, insights, layout, shared, and weekly.
- `frontend/lib/domain/`
  Centralized domain logic for day creation, scoring, streaks, dashboard stats, history, weekly summaries, and insights.
- `frontend/actions/`
  Server actions for daily mutations, habit management, insights refresh, and weekly review updates.
- `frontend/prisma/`
  Prisma schema, seed script, checked-in SQL migration, and the migration runner.
- `frontend/lib/ai/`
  AI-ready service boundary that currently returns rule-based analysis.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Lucide React
- Framer Motion
- Zod
- date-fns
- shadcn-style component primitives built in the codebase

## Folder Structure

```text
life-system/
  backend/
    README.md
  frontend/
    actions/
    app/
    components/
      dashboard/
      daily/
      habits/
      history/
      insights/
      layout/
      shared/
      weekly/
    hooks/
    lib/
      ai/
      domain/
    prisma/
      migrations/
      schema.prisma
      seed.ts
      migrate.ts
    public/
    styles/
    types/
  README.md
```

## Local Setup

From the repository root:

```bash
cd frontend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

`frontend/.env`

```env
DATABASE_URL="file:./dev.db"
SEED_DEMO_DAY="false"
```

Notes:

- `DATABASE_URL` points to the local SQLite database file.
- `SEED_DEMO_DAY="true"` optionally seeds an example historical day in addition to the default habits.

## Database Workflow

Prisma assets:

- schema: `frontend/prisma/schema.prisma`
- migration SQL: `frontend/prisma/migrations/0001_init/migration.sql`
- migration runner: `frontend/prisma/migrate.ts`
- seed script: `frontend/prisma/seed.ts`

Commands:

- `npm run db:generate`
  Regenerates the Prisma client from the schema.
- `npm run db:migrate`
  Applies the checked-in Prisma SQL migrations to the SQLite database.
- `npm run db:seed`
  Seeds default habits and optional demo data.
- `npm run db:studio`
  Opens Prisma Studio.

## Routes

- `/` dashboard
- `/today` daily workflow
- `/habits` non-negotiables management
- `/history` daily archive
- `/history/[date]` daily detail
- `/weekly` weekly review
- `/insights` data-driven analysis

## AI-Ready Extension Path

Current boundary:

- `frontend/lib/ai/performance.ts`

Current functions:

- `analyzePerformanceData(data, fallbackInsights)`
- `summarizeWeek(data, fallbackSummary)`
- `recommendOptimizations(data, fallbackRecommendations)`

Future OpenAI flow:

1. Aggregate normalized habit, task, score, streak, and reflection data for the last 7, 30, or 90 days.
2. Send that summary to an AI endpoint.
3. Ask for:
   - behavior analysis
   - optimization recommendations
   - weekly summaries
   - bottleneck detection
   - load balancing suggestions
4. Merge AI output with deterministic guardrails.
5. Render the result in the Insights and Weekly Review surfaces.

Recommended future AI use cases:

- "Analyze my past 30 days"
- "What is causing low scores?"
- "Which habits correlate with better days?"
- "How should I restructure my day?"
- "Summarize this week"

## Future Roadmap

- Reminder system
- PWA installability
- Authentication and multi-device sync
- Rich charting and month views
- Exported reports
- Voice notes
- Category weighting controls
- Monthly and quarterly reviews
- AI-generated narratives and optimization plans

## Validation

The following commands were run successfully in this workspace:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run lint`
- `npm run build`
