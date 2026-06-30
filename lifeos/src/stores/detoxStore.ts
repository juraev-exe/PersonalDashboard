// ============================================
// LifeOS — Detox and Screen-time Store
// ============================================

import { create } from 'zustand';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { useGamificationStore } from './gamificationStore';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

const BAD_HABITS_COLL = 'bad_habits';
const BAD_HABITS_LOGS_COLL = 'bad_habit_logs';
const SCREENTIME_LOGS_COLL = 'screentime_logs';

export interface BadHabit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface BadHabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  occurred: boolean;
}

export interface ScreentimeLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  category: string; // e.g. "Social Media", "Gaming", "Doom Scrolling", "Work"
}

interface DetoxState {
  badHabits: BadHabit[];
  badHabitLogs: BadHabitLog[];
  screentimeLogs: ScreentimeLog[];
  loadDetoxData: () => Promise<void>;
  addBadHabit: (name: string, color: string) => Promise<void>;
  deleteBadHabit: (id: string) => Promise<void>;
  toggleBadHabit: (habitId: string, date: string, occurred: boolean) => Promise<void>;
  addScreentimeLog: (hours: number, category: string, date: string) => Promise<void>;
  deleteScreentimeLog: (id: string) => Promise<void>;
  getCleanStreak: (habitId: string) => number;
}

