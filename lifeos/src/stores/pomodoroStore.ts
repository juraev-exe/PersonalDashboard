// ============================================
// LifeOS — Pomodoro Store
// ============================================

import { create } from 'zustand';
import type { PomodoroSession } from '../types';
import { PomodoroCategory, TimerMode } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapPomodoroFromDB, mapPomodoroToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

const COLLECTION = 'pomodoro_sessions';

interface PomodoroState {
  sessions: PomodoroSession[];
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerMode;
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  currentCategory: PomodoroCategory;
  currentNotes: string;
  sessionCount: number; // sessions completed in current batch
  currentSessionStart: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  addSession: (session: PomodoroSession) => Promise<void>;
  setCategory: (category: PomodoroCategory) => void;
  setNotes: (notes: string) => void;
  startTimer: (totalSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  setTimeRemaining: (seconds: number) => void;
  incrementSessionCount: () => void;
  resetSessionCount: () => void;
  setIsRunning: (v: boolean) => void;
  setCurrentSessionStart: (v: string | null) => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  sessions: [],
  isRunning: false,
  isPaused: false,
  mode: TimerMode.FOCUS,
  timeRemaining: 25 * 60,
  totalTime: 25 * 60,
  currentCategory: PomodoroCategory.PROGRAMMING,
  currentNotes: '',
  sessionCount: 0,
  currentSessionStart: null,

  loadSessions: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('pomodoro_sessions')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ sessions: data.map(mapPomodoroFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading pomodoro sessions from Supabase:', e);
      }
    }
    const sessions = storage.getAll<PomodoroSession>(COLLECTION);
    set({ sessions });
  },

  addSession: async (session) => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('pomodoro_sessions')
          .insert(mapPomodoroToDB(session, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving pomodoro session to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(COLLECTION, session);
    }
    set((s) => ({ sessions: [...s.sessions, session] }));
  },

  setCategory: (currentCategory) => set({ currentCategory }),
  setNotes: (currentNotes) => set({ currentNotes }),

  startTimer: (totalSeconds) => set({
    isRunning: true,
    isPaused: false,
    timeRemaining: totalSeconds,
    totalTime: totalSeconds,
    currentSessionStart: new Date().toISOString(),
  }),

  pauseTimer: () => set({ isRunning: false, isPaused: true }),
  resumeTimer: () => set({ isRunning: true, isPaused: false }),

  stopTimer: () => set({
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    mode: TimerMode.FOCUS,
    currentSessionStart: null,
  }),

  tick: () => set((s) => {
    if (s.timeRemaining <= 0) return { isRunning: false };
    return { timeRemaining: s.timeRemaining - 1 };
  }),

  setMode: (mode) => set({ mode }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  incrementSessionCount: () => set((s) => ({ sessionCount: s.sessionCount + 1 })),
  resetSessionCount: () => set({ sessionCount: 0 }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setCurrentSessionStart: (currentSessionStart) => set({ currentSessionStart }),
}));
