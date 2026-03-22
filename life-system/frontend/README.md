# Life System Frontend

Next.js 16 App Router frontend for Life System.

## What This App Does

The frontend renders the product surfaces and uses the backend API for all persistence:

- Dashboard (`/`)
- Today workspace (`/today`)
- Habits (`/habits`)
- History (`/history`, `/history/[date]`)
- Weekly review (`/weekly`)
- Insights (`/insights`)
- Login (`/login`)

Server actions call backend endpoints, manage session cookies, and revalidate the affected routes.

## Authentication

The frontend now uses a real login flow backed by backend sessions. Session cookies are stored server-side and protected routes are redirected to `/login` when no valid session exists.

## Setup

From repository root:

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env.local` before starting the app.

Open `http://localhost:3000`.

## Environment Variables

`frontend/.env.local`

```env
BACKEND_URL="http://127.0.0.1:4000"
```

For Railway, point `BACKEND_URL` to the backend's private Railway URL.

## Runtime Dependency

This frontend expects the backend API to be running and seeded.

Recommended backend startup before opening the app:

```bash
cd ../backend
npm run prisma:push
npm run prisma:seed
npm run dev
```

## Railway

This directory includes `railway.toml`.

Recommended Railway service settings:

- service root: `frontend/`
- public networking enabled
- `BACKEND_URL` set to the backend's private Railway URL

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm run test:watch`

## Frontend Notes

- Shared enum-like types live in `types/index.ts`
- Date handling mirrors backend `Africa/Harare` normalization
- Mutation failures surface as typed backend request errors
- Login, logout, and session persistence are handled with server actions and HTTP-only cookies
