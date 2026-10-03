// ============================================
// LifeOS — Tasks Store
// ============================================

import { create } from 'zustand';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapTaskFromDB, mapTaskToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';
import { useGamificationStore } from './gamificationStore';
import { useSettingsStore } from './settingsStore';
import { fetchNotionTasks, pushTaskToNotion, pushTaskStatusToNotion } from '../services/notionSync';
import { fetchMicrosoftTasks, syncTaskStatusToMicrosoft } from '../services/microsoftTodoSync';

const COLLECTION = 'tasks';
let isSyncingNotion = false;
let isSyncingMicrosoft = false;

interface TaskState {
  tasks: Task[];
  filter: { status?: TaskStatus; category?: string; priority?: string };
  viewMode: 'list' | 'kanban' | 'calendar';
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  setFilter: (filter: Partial<TaskState['filter']>) => void;
  setViewMode: (mode: 'list' | 'kanban' | 'calendar') => void;
  /** Pull & Push tasks to Notion database with safe two-way merge. */
  syncFromNotion: () => Promise<{ imported: number; updated: number; exported: number }>;
  /** Pull the configured Microsoft To Do list in, upserting by Microsoft task id. */
  syncFromMicrosoftTodo: () => Promise<{ imported: number; updated: number }>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: {},
  viewMode: 'list',

