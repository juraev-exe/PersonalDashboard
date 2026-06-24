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

const COLLECTION = 'tasks';

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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: {},
  viewMode: 'list',

  loadTasks: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ tasks: data.map(mapTaskFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading tasks from Supabase:', e);
      }
    }
    const tasks = storage.getAll<Task>(COLLECTION);
    set({ tasks });
  },

  addTask: async (taskData) => {
    const { user, isGuest } = useAuthStore.getState();
    const task: Task = { ...taskData, id: uuid(), createdAt: new Date().toISOString() };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('tasks')
          .insert(mapTaskToDB(task, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving task to Supabase:', e);
        throw e;
      }
    } else {
      storage.create<Task>(COLLECTION, task);
    }
    
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        // Map updates to db format
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

        const { error } = await supabase!
          .from('tasks')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating task in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<Task>(COLLECTION, id, updates);
    }
    
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTask: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('tasks')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting task in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<Task>(COLLECTION, id);
    }
    
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  completeTask: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
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
      try {
        const { error } = await supabase!
          .from('tasks')
          .update({ status: updates.status, completed_at: updates.completedAt })
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error completing task in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<Task>(COLLECTION, id, updates);
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
}));
