# Supabase Database & Migrations Setup

This guide provides instructions on how to set up the Supabase database schemas and migrations for your LifeOS Productivity Dashboard.

## Prerequisites
- A [Supabase](https://supabase.com) account.
- A new or existing Supabase project.

---

## Setup Options

### Option 1: Copy-Paste via SQL Editor (Easiest)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. Click on the **SQL Editor** tab in the sidebar.
4. Click **New query** (or **New Blank Query**).
5. Copy the entire contents of the migration file:
   [20260602000000_init_schema.sql](file:///c:/Users/JJ/Documents/Projects_2026/PersonalDashboard/supabase/migrations/20260602000000_init_schema.sql)
6. Paste the SQL into the editor.
7. Click **Run**. All tables, indexes, RLS policies, and seed achievements will be created!

---

### Option 2: Setup via Supabase CLI (Recommended for Development)
If you prefer managing migrations locally:

1. Initialize the Supabase CLI inside your workspace root if you haven't:
   ```bash
   supabase init
   ```
2. Link your local project to your cloud Supabase project:
   ```bash
   supabase link --project-ref your-supabase-project-ref
   ```
3. Push your migrations to the cloud database:
   ```bash
   supabase db push
   ```
   Or apply migrations locally if using local Supabase Docker container:
   ```bash
   supabase start
   ```

---

## Row Level Security (RLS) & Policies
All tables have Row Level Security enabled to protect user data:
- Tables like `tasks`, `pomodoro_sessions`, `habits`, `prayer_logs`, `projects`, `notes`, `calendar_events`, and `user_statistics` enforce a check of `auth.uid() = user_id`. Users can only select, insert, update, or delete their own data.
- The `achievements` table contains static metadata that is readable by all users but cannot be modified by regular users.
- The `habit_logs` table allows managing logs if the parent habit belongs to the currently authenticated user.

---

## Environment Variables (.env)
To connect the frontend React application with Supabase, create/update your `.env` or `.env.local` file inside the `lifeos` directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
