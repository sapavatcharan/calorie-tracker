# Plate — Personal Calorie Tracker

A full-stack app for logging meals, tracking daily nutrition goals, and reviewing progress over time.

Plate lets you record food by meal type (breakfast, lunch, dinner, snacks), set calorie and macro targets, and see how intake compares to those targets. Photos of plates or nutrition labels can be sent through Gemini for a suggested nutrition breakdown that you can edit before saving. The API and the Next.js client are separate services; all data is persisted in PostgreSQL.

## Live demo

- App: [https://calorie-tracker-seven-sigma.vercel.app](https://calorie-tracker-seven-sigma.vercel.app)
- Demo login: `demo@plate.app` / `DemoPass123!`

The frontend is hosted on Vercel. The API runs on Render’s free tier and may take about 30 seconds to wake on the first request after idle.

## Features

**Core**
- Goal setting: daily calories, protein/carbs/fat, and optional weight target
- Meal logging grouped by type, with name, quantity, calories, macros, and optional micronutrients
- Time-range listing, filterable by date and meal type
- Reports: weekly calorie trend, macros by day or week, micronutrient summary, goal vs actual
- AI photo extraction (nutrition label or plated food)

**Bonus**
- Conversational chat that calls the same services as the REST API (log meals, query intake, etc.)
- Multi-user JWT auth; records are scoped to the signed-in user
- PDF bulk import (preview, then confirm)

Every list endpoint is paginated (`page`, `limit` bounded to 1–100) and returns `{ data, pagination }`.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query, Recharts
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, JWT
- **Integrations:** Google Gemini (vision + chat function calling), Cloudinary (optional image hosting)
- **Tests:** Vitest + Supertest

## Architecture

Backend features live under `backend/src/modules/<name>/` with routes, Zod schemas, a thin controller, and a service. Request flow is route → validate → controller → service → Prisma. Controllers do not catch errors or talk to the database; a single error handler formats Zod, `AppError`, and Prisma failures. List queries share one pagination helper. Gemini calls walk a configured model list and skip 429/404 responses so free-tier quota exhaustion on one model does not take the whole feature down.

## Local setup

**Prerequisites:** Node.js 20+, Docker (for Postgres), npm.

```bash
git clone https://github.com/sapavatcharan/calorie-tracker.git
cd calorie-tracker
```

**Backend env** (`cp backend/.env.example backend/.env`):

| Variable | Notes |
|---|---|
| `NODE_ENV` | `development` / `production` / `test` |
| `PORT` | Default `5050` |
| `DATABASE_URL` | Postgres URL (local Docker uses port **5433**) |
| `JWT_SECRET` | At least 16 characters; no fallback in code |
| `JWT_EXPIRES_IN` | Default `7d` |
| `GEMINI_API_KEY` | Required |
| `GEMINI_API_VERSION` | Default `v1beta` |
| `GEMINI_CHAT_MODELS` | Comma-separated fallback chain |
| `GEMINI_VISION_MODELS` | Comma-separated fallback chain |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Optional |
| `FRONTEND_URL` | CORS origin, e.g. `http://localhost:3000` |

**Frontend env** (`cp frontend/.env.example frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:5050
```

```bash
docker compose up -d
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

- API: http://localhost:5050
- App: http://localhost:3000
- Seeded login: `demo@plate.app` / `DemoPass123!` (override with `SEED_EMAIL` / `SEED_PASSWORD`)

```bash
cd backend && npm test
```

## API reference

All routes except register, login, and `/health` require `Authorization: Bearer <token>`. List routes accept `page` and `limit`.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Process liveness |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/goals` | Create goal (deactivates the previous active one) |
| GET | `/api/goals` | List goals (paginated) |
| GET | `/api/goals/current` | Active goal |
| PATCH | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| POST | `/api/meals` | Log a meal |
| GET | `/api/meals` | List meals; `startDate`, `endDate`, `mealType` |
| GET | `/api/meals/:id` | Meal by id |
| PATCH | `/api/meals/:id` | Update meal |
| DELETE | `/api/meals/:id` | Delete meal |
| POST | `/api/weight` | Log a weigh-in |
| GET | `/api/weight` | List weigh-ins (paginated) |
| DELETE | `/api/weight/:id` | Delete weigh-in |
| GET | `/api/reports/weekly-trend` | Daily calories in a window |
| GET | `/api/reports/macros` | Macros grouped by `day` or `week` |
| GET | `/api/reports/micronutrients` | Micronutrient totals |
| GET | `/api/reports/goal-comparison` | Goal vs actual for the window |
| POST | `/api/upload/image` | Upload image; extract nutrition |
| POST | `/api/ai/extract-nutrition` | Extract from uploaded file or `imageUrl` |
| POST | `/api/chat/message` | Chat (function-calling tools) |
| GET | `/api/chat/history` | Chat history (paginated) |
| DELETE | `/api/chat/history` | Clear history |
| DELETE | `/api/chat/history/:id` | Delete one message |
| POST | `/api/import/pdf` | Parse PDF → meal preview |
| POST | `/api/import/pdf/confirm` | Persist previewed meals |

## Assumptions and design decisions

- **Micronutrients as JSON.** Keys vary by food (vitamin D, iron, etc.), so a rigid column set would be a poor fit. The API accepts a string-to-number map and stores it as JSON.
- **`MealType` enum.** Breakfast, lunch, dinner, and snacks are constrained in Postgres, not as free-form strings.
- **One active goal.** Creating a new goal deactivates the previous one. History remains queryable.
- **JWT in localStorage.** Simple for a SPA on a separate origin. Tokens are readable by any script on the page; this is a known tradeoff versus httpOnly cookies.
- **AI extraction is best-effort.** Model output is validated with Zod, then shown for the user to edit before it becomes a meal. Wrong estimates are expected; the source of truth is the saved entry.
- **Gemini fallback.** Chat and vision try models in `GEMINI_CHAT_MODELS` / `GEMINI_VISION_MODELS`. Invalid or rate-limited models are skipped. If the whole chain fails, the API returns 429 with a retry message.
- **Calories on a meal** are the entry total, not quantity × per-unit.

## Testing

The backend suite is 45 Vitest tests across 13 files: auth, meals, goals, weight, reports, pagination, date-range parsing, PDF import, Gemini output validation, chat tool-calling (mocked), and quota/fallback behavior. Controllers are exercised through Supertest against the Express app (no `listen` in tests).

## License

MIT
