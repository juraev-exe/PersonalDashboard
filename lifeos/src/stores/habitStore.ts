// ============================================
// LifeOS — Habits Store
// ============================================

import { create } from 'zustand';
import type { Habit, HabitLog } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useGamificationStore } from './gamificationStore';

const HABITS_COLLECTION = 'habits';
const LOGS_COLLECTION = 'habit_logs';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  loadHabits: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (habitId: string, date: string) => void;
  getHabitCompletionForDate: (habitId: string, date: string) => boolean;
  getCompletionPercentage: (date: string) => number;
  getStreak: (habitId: string) => number;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],

  loadHabits: () => {
    const habits = storage.getAll<Habit>(HABITS_COLLECTION);
    const logs = storage.getAll<HabitLog>(LOGS_COLLECTION);
    set({ habits, logs });
  },

  addHabit: (habitData) => {
    const habit: Habit = { ...habitData, id: uuid(), createdAt: new Date().toISOString(), archived: false };
    storage.create(HABITS_COLLECTION, habit);
    set((s) => ({ habits: [...s.habits, habit] }));
  },

  updateHabit: (id, updates) => {
    storage.update<Habit>(HABITS_COLLECTION, id, updates);
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHabit: (id) => {
    storage.remove<Habit>(HABITS_COLLECTION, id);
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
  },

  toggleHabitDay: (habitId, date) => {
    const { logs } = get();
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    let isCompletedNow = false;

    if (existing) {
      isCompletedNow = !existing.completed;
      const updated = { ...existing, completed: isCompletedNow, value: isCompletedNow ? 1 : 0 };
      storage.update<HabitLog>(LOGS_COLLECTION, existing.id, updated);
      set((s) => ({
        logs: s.logs.map((l) => (l.id === existing.id ? updated : l)),
      }));
    } else {
      isCompletedNow = true;
      const log: HabitLog = { id: uuid(), habitId, date, completed: true, value: 1 };
      storage.create(LOGS_COLLECTION, log);
      set((s) => ({ logs: [...s.logs, log] }));
    }

    // Award XP and check achievements if completed
    if (isCompletedNow) {
      setTimeout(() => {
        try {
          const gamification = useGamificationStore.getState();
          gamification.addXP(5);
          
          // Trigger achievements
          const sessions = storage.getAll<any>('pomodoro_sessions');
          const tasks = storage.getAll<any>('tasks');
          const habits = storage.getAll<Habit>('habits');
          const nextLogs = storage.getAll<HabitLog>('habit_logs');
          const prayerLogs = storage.getAll<any>('prayer_logs');
          const todayStr = format(new Date(), 'yyyy-MM-dd');

          const completedTasksCount = tasks.filter((t: any) => t.status === 'completed').length;
          const focusHours = sessions.reduce((sum: number, s: any) => sum + s.duration, 0) / 60;
          
          const activeHabits = habits.filter((h: any) => !h.archived);
          const dailyHabits = activeHabits.filter((h: any) => 
            nextLogs.some((l: any) => l.habitId === h.id && l.date === todayStr && l.completed)
          ).length;
          const dailyPrayers = prayerLogs.filter((l: any) => l.date === todayStr && l.completed).length;

          // Compute max streak
          let maxStreak = 0;
          activeHabits.forEach(h => {
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
              const checkDate = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
              const completed = nextLogs.some((l: any) => l.habitId === h.id && l.date === checkDate && l.completed);
              if (completed) streak++;
              else break;
            }
            if (streak > maxStreak) maxStreak = streak;
          });

          gamification.checkAchievements({
            pomodoros: sessions.length,
            tasks: completedTasksCount,
            streak: Math.max(maxStreak, 1),
            focusHours,
            dailyPrayers,
            dailyHabits,
            totalHabits: activeHabits.length
          });
        } catch (err) {
          console.error('Gamification error in habit completion:', err);
        }
      }, 0);
    }
  },

  getHabitCompletionForDate: (habitId, date) => {
    return get().logs.some((l) => l.habitId === habitId && l.date === date && l.completed);
  },

  getCompletionPercentage: (date) => {
    const { habits, logs } = get();
    const activeHabits = habits.filter((h) => !h.archived);
    if (activeHabits.length === 0) return 0;
    const completed = activeHabits.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.date === date && l.completed)
    ).length;
    return Math.round((completed / activeHabits.length) * 100);
  },

  getStreak: (habitId) => {
    const { logs } = get();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
      const completed = logs.some((l) => l.habitId === habitId && l.date === date && l.completed);
      if (completed) streak++;
      else break;
    }
    return streak;
  },
}));