export const useDetoxStore = create<DetoxState>((set, get) => ({
  badHabits: [],
  badHabitLogs: [],
  screentimeLogs: [],

  loadDetoxData: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const habitsRes = await supabase!.from('bad_habits').select('*').eq('user_id', user.id);
        const logsRes = await supabase!.from('bad_habit_logs').select('*').eq('user_id', user.id);
        const screenRes = await supabase!.from('screentime_logs').select('*').eq('user_id', user.id);
        
        set({
          badHabits: habitsRes.data?.map((d: any) => ({
            id: d.id,
            name: d.name,
            color: d.color,
            createdAt: d.created_at,
          })) || [],
          badHabitLogs: logsRes.data?.map((d: any) => ({
            id: d.id,
            habitId: d.habit_id,
            date: d.date,
            occurred: d.occurred,
          })) || [],
          screentimeLogs: screenRes.data?.map((d: any) => ({
            id: d.id,
            date: d.date,
            hours: Number(d.hours),
            category: d.category,
          })) || [],
        });
        return;
      } catch (e) {
        console.error('Error loading detox data from Supabase:', e);
      }
    }

    // Default Seed Bad Habits if empty in local storage
    let seededBadHabits = storage.getAll<BadHabit>(BAD_HABITS_COLL);
    if (seededBadHabits.length === 0) {
      const defaults = [
        { id: uuid(), name: 'Doom Scrolling', color: '#f85149', createdAt: new Date().toISOString() },
        { id: uuid(), name: 'Eating Junk Food', color: '#ff7b72', createdAt: new Date().toISOString() },
        { id: uuid(), name: 'Late Night Screen Time', color: '#d29922', createdAt: new Date().toISOString() },
      ];
      defaults.forEach(d => storage.create(BAD_HABITS_COLL, d));
      seededBadHabits = defaults;
    }

    set({
      badHabits: seededBadHabits,
      badHabitLogs: storage.getAll<BadHabitLog>(BAD_HABITS_LOGS_COLL),
      screentimeLogs: storage.getAll<ScreentimeLog>(SCREENTIME_LOGS_COLL),
    });
  },

  addBadHabit: async (name, color) => {
    const { user, isGuest } = useAuthStore.getState();
    const bh: BadHabit = { id: uuid(), name, color, createdAt: new Date().toISOString() };

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!.from('bad_habits').insert({
          id: bh.id,
          user_id: user.id,
          name: bh.name,
          color: bh.color,
          created_at: bh.createdAt,
        });
        if (error) throw error;
      } catch (e) {
        console.error('Error saving bad habit to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(BAD_HABITS_COLL, bh);
    }
    set((s) => ({ badHabits: [...s.badHabits, bh] }));
  },

  deleteBadHabit: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!.from('bad_habits').delete().eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting bad habit in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<BadHabit>(BAD_HABITS_COLL, id);
    }
    set((s) => ({
      badHabits: s.badHabits.filter((h) => h.id !== id),
      badHabitLogs: s.badHabitLogs.filter((l) => l.habitId !== id),
    }));
  },

  toggleBadHabit: async (habitId, date, occurred) => {
    const { user, isGuest } = useAuthStore.getState();
    const { badHabitLogs } = get();
    const existing = badHabitLogs.find((l) => l.habitId === habitId && l.date === date);

    let nextLog: BadHabitLog;

    if (existing) {
      nextLog = { ...existing, occurred };
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!.from('bad_habit_logs').update({ occurred }).eq('id', existing.id);
          if (error) throw error;
        } catch (e) {
          console.error('Error updating bad habit log in Supabase:', e);
          throw e;
        }
      } else {
        storage.update<BadHabitLog>(BAD_HABITS_LOGS_COLL, existing.id, nextLog);
      }
      set((s) => ({
        badHabitLogs: s.badHabitLogs.map((l) => (l.id === existing.id ? nextLog : l)),
      }));
    } else {
      nextLog = { id: uuid(), habitId, date, occurred };
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!.from('bad_habit_logs').insert({
            id: nextLog.id,
            user_id: user.id,
            habit_id: habitId,
            date,
            occurred,
          });
          if (error) throw error;
        } catch (e) {
          console.error('Error inserting bad habit log in Supabase:', e);
          throw e;
        }
      } else {
        storage.create(BAD_HABITS_LOGS_COLL, nextLog);
      }
      set((s) => ({ badHabitLogs: [...s.badHabitLogs, nextLog] }));
    }

    // Award XP if avoided bad habit for the day
    if (!occurred) {
      setTimeout(() => {
        try {
          // Verify if all bad habits for today are avoided
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          const habits = get().badHabits;
          const logs = get().badHabitLogs;
          const allAvoided = habits.every(h => {
            const log = logs.find(l => l.habitId === h.id && l.date === todayStr);
            return log ? !log.occurred : true; // default not occurred is clean
          });

          if (allAvoided) {
            useGamificationStore.getState().addXP(10); // Reward +10 XP for full clean day!
          }
        } catch (err) {
          console.error('Gamification error in bad habit log:', err);
        }
      }, 0);
    }
  },

  addScreentimeLog: async (hours, category, date) => {
    const { user, isGuest } = useAuthStore.getState();
    const log: ScreentimeLog = { id: uuid(), date, hours, category };

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!.from('screentime_logs').insert({
          id: log.id,
          user_id: user.id,
          hours: log.hours,
          category: log.category,
          date: log.date,
        });
        if (error) throw error;
      } catch (e) {
        console.error('Error saving screentime log to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(SCREENTIME_LOGS_COLL, log);
    }
    set((s) => ({ screentimeLogs: [...s.screentimeLogs, log] }));

    // Reward XP for tracking screen time
    setTimeout(() => {
      try {
        useGamificationStore.getState().addXP(3);
      } catch (err) {
        console.error('Gamification error in screentime log:', err);
      }
    }, 0);
  },

  deleteScreentimeLog: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!.from('screentime_logs').delete().eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting screentime log in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<ScreentimeLog>(SCREENTIME_LOGS_COLL, id);
    }
    set((s) => ({ screentimeLogs: s.screentimeLogs.filter((log) => log.id !== id) }));
  },

  getCleanStreak: (habitId) => {
    const { badHabitLogs } = get();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
      const log = badHabitLogs.find((l) => l.habitId === habitId && l.date === date);
      // Clean day means log is either not logged (assumed clean) or explicitly logged occurred = false
      if (!log || !log.occurred) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
}));
