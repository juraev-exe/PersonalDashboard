# LifeOS

**A personal life-operating-system dashboard** — tasks, habits, five daily prayers, focus sessions, projects, notes, and finances, all in one offline-first React app.

[![CI](https://github.com/juraev-exe/PersonalDashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/juraev-exe/PersonalDashboard/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-2f7d54?style=flat-square)](https://personal-dashboard-vert-six.vercel.app)
![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-optional-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=flat-square&logo=pwa&logoColor=white)

Most personal-productivity stacks end up as five apps that quietly disagree about what "today" means. LifeOS collapses them into one: a single React app where a finished pomodoro, a completed habit, and a logged prayer all feed the same XP bar — and the whole thing works offline before it ever talks to a server.

## Try it

- **Live app:** [personal-dashboard-vert-six.vercel.app](https://personal-dashboard-vert-six.vercel.app)
- No account needed — click **Continue as Guest**. Guest Mode runs on real local persistence (not a demo stub), so everything you do actually sticks around.
- Installable as a PWA (works offline once cached) and reflows into a mobile bottom-nav layout below tablet width.

## Modules

| | |
|---|---|
| **Productivity** | Dashboard, Pomodoro timer, Tasks, Habits, five-daily-prayer tracker, a distraction-free Focus Mode, and Digital Detox screen-time tracking |
| **Learning** | Journal, Goals, Weekly Review |
| **Projects** | A lightweight tracker with progress bars, tech tags, and GitHub links (this repo is tracked in it) |
| **Personal** | Calendar with Google Calendar sync, Notes, Finance |
| **Insights** | Recharts-driven Analytics, plus Settings for theme, sidebar behavior, and integrations |

A shared **gamification layer** — XP, levels, and achievements — sits underneath all of it, so progress in any module counts toward the same reward loop.

Tasks and Habits also sync two-way with Notion: property mapping is type-based rather than assuming a fixed database schema, so it adapts to however you've named your columns instead of requiring a specific template.

## Why it's built this way

The whole app is designed to be useful with **zero configuration**. Every store reads and writes through a services layer (`storage.ts` / `supabase.ts`) that decides, once, whether to persist to `localStorage` or to Supabase Postgres — so the exact same UI code runs in Guest Mode or against a real backend. Turning on Supabase later is a config flag, not a rewrite.

```
Pages (React Router)
   ↓
Zustand stores (state)
   ↓
Services layer  ──►  localStorage (always available)
                 ──►  Supabase Postgres + RLS (optional)
```

## Getting started

```bash
git clone https://github.com/juraev-exe/PersonalDashboard.git
cd PersonalDashboard/lifeos
npm install
npm run dev
```

Open `http://localhost:5173` and click **Continue as Guest** — that's it, no setup required.

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run build        # tsc && vite build
```

CI runs typecheck, test, and build on every push to `main` and every pull request (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

### Optional: connect Supabase

Copy `lifeos/.env.example` to `lifeos/.env` and fill in your project's keys to persist data to a real Postgres backend instead of Guest Mode:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The schema lives in [`supabase/migrations`](supabase/migrations) — see [`supabase/README.md`](supabase/README.md) for setup options.

### Run with Docker instead

```bash
docker compose up
```

Serves the dev server on `http://localhost:5173` (see [`Dockerfile`](lifeos/Dockerfile) / [`docker-compose.yml`](docker-compose.yml)). On Windows, `start-dashboard-docker.bat` / `stop-dashboard-docker.bat` wrap the same commands.

## Tech stack

- **Frontend** — React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · TanStack Query · React Router 7 · Framer Motion · Recharts
- **Backend** — Supabase (Postgres · Auth · Row-Level Security)
- **Integrations** — Google Calendar & Sheets OAuth · Notion API (two-way sync) · Spotify
- **Testing** — Vitest · Testing Library · GitHub Actions CI
- **Deploy** — Vercel (serverless) or Docker + nginx

## Project structure

```
lifeos/
├─ src/
│  ├─ pages/       13 route components — one per module screen
│  ├─ stores/      Zustand stores, one per domain (tasks, habits, prayers, …)
│  ├─ services/    storage.ts / supabase.ts / dbMapper.ts / google & notion clients
│  ├─ components/  layout (Sidebar, BottomNav, TopNav, Interactive3DOrb, …) and icons
│  ├─ hooks/       useInitData, usePomodoro, useKeyboardShortcuts, useEventReminders
│  └─ data/        seed content and achievement definitions
└─ api/notion.ts   Vercel serverless proxy for the Notion API

supabase/
└─ migrations/     Postgres schema (tables, RLS policies, constraints)
```

---

Built solo, end to end — schema, state, UI, and both deploy paths.
