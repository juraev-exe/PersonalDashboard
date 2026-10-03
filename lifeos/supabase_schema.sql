-- ==============================================================
-- LifeOS — Complete Supabase Database Schema
-- Paste this script into your Supabase project's SQL Editor and click RUN.
-- ==============================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. Users Profile Table
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
-- 3. Tasks Table (With Notion & Microsoft Sync)
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
    notion_id TEXT,
    CONSTRAINT check_status CHECK (status IN ('todo', 'in_progress', 'completed')),
    CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT check_recurring_pattern CHECK (recurring_pattern IS NULL OR recurring_pattern IN ('daily', 'weekly', 'monthly'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_user_notion
    ON public.tasks(user_id, notion_id)
    WHERE notion_id IS NOT NULL;

-- ==========================================
-- 4. Habits Table (With Notion Sync)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Activity'::text NOT NULL,
    frequency TEXT DEFAULT 'daily'::text NOT NULL, -- 'daily', 'weekly'
    daily_target INTEGER DEFAULT 1 NOT NULL,
    color TEXT DEFAULT '#5c67f5'::text NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived BOOLEAN DEFAULT false NOT NULL,
    notion_id TEXT,
    CONSTRAINT check_frequency CHECK (frequency IN ('daily', 'weekly')),
    CONSTRAINT daily_target_positive CHECK (daily_target > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_user_notion
    ON public.habits(user_id, notion_id)
    WHERE notion_id IS NOT NULL;

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
-- 6. Pomodoro Sessions Table
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
-- 7. Prayer Logs Table
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
-- 8. Projects Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT ''::text NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
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
-- 9. Notes Table
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
-- 10. Calendar Events Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    type TEXT DEFAULT 'event'::text NOT NULL,
    color TEXT DEFAULT '#5c67f5'::text NOT NULL,
    CONSTRAINT check_event_type CHECK (type IN ('task', 'exam', 'deadline', 'event', 'study_plan'))
);

-- ==========================================
-- 11. Journal Entries Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT DEFAULT ''::text NOT NULL,
    mood TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT journal_entry_user_date_unique UNIQUE (user_id, date)
);

-- ==========================================
-- 12. Goals Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT ''::text NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0 NOT NULL,
    unit TEXT NOT NULL,
    deadline DATE,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active'::text NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_status CHECK (status IN ('active', 'completed', 'archived')),
    CONSTRAINT target_value_positive CHECK (target_value > 0)
);

-- ==========================================
-- 13. Achievements Definitions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    condition TEXT NOT NULL
);

-- ==========================================
-- 14. User Achievements Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT user_achievement_unique UNIQUE (user_id, achievement_id)
);

-- ==========================================
-- 15. User Statistics Table
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
-- 16. Row Level Security (RLS) Policies
-- ==============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own habit logs" ON public.habit_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.habits WHERE public.habits.id = public.habit_logs.habit_id AND public.habits.user_id = auth.uid())
);
CREATE POLICY "Users manage own pomodoro sessions" ON public.pomodoro_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own prayer logs" ON public.prayer_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own calendar events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own journal entries" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT TO public USING (true);
CREATE POLICY "Users manage own unlocked achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own statistics" ON public.user_statistics FOR ALL USING (auth.uid() = user_id);

-- ==============================================================
-- 17. Seed Achievements
-- ==============================================================
INSERT INTO public.achievements (id, title, description, icon, xp_reward, condition) VALUES
('first_pomodoro', 'First Focus', 'Complete your first Pomodoro session', '🎯', 50, 'pomodoros >= 1'),
('ten_pomodoros', 'Getting Focused', 'Complete 10 Pomodoro sessions', '🔥', 100, 'pomodoros >= 10'),
('fifty_pomodoros', 'Focus Master', 'Complete 50 Pomodoro sessions', '⚡', 250, 'pomodoros >= 50'),
('hundred_pomodoros', 'Unstoppable', 'Complete 100 Pomodoro sessions', '💎', 500, 'pomodoros >= 100'),
('first_task', 'Task Starter', 'Complete your first task', '✅', 25, 'tasks >= 1'),
('ten_tasks', 'Productive', 'Complete 10 tasks', '📋', 100, 'tasks >= 10'),
('fifty_tasks', 'Task Machine', 'Complete 50 tasks', '🏆', 250, 'tasks >= 50'),
('hundred_tasks', 'Centurion', 'Complete 100 tasks', '👑', 500, 'tasks >= 100'),
('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 150, 'streak >= 7'),
('streak_30', 'Monthly Champion', 'Maintain a 30-day streak', '🏅', 500, 'streak >= 30'),
('streak_100', 'Legend', 'Maintain a 100-day streak', '🌟', 1000, 'streak >= 100'),
('hundred_hours', 'Century Club', 'Accumulate 100 hours of focus time', '⏰', 500, 'focusHours >= 100'),
('all_prayers_day', 'Devoted', 'Complete all 5 prayers in a day', '🕌', 75, 'dailyPrayers >= 5'),
('all_habits_day', 'Disciplined', 'Complete all habits in a day', '💪', 75, 'dailyHabits >= all')
ON CONFLICT (id) DO NOTHING;
