-- ==============================================================
-- LifeOS — Supabase Initial Schema Migrations
-- Generated: 2026-06-02
-- Description: Core tables, constraints, indexes, RLS, and seed definitions
-- ==============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Users Profile Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    level INTEGER DEFAULT 1 NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    total_xp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT level_positive CHECK (level > 0),
    CONSTRAINT xp_non_negative CHECK (xp >= 0),
    CONSTRAINT total_xp_non_negative CHECK (total_xp >= 0)
);

-- ==========================================
-- 2. Pomodoro Sessions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL, -- duration in minutes
    category TEXT NOT NULL,
    notes TEXT DEFAULT ''::text NOT NULL,
    completed BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT duration_positive CHECK (duration > 0),
    CONSTRAINT end_after_start CHECK (end_time >= start_time)
);

-- ==========================================
-- 3. Tasks Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT ''::text NOT NULL,
    status TEXT DEFAULT 'todo'::text NOT NULL,
    priority TEXT DEFAULT 'medium'::text NOT NULL,
    category TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    recurring BOOLEAN DEFAULT false NOT NULL,
    recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT check_status CHECK (status IN ('todo', 'in_progress', 'completed')),
    CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT check_recurring_pattern CHECK (recurring_pattern IS NULL OR recurring_pattern IN ('daily', 'weekly', 'monthly'))
);

-- ==========================================
-- 4. Habits Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Activity'::text NOT NULL,
    frequency TEXT DEFAULT 'daily'::text NOT NULL, -- 'daily', 'weekly'
    daily_target INTEGER DEFAULT 1 NOT NULL,
    color TEXT DEFAULT '#6c63ff'::text NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT check_frequency CHECK (frequency IN ('daily', 'weekly')),
    CONSTRAINT daily_target_positive CHECK (daily_target > 0)
);

-- ==========================================
-- 5. Habit Logs Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    value INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT value_non_negative CHECK (value >= 0)
);

-- ==========================================
-- 6. Prayer Logs Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.prayer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    prayer TEXT NOT NULL, -- 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'
    completed BOOLEAN DEFAULT false NOT NULL,
    time TEXT,
    CONSTRAINT check_prayer CHECK (prayer IN ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha')),
    CONSTRAINT prayer_log_unique UNIQUE (user_id, date, prayer)
);

-- ==========================================
-- 7. Projects Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT ''::text NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL, -- 0 to 100
    deadline DATE,
    status TEXT DEFAULT 'planning'::text NOT NULL,
    technologies TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    github_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT check_status CHECK (status IN ('planning', 'active', 'completed', 'archived'))
);

-- ==========================================
-- 8. Notes Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT ''::text NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    pinned BOOLEAN DEFAULT false NOT NULL,
    archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 9. Calendar Events Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TEXT, -- format 'HH:MM'
    end_time TEXT, -- format 'HH:MM'
    type TEXT DEFAULT 'event'::text NOT NULL, -- 'task', 'exam', 'deadline', 'event', 'study_plan'
    color TEXT DEFAULT '#6c63ff'::text NOT NULL,
    CONSTRAINT check_event_type CHECK (type IN ('task', 'exam', 'deadline', 'event', 'study_plan'))
);

-- ==========================================
-- 10. Achievements Definitions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY, -- Slug-style string e.g. 'first_pomo'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    condition TEXT NOT NULL
);

-- ==========================================
-- 11. User Achievements (Unlock Tracker)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT user_achievement_unique UNIQUE (user_id, achievement_id)
);

-- ==========================================
-- 12. User Statistics Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_statistics (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_focus_hours NUMERIC DEFAULT 0.0 NOT NULL,
    total_pomodoros INTEGER DEFAULT 0 NOT NULL,
    total_tasks_completed INTEGER DEFAULT 0 NOT NULL,
    total_habits_completed INTEGER DEFAULT 0 NOT NULL,
    total_prayers_completed INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    most_productive_day TEXT,
    most_productive_category TEXT
);

-- ==============================================================
-- Indexes for High Performance Querying
-- ==============================================================
CREATE INDEX IF NOT EXISTS idx_pomodoro_user ON public.pomodoro_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON public.habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_prayer_logs_user ON public.prayer_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id, pinned, archived);
CREATE INDEX IF NOT EXISTS idx_calendar_user ON public.calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

-- ==============================================================
-- Row Level Security (RLS) policies
-- ==============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Allow users to read their own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to insert their own profile" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Pomodoro Sessions policies
CREATE POLICY "Users can manage their own pomodoro sessions" ON public.pomodoro_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 3. Tasks policies
CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

-- 4. Habits policies
CREATE POLICY "Users can manage their own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

-- 5. Habit Logs policies (linked via habits table)
CREATE POLICY "Users can manage logs of their own habits" ON public.habit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.habits 
            WHERE public.habits.id = public.habit_logs.habit_id 
            AND public.habits.user_id = auth.uid()
        )
    );

-- 6. Prayer Logs policies
CREATE POLICY "Users can manage their own prayer logs" ON public.prayer_logs
    FOR ALL USING (auth.uid() = user_id);

-- 7. Projects policies
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

-- 8. Notes policies
CREATE POLICY "Users can manage their own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

-- 9. Calendar Events policies
CREATE POLICY "Users can manage their own calendar events" ON public.calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- 10. Achievements policies (Read-only for all users)
CREATE POLICY "Anyone can read achievements definition" ON public.achievements
    FOR SELECT TO public USING (true);

-- 11. User Achievements policies
CREATE POLICY "Users can manage their unlocked achievements" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- 12. User Statistics policies
CREATE POLICY "Users can manage their own statistics" ON public.user_statistics
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================
-- Database Seed Data (Pre-defined Achievements)
-- ==============================================================
INSERT INTO public.achievements (id, title, description, icon, xp_reward, condition) VALUES
('first_pomo', 'First Focus Session', 'Completed your first 25-minute focus session.', 'Timer', 100, 'Complete 1 Pomodoro session'),
('seven_day_streak', 'Habit Warrior', 'Maintained a habit streak for 7 consecutive days.', 'Flame', 250, 'Maintain any habit streak of 7 days'),
('thirty_day_streak', 'Relentless Discipline', 'Maintained a habit streak for 30 consecutive days.', 'Trophy', 1000, 'Maintain any habit streak of 30 days'),
('focus_100_hours', 'Deep Work Master', 'Focused for a total of 100 hours using Pomodoro.', 'Clock', 500, 'Accumulate 100 hours of focus'),
('tasks_100_completed', 'Getting Things Done', 'Completed a total of 100 tasks.', 'CheckSquare', 500, 'Complete 100 tasks'),
('perfect_prayers_day', 'Spiritual Alignment', 'Completed all 5 daily prayers in a single day.', 'Moon', 150, 'Mark all 5 prayers done in one day')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    xp_reward = EXCLUDED.xp_reward,
    condition = EXCLUDED.condition;