  loadTasks: async () => {
    const { user, isGuest } = useAuthStore.getState();
    // Partition local cache by user to prevent cross-account data leakage (Issue 3)
    const localKey = user && !isGuest ? `${COLLECTION}_${user.id}` : COLLECTION;
    const localTasks = storage.getAll<Task>(localKey);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data) {
          const remoteTasks = data.map(mapTaskFromDB);
          // Cloud is the source of truth — no local-to-cloud backup on load.
          // Local-only tasks are already saved locally; they are NOT pushed to
          // cloud automatically to avoid resurrecting deleted items (Issue 5)
          // and to avoid cross-account uploads (Issue 3).
          storage.setAll(localKey, remoteTasks);
          set({ tasks: remoteTasks });
          return;
        }
      } catch (e) {
        console.error('Error loading tasks from Supabase, keeping local copy:', e);
      }
    }

    set({ tasks: localTasks });
  },

  addTask: async (taskData) => {
    const { user, isGuest } = useAuthStore.getState();
    const task: Task = { ...taskData, id: uuid(), createdAt: new Date().toISOString() };
    const localKey = user && !isGuest ? `${COLLECTION}_${user.id}` : COLLECTION;

    // 1. Always save locally first (failsafe offline-first guarantee)
    storage.create<Task>(localKey, task);

    // 2. Persist to cloud if online and logged in — check for errors (Issue 6)
    if (isSupabaseConfigured && !isGuest && user) {
      const { error } = await supabase!.from('tasks').insert(mapTaskToDB(task, user.id));
      if (error) {
        console.error('Error saving task to Supabase (saved locally):', error.message);
        // Revert local save — the task only exists locally and the caller should know
        storage.remove<Task>(localKey, task.id);
        throw new Error(`Cloud save failed: ${error.message}`);
      }
    }

    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    const localKey = user && !isGuest ? `${COLLECTION}_${user.id}` : COLLECTION;
    
    // Issue 7: attempt cloud update FIRST, then apply locally only on success
    if (isSupabaseConfigured && !isGuest && user) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
      if (updates.recurringPattern !== undefined) dbUpdates.recurring_pattern = updates.recurringPattern || null;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt || null;
      if (updates.notionId !== undefined) dbUpdates.notion_id = updates.notionId || null;
      if (updates.todoId !== undefined) dbUpdates.todo_id = updates.todoId || null;
      if (updates.todoListId !== undefined) dbUpdates.todo_list_id = updates.todoListId || null;

      const { error } = await supabase!
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id);
      if (error) {
        console.error('Error updating task in Supabase:', error.message);
        throw new Error(`Cloud update failed: ${error.message}`);
      }
    }

    // Cloud succeeded (or offline) — now apply locally
    storage.update<Task>(localKey, id, updates);

    const targetTask = get().tasks.find((t) => t.id === id);
    if (updates.status !== undefined && targetTask?.notionId) {
      pushTaskStatusToNotion(targetTask.notionId, updates.status).catch((e) =>
        console.error('Failed to sync status update to Notion:', e)
      );
    }

    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTask: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    const localKey = user && !isGuest ? `${COLLECTION}_${user.id}` : COLLECTION;
    
    // Issue 7: attempt cloud delete FIRST
    if (isSupabaseConfigured && !isGuest && user) {
      const { error } = await supabase!
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting task in Supabase:', error.message);
        throw new Error(`Cloud delete failed: ${error.message}`);
      }
    }

    // Cloud succeeded — now remove locally
    storage.remove<Task>(localKey, id);
    
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  completeTask: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    const localKey = user && !isGuest ? `${COLLECTION}_${user.id}` : COLLECTION;
    const updates = { status: TaskStatus.COMPLETED, completedAt: new Date().toISOString() };
    
    // Auto-reschedule recurring task
    const targetTask = get().tasks.find((t) => t.id === id);
    if (targetTask?.recurring && targetTask.recurringPattern) {
      const currentDate = targetTask.dueDate ? new Date(targetTask.dueDate) : new Date();
      const nextDate = new Date(currentDate);
      if (targetTask.recurringPattern === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (targetTask.recurringPattern === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (targetTask.recurringPattern === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      setTimeout(() => {
        get().addTask({
          title: targetTask.title,
          description: targetTask.description,
          status: TaskStatus.TODO,
          priority: targetTask.priority,
          category: targetTask.category,
          dueDate: nextDateStr,
          recurring: true,
          recurringPattern: targetTask.recurringPattern
        });
      }, 300);
    }

    if (isSupabaseConfigured && !isGuest && user) {
      const { error } = await supabase!
        .from('tasks')
        .update({ status: updates.status, completed_at: updates.completedAt })
        .eq('id', id);
      if (error) {
        console.error('Error completing task in Supabase:', error.message);
        throw new Error(`Cloud complete failed: ${error.message}`);
      }
    }

    storage.update<Task>(localKey, id, updates);

    if (targetTask?.todoId && targetTask?.todoListId) {
      syncTaskStatusToMicrosoft(targetTask.todoListId, targetTask.todoId, TaskStatus.COMPLETED).catch((e) =>
        console.error('Failed to sync completion to Microsoft To Do:', e)
      );
    }

    if (targetTask?.notionId) {
      pushTaskStatusToNotion(targetTask.notionId, TaskStatus.COMPLETED).catch((e) =>
        console.error('Failed to sync completion to Notion:', e)
      );
    }
    
    set((s) => {
      const nextTasks = s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      
      // Award XP & Check achievements
      setTimeout(() => {
        try {
          const gamification = (useGamificationStore as any).getState();
          if (gamification) {
            gamification.addXP(10);
            
            // Gather stats
            const sessions = storage.getAll<any>('pomodoro_sessions');
            const habits = storage.getAll<any>('habits');
            const habitLogs = storage.getAll<any>('habit_logs');
            const prayerLogs = storage.getAll<any>('prayer_logs');
            const todayStr = new Date().toISOString().split('T')[0];

            const completedTasksCount = nextTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            const focusHours = sessions.reduce((sum: number, s: any) => sum + s.duration, 0) / 60;
            
            const activeHabits = habits.filter((h: any) => !h.archived);
            const dailyHabits = activeHabits.filter((h: any) => 
              habitLogs.some((l: any) => l.habitId === h.id && l.date === todayStr && l.completed)
            ).length;
            const dailyPrayers = prayerLogs.filter((l: any) => l.date === todayStr && l.completed).length;

            gamification.checkAchievements({
              pomodoros: sessions.length,
              tasks: completedTasksCount,
              streak: 1, // fallback
              focusHours,
              dailyPrayers,
              dailyHabits,
              totalHabits: activeHabits.length
            });
          }
        } catch (err) {
          console.error('Gamification error in task completion:', err);
        }
      }, 0);

      return { tasks: nextTasks };
    });
  },

  setFilter: (filter) => set((s) => ({ filter: { ...s.filter, ...filter } })),
  setViewMode: (viewMode) => set({ viewMode }),

  syncFromNotion: async () => {
    if (isSyncingNotion) {
      console.warn('Notion sync is already in progress, skipping concurrent run');
      return { imported: 0, updated: 0, exported: 0 };
    }
    isSyncingNotion = true;

    try {
      const { notionApiKey, notionTasksDatabaseId } = useSettingsStore.getState();
      if (!notionApiKey) throw new Error('Add your Notion API key in Settings first');
      if (!notionTasksDatabaseId) throw new Error('Add your Notion tasks database ID in Settings first');

      const drafts = await fetchNotionTasks(notionTasksDatabaseId);
      let imported = 0;
      let updated = 0;
      let exported = 0;

      // 1. Pull & update from Notion (Match strictly by notionId to avoid clobbering duplicate-titled local tasks - Issue 12)
      for (const draft of drafts) {
        const existing = get().tasks.find((t) => t.notionId === draft.notionId);
        if (existing) {
          // Notion is the source of truth for synced rows; keep local-only fields.
          await get().updateTask(existing.id, {
            title: draft.title,
            description: draft.description,
            status: draft.status,
            priority: draft.priority,
            category: draft.category,
            dueDate: draft.dueDate,
            notionId: draft.notionId,
          });
          updated++;
        } else {
          await get().addTask(draft);
          imported++;
        }
      }

      // 2. Bidirectional push: local tasks not yet in Notion get pushed to Notion!
      const currentTasks = get().tasks;
      for (const localTask of currentTasks) {
        if (!localTask.notionId) {
          try {
            const newNotionId = await pushTaskToNotion(notionTasksDatabaseId, localTask);
            if (newNotionId) {
              await get().updateTask(localTask.id, { notionId: newNotionId });
              exported++;
            }
          } catch (err) {
            console.warn(`Could not export task "${localTask.title}" to Notion:`, err);
          }
        }
      }

      return { imported, updated, exported };
    } finally {
      isSyncingNotion = false;
    }
  },

  syncFromMicrosoftTodo: async () => {
    if (isSyncingMicrosoft) {
      console.warn('Microsoft To Do sync is already in progress, skipping concurrent run');
      return { imported: 0, updated: 0 };
    }
    isSyncingMicrosoft = true;

    try {
      const { microsoftAccessToken, microsoftTodoListId } = useSettingsStore.getState();
      if (!microsoftAccessToken) throw new Error('Add your Microsoft Access Token in Settings first');

      const { tasks: drafts } = await fetchMicrosoftTasks(microsoftTodoListId);
      let imported = 0;
      let updated = 0;

      for (const draft of drafts) {
        const existing = get().tasks.find((t) => t.todoId === draft.todoId);
        if (existing) {
          await get().updateTask(existing.id, {
            title: draft.title,
            description: draft.description,
            status: draft.status,
            priority: draft.priority,
            category: draft.category,
            dueDate: draft.dueDate,
          });
          updated++;
        } else {
          await get().addTask(draft);
          imported++;
        }
      }

      return { imported, updated };
    } finally {
      isSyncingMicrosoft = false;
    }
  },
}));
