// ============================================
// LifeOS — Habits Store
// ============================================

import { create } from 'zustand';
import type { Habit, HabitLog } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapHabitFromDB, mapHabitToDB, mapHabitLogFromDB, mapHabitLogToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useGamificationStore } from './gamificationStore';
import { usePomodoroStore } from './pomodoroStore';
import { useTaskStore } from './taskStore';
import { usePrayerStore } from './prayerStore';

const HABITS_COLLECTION = 'habits';
const LOGS_COLLECTION = 'habit_logs';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  loadHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDay: (habitId: string, date: string) => Promise<void>;
  getHabitCompletionForDate: (habitId: string, date: string) => boolean;
  getCompletionPercentage: (date: string) => number;
  getStreak: (habitId: string) => number;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],

  loadHabits: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const habitsRes = await supabase!
          .from('habits')
          .select('*')
          .eq('user_id', user.id);
          
        if (habitsRes.error) throw habitsRes.error;
        
        const habits = habitsRes.data.map(mapHabitFromDB);
        const habitIds = habits.map(h => h.id);
        
        let logs: HabitLog[] = [];
        if (habitIds.length > 0) {
          const logsRes = await supabase!
            .from('habit_logs')
            .select('*')
            .in('habit_id', habitIds);
          if (logsRes.error) throw logsRes.error;
          logs = logsRes.data.map(mapHabitLogFromDB);
        }
        
        set({ habits, logs });
        return;
      } catch (e) {
        console.error('Error loading habits/logs from Supabase:', e);
      }
    }
    const habits = storage.getAll<Habit>(HABITS_COLLECTION);
    const logs = storage.getAll<HabitLog>(LOGS_COLLECTION);
    set({ habits, logs });
  },

  addHabit: async (habitData) => {
    const { user, isGuest } = useAuthStore.getState();
    const habit: Habit = { ...habitData, id: uuid(), createdAt: new Date().toISOString(), archived: false };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('habits')
          .insert(mapHabitToDB(habit, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving habit to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(HABITS_COLLECTION, habit);
    }
    
    set((s) => ({ habits: [...s.habits, habit] }));
  },

  updateHabit: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
        if (updates.dailyTarget !== undefined) dbUpdates.daily_target = updates.dailyTarget;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.archived !== undefined) dbUpdates.archived = updates.archived;

        const { error } = await supabase!
          .from('habits')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating habit in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<Habit>(HABITS_COLLECTION, id, updates);
    }
    
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHabit: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('habits')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting habit in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<Habit>(HABITS_COLLECTION, id);
    }
    
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      logs: s.logs.filter((l) => l.habitId !== id),
    }));
  },

  toggleHabitDay: async (habitId, date) => {
    const { user, isGuest } = useAuthStore.getState();
    const { logs } = get();
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    let isCompletedNow = false;
    let nextLog: HabitLog;

    if (existing) {
      isCompletedNow = !existing.completed;
      nextLog = { ...existing, completed: isCompletedNow, value: isCompletedNow ? 1 : 0 };
      
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!
            .from('habit_logs')
            .update(mapHabitLogToDB(nextLog))
            .eq('id', existing.id);
          if (error) throw error;
        } catch (e) {
          console.error('Error updating habit log in Supabase:', e);
          throw e;
        }
      } else {
        storage.update<HabitLog>(LOGS_COLLECTION, existing.id, nextLog);
      }
      
      set((s) => ({
        logs: s.logs.map((l) => (l.id === existing.id ? nextLog : l)),
      }));
    } else {
      isCompletedNow = true;
      nextLog = { id: uuid(), habitId, date, completed: true, value: 1 };
      
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!
            .from('habit_logs')
            .insert(mapHabitLogToDB(nextLog));
          if (error) throw error;
        } catch (e) {
          console.error('Error inserting habit log in Supabase:', e);
          throw e;
        }
      } else {
        storage.create(LOGS_COLLECTION, nextLog);
      }
      
      set((s) => ({ logs: [...s.logs, nextLog] }));
    }

    // Award XP and check achievements if completed
    if (isCompletedNow) {
      setTimeout(() => {
        try {
          const gamification = useGamificationStore.getState();
          gamification.addXP(5);
          
          // Trigger achievements
          const sessions = usePomodoroStore.getState().sessions;
          const tasks = useTaskStore.getState().tasks;
          const habits = get().habits;
          const nextLogs = get().logs;
          const prayerLogs = usePrayerStore.getState().logs;
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
