// ============================================
// LifeOS — Data Initialization Hook
// ============================================

import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { usePrayerStore } from '../stores/prayerStore';
import { useProjectStore } from '../stores/projectStore';
import { useNoteStore } from '../stores/noteStore';
import { useCalendarStore } from '../stores/calendarStore';
import { useGamificationStore } from '../stores/gamificationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { useJournalStore } from '../stores/journalStore';
import { useGoalStore } from '../stores/goalStore';
import { useFinanceStore } from '../stores/financeStore';
import { useDetoxStore } from '../stores/detoxStore';
import * as storage from '../services/storage';
import {
  defaultHabits,
  createSampleTasks,
  createSampleProjects,
  createSampleNotes,
  createSamplePomodoros,
  createSamplePrayerLogs,
  createSampleHabitLogs,
  createSampleCalendarEvents,
  achievementDefinitions,
} from '../data/seed';

export function useInitData() {
  const initialized = useRef(false);
  const authInitialized = useAuthStore((s) => s.initialized);

  const loadSessions = usePomodoroStore((s) => s.loadSessions);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadHabits = useHabitStore((s) => s.loadHabits);
  const loadPrayers = usePrayerStore((s) => s.loadPrayers);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const loadNotes = useNoteStore((s) => s.loadNotes);
  const loadEntries = useJournalStore((s) => s.loadEntries);
  const loadGoals = useGoalStore((s) => s.loadGoals);
  const loadEvents = useCalendarStore((s) => s.loadEvents);
  const loadGamification = useGamificationStore((s) => s.loadGamification);
  const loadTransactions = useFinanceStore((s) => s.loadTransactions);
  const loadDetoxData = useDetoxStore((s) => s.loadDetoxData);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    if (!authInitialized || initialized.current) return;
    initialized.current = true;

    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // Seed data if first launch
    const seeded = storage.getValue<boolean>('seeded', false);
    if (!seeded) {
      // Seed habits
      const habits = defaultHabits;
      storage.setAll('habits', habits);

      // Seed other collections
      storage.setAll('tasks', createSampleTasks());
      storage.setAll('projects', createSampleProjects());
      storage.setAll('notes', createSampleNotes());
      storage.setAll('pomodoro_sessions', createSamplePomodoros());
      storage.setAll('prayer_logs', createSamplePrayerLogs());
      storage.setAll('habit_logs', createSampleHabitLogs(habits.map(h => h.id)));
      storage.setAll('calendar_events', createSampleCalendarEvents());
      storage.setAll('achievements', achievementDefinitions);
      storage.setValue('xp', 450);
      storage.setValue('seeded', true);
    }

    // Load all data into stores
    loadSessions();
    loadTasks();
    loadHabits();
    loadPrayers();
    loadProjects();
    loadNotes();
    loadEntries();
    loadGoals();
    loadEvents();
    loadGamification();
    loadTransactions();
    loadDetoxData();
  }, [authInitialized, loadSessions, loadTasks, loadHabits, loadPrayers, loadProjects, loadNotes, loadEntries, loadGoals, loadEvents, loadGamification, loadTransactions, loadDetoxData, theme]);
}
