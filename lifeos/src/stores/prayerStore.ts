// ============================================
// LifeOS — Prayer Store
// ============================================

import { create } from 'zustand';
import type { PrayerLog } from '../types';
import { PrayerName } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useGamificationStore } from './gamificationStore';

const COLLECTION = 'prayer_logs';

interface PrayerState {
  logs: PrayerLog[];
  loadPrayers: () => void;
  togglePrayer: (prayer: PrayerName, date: string) => void;
  isPrayerCompleted: (prayer: PrayerName, date: string) => boolean;
  getDailyCompletion: (date: string) => number;
  getStreak: () => number;
}

export const usePrayerStore = create<PrayerState>((set, get) => ({
  logs: [],

  loadPrayers: () => {
    const logs = storage.getAll<PrayerLog>(COLLECTION);
    set({ logs });
  },

  togglePrayer: (prayer, date) => {
    const { logs } = get();
    const existing = logs.find((l) => l.prayer === prayer && l.date === date);
    let isCompletedNow = false;

    if (existing) {
      isCompletedNow = !existing.completed;
      const updated = { ...existing, completed: isCompletedNow };
      storage.update<PrayerLog>(COLLECTION, existing.id, updated);
      set((s) => ({ logs: s.logs.map((l) => (l.id === existing.id ? updated : l)) }));
    } else {
      isCompletedNow = true;
      const log: PrayerLog = { id: uuid(), date, prayer, completed: true, time: new Date().toISOString() };
      storage.create(COLLECTION, log);
      set((s) => ({ logs: [...s.logs, log] }));
    }

    if (isCompletedNow) {
      setTimeout(() => {
        try {
          const gamification = useGamificationStore.getState();
          gamification.addXP(5);

          // Trigger achievements
          const sessions = storage.getAll<any>('pomodoro_sessions');
          const tasks = storage.getAll<any>('tasks');
          const habits = storage.getAll<any>('habits');
          const habitLogs = storage.getAll<any>('habit_logs');
          const nextPrayerLogs = storage.getAll<PrayerLog>('prayer_logs');
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
