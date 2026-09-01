-- ==============================================================
-- LifeOS — Notion Sync Support
-- Generated: 2026-08-31
-- Description: Links tasks and habits back to the Notion page they
--              were imported from, so repeated syncs update rather
--              than duplicate rows.
-- ==============================================================

ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS notion_id TEXT;

ALTER TABLE public.habits
    ADD COLUMN IF NOT EXISTS notion_id TEXT;

-- One row per Notion page per user. Partial, so the many locally-created
-- records with a NULL notion_id are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_user_notion
    ON public.tasks(user_id, notion_id)
    WHERE notion_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_user_notion
    ON public.habits(user_id, notion_id)
    WHERE notion_id IS NOT NULL;

-- Existing RLS policies on these tables already scope access by user_id,
-- so the new column needs no additional policy.
