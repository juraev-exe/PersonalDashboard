# LifeOS Project Overview

LifeOS is a comprehensive personal dashboard application designed to aggregate tasks, habits, projects, notes, and productivity metrics into a single, unified interface. It features a modern, gamified experience with XP tracking, achievements, and real-time data synchronization.

## 🚀 Tech Stack

- **Frontend:** React 19, Vite 8, TypeScript 6
- **State Management:** Zustand 5 (Domain-specific stores)
- **Styling:** Tailwind CSS 4, Framer Motion (Animations), Lucide React (Icons)
- **Data Visualization:** Recharts
- **Backend/Database:** Supabase (PostgreSQL, Auth, RLS)
- **Integrations:** Notion API, Google Calendar API
- **Utilities:** date-fns, uuid, TanStack Query

---

## 📁 Directory Structure

```text
PersonalDashboard/
├── lifeos/                 # Frontend Application
│   ├── src/
│   │   ├── assets/         # Static assets (images, SVGs)
│   │   ├── components/     # UI Components
│   │   │   └── layout/     # MainLayout, Sidebar, TopNav
│   │   ├── data/           # Seed data and constants
│   │   ├── hooks/          # Custom React hooks (useInitData, usePomodoro, etc.)
│   │   ├── pages/          # Page components (Dashboard, Tasks, Habits, etc.)
│   │   ├── services/       # API and external service integrations
│   │   ├── stores/         # Zustand stores for state management
│   │   ├── types/          # TypeScript interfaces and enums
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Dependencies and scripts
│   └── vite.config.ts      # Vite configuration
└── supabase/               # Backend Configuration
    └── migrations/         # SQL migration files for database schema
```

---

## 🏗️ Core Architecture

### 1. State Management (Zustand)
The application uses multiple domain-specific stores to manage state and persistence:
- `authStore`: Handles user authentication (Supabase + Guest Mode).
- `taskStore`, `habitStore`, `projectStore`, etc.: Manage specific data entities.
- **Persistence Strategy:** Stores implement a hybrid approach, persisting data to Supabase if authenticated, or falling back to `LocalStorage` for guest/offline usage.

### 2. Services Layer
Encapsulates communication with external APIs:
- `supabase.ts`: Client configuration for Supabase.
- `notionService.ts`: Integration with Notion for notes and projects.
- `googleCalendarService.ts`: Integration with Google Calendar for events.
- `dbMapper.ts`: Maps database records to frontend TypeScript interfaces.

### 3. Gamification System
A central `gamificationStore` tracks user progress:
- **XP & Levels:** Users earn XP by completing tasks, habits, and focus sessions.
- **Achievements:** Pre-defined milestones (e.g., "First Focus Session") are tracked and unlocked.
- **Statistics:** Aggregates user activity into productivity scores and streaks.

---

## 📊 Data Models

### Key Entities (Frontend Types)
| Entity | Description |
| :--- | :--- |
| `User` | Profile info, level, XP, and auth details. |
| `Task` | To-do items with priority, category, and recurring patterns. |
| `Habit` | Daily/weekly habits with tracking logs and streaks. |
| `PomodoroSession` | Focus sessions with category and duration. |
| `Project` | High-level goals with progress tracking and deadlines. |
| `Note` | Tagged content, supports pinning and archiving. |
| `JournalEntry` | Daily reflections with mood tracking and tags. |

### Database Schema (Supabase)
The database is structured in PostgreSQL with Row Level Security (RLS) enabled for all tables, ensuring users can only access their own data. Tables include:
- `users`, `tasks`, `habits`, `habit_logs`, `pomodoro_sessions`, `projects`, `notes`, `calendar_events`, `journal_entries`, `goals`, `achievements`, `user_achievements`, `user_statistics`.

---

## 🖥️ Key Pages

- **Dashboard:** Unified view of today's tasks, habits, and focus metrics.
- **Focus:** Pomodoro timer with category selection and session history.
- **Tasks:** Kanban-style or list view for task management.
- **Habits:** Habit tracking grid with completion logs and streaks.
- **Analytics:** Data visualization of productivity trends and focus hours.
- **Projects:** Tracking of long-term projects and milestones.
- **Journal & Notes:** Writing space for daily entries and structured notes.

---

## 🛠️ Setup & Development

1.  **Install Dependencies:** `cd lifeos && npm install`
2.  **Run Dev Server:** `npm run dev`
3.  **Supabase Setup:** Ensure `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Apply migrations in `supabase/migrations/` to your Supabase project.
