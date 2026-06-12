// ============================================
// LifeOS — Prayer Store
// ============================================

import { create } from 'zustand';
import type { PrayerLog } from '../types';
import { PrayerName } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapPrayerLogFromDB, mapPrayerLogToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useGamificationStore } from './gamificationStore';
import { usePomodoroStore } from './pomodoroStore';
import { useTaskStore } from './taskStore';
import { useHabitStore } from './habitStore';

const COLLECTION = 'prayer_logs';

interface PrayerState {
  logs: PrayerLog[];
  loadPrayers: () => Promise<void>;
  togglePrayer: (prayer: PrayerName, date: string) => Promise<void>;
  isPrayerCompleted: (prayer: PrayerName, date: string) => boolean;
  getDailyCompletion: (date: string) => number;
  getStreak: () => number;
}

export const usePrayerStore = create<PrayerState>((set, get) => ({
  logs: [],

  loadPrayers: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('prayer_logs')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ logs: data.map(mapPrayerLogFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading prayer logs from Supabase:', e);
      }
    }
    const logs = storage.getAll<PrayerLog>(COLLECTION);
    set({ logs });
  },

  togglePrayer: async (prayer, date) => {
    const { user, isGuest } = useAuthStore.getState();
    const { logs } = get();
    const existing = logs.find((l) => l.prayer === prayer && l.date === date);
    let isCompletedNow = false;
    let nextLog: PrayerLog;

    if (existing) {
      isCompletedNow = !existing.completed;
      nextLog = { ...existing, completed: isCompletedNow };
      
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!
            .from('prayer_logs')
            .update(mapPrayerLogToDB(nextLog, user.id))
            .eq('id', existing.id);
          if (error) throw error;
        } catch (e) {
          console.error('Error updating prayer log in Supabase:', e);
          throw e;
        }
      } else {
        storage.update<PrayerLog>(COLLECTION, existing.id, nextLog);
      }
      
      set((s) => ({ logs: s.logs.map((l) => (l.id === existing.id ? nextLog : l)) }));
    } else {
      isCompletedNow = true;
      nextLog = { id: uuid(), date, prayer, completed: true, time: new Date().toISOString() };
      
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!
            .from('prayer_logs')
            .insert(mapPrayerLogToDB(nextLog, user.id));
          if (error) throw error;
        } catch (e) {
          console.error('Error inserting prayer log in Supabase:', e);
          throw e;
        }
      } else {
        storage.create(COLLECTION, nextLog);
      }
      
      set((s) => ({ logs: [...s.logs, nextLog] }));
    }

    if (isCompletedNow) {
      setTimeout(() => {
        try {
          const gamification = useGamificationStore.getState();
          gamification.addXP(5);

          // Trigger achievements
          const sessions = usePomodoroStore.getState().sessions;
          const tasks = useTaskStore.getState().tasks;
          const habits = useHabitStore.getState().habits;
          const habitLogs = useHabitStore.getState().logs;
          const nextPrayerLogs = get().logs;
          const todayStr = format(new Date(), 'yyyy-MM-dd');

          const completedTasksCount = tasks.filter((t: any) => t.status === 'completed').length;
          const focusHours = sessions.reduce((sum: number, s: any) => sum + s.duration, 0) / 60;
          
          const activeHabits = habits.filter((h: any) => !h.archived);
          const dailyHabits = activeHabits.filter((h: any) => 
            habitLogs.some((l: any) => l.habitId === h.id && l.date === todayStr && l.completed)
          ).length;
          const dailyPrayers = nextPrayerLogs.filter((l: any) => l.date === todayStr && l.completed).length;

          // Compute max streak
          let maxStreak = 0;
          activeHabits.forEach(h => {
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
              const checkDate = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
              const completed = habitLogs.some((l: any) => l.habitId === h.id && l.date === checkDate && l.completed);
              if (completed) streak++;
              else break;
            }
            if (streak > maxStreak) maxStreak = streak;
          });

          gamification.checkAchievements({
            pomodoros: sessions.length,
            tasks: completedTasksCount,
            streak: Math.max(maxStreak, get().getStreak(), 1),
            focusHours,
            dailyPrayers,
            dailyHabits,
            totalHabits: activeHabits.length
          });
        } catch (err) {
          console.error('Gamification error in prayer completion:', err);
        }
      }, 0);
    }
  },

  isPrayerCompleted: (prayer, date) => {
    return get().logs.some((l) => l.prayer === prayer && l.date === date && l.completed);
  },

  getDailyCompletion: (date) => {
    const prayers = Object.values(PrayerName);
    const completed = prayers.filter((p) =>
      get().logs.some((l) => l.prayer === p && l.date === date && l.completed)
    ).length;
    return Math.round((completed / prayers.length) * 100);
  },

  getStreak: () => {
    const { logs } = get();
    let streak = 0;
    const today = new Date();
    const prayers = Object.values(PrayerName);
    for (let i = 0; i < 365; i++) {
      const date = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
      const allCompleted = prayers.every((p) =>
        logs.some((l) => l.prayer === p && l.date === date && l.completed)
      );
      if (allCompleted) streak++;
      else break;
    }
    return streak;
  },
}));
