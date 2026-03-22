# Life System Frontend

Next.js 16 App Router frontend for Life System.

## What This App Does

The frontend renders the product surfaces and delegates persistence to the backend API:

- Dashboard (`/`)
- Today workspace (`/today`)
- Habits management (`/habits`)
- History list and detail (`/history`, `/history/[date]`)
- Weekly review (`/weekly`)
- Insights (`/insights`)

Server actions are thin wrappers around backend endpoints and then revalidate the affected routes.

## Runtime Dependency

This app expects the backend API to be running.

Default backend URL:

- `http://127.0.0.1:4000`

Configured via `BACKEND_URL` in `.env.local`.

## Setup

From repository root:

```bash
cd frontend
npm install
npm run dev
```

Before starting the app, copy `.env.example` to `.env.local`.

Open `http://localhost:3000`.

## Environment Variables

`frontend/.env.local`

```env
BACKEND_URL="http://127.0.0.1:4000"
BACKEND_API_TOKEN="dev-local-token"
BACKEND_USER_ID="local-zw-user"
```

Notes:

- Frontend sends authenticated requests to the backend using `BACKEND_API_TOKEN` and `BACKEND_USER_ID`.
- Backend must use matching auth values in `backend/.env`.
- The frontend no longer owns Prisma schema, migrations, or seeding.

## Scripts

- `npm run dev` start Next dev server
- `npm run build` production build
- `npm run start` run production server
- `npm run lint` lint source
- `npm run test` run tests once
- `npm run test:watch` run tests in watch mode

## Frontend Data Notes

- Shared enum-like types such as `TaskType`, `InsightSeverity`, and `InsightCategory` are defined in `types/index.ts`.
- Date handling mirrors backend `Africa/Harare` normalization rules.
- Mutation failures are surfaced through typed backend request errors in the UI.

## Troubleshooting

- If pages load but actions fail, verify the backend is running on `BACKEND_URL`.
- If backend requests return auth errors, verify `BACKEND_API_TOKEN` and `BACKEND_USER_ID` match backend env values.
- If the backend schema changes, rerun backend setup commands in `backend/` rather than trying to manage DB state from the frontend.
