import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useGamificationStore } from '../stores/gamificationStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { usePrayerStore } from '../stores/prayerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { TimerMode } from '../types';
import type { PomodoroSession } from '../types';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

// Helper to play a beautiful sound using Web Audio API
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.45); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
    osc2.frequency.exponentialRampToValueAtTime(329.63, ctx.currentTime + 0.15); // E4
    osc2.frequency.exponentialRampToValueAtTime(392.00, ctx.currentTime + 0.3); // G4

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.error('Audio context error:', e);
  }
}

export function usePomodoro() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const mode = usePomodoroStore((s) => s.mode);
  const timeRemaining = usePomodoroStore((s) => s.timeRemaining);
  const totalTime = usePomodoroStore((s) => s.totalTime);
  const currentCategory = usePomodoroStore((s) => s.currentCategory);
  const currentNotes = usePomodoroStore((s) => s.currentNotes);
  const currentSessionStart = usePomodoroStore((s) => s.currentSessionStart);
  
  const tick = usePomodoroStore((s) => s.tick);
  const addSession = usePomodoroStore((s) => s.addSession);
  const setMode = usePomodoroStore((s) => s.setMode);
  const setTimeRemaining = usePomodoroStore((s) => s.setTimeRemaining);
  const incrementSessionCount = usePomodoroStore((s) => s.incrementSessionCount);
  const resetSessionCount = usePomodoroStore((s) => s.resetSessionCount);
  const stopTimer = usePomodoroStore((s) => s.stopTimer);
  const setIsRunning = usePomodoroStore((s) => s.setIsRunning);

  const addXP = useGamificationStore((s) => s.addXP);
  const checkAchievements = useGamificationStore((s) => s.checkAchievements);

  // Reference state to access latest values in intervals
  const stateRef = useRef({ mode, currentCategory, currentNotes, currentSessionStart, totalTime });
  useEffect(() => {
    stateRef.current = { mode, currentCategory, currentNotes, currentSessionStart, totalTime };
  }, [mode, currentCategory, currentNotes, currentSessionStart, totalTime]);

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const autoStartBreaks = useSettingsStore((s) => s.autoStartBreaks);
  const autoStartFocus = useSettingsStore((s) => s.autoStartFocus);
  const preset = useSettingsStore((s) => s.pomodoroPreset);

  // Handle countdown interval
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      if (timeRemaining <= 1) {
        clearInterval(timer);
        handleTimerCompletion();
      } else {
        tick();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, tick]);

  const handleTimerCompletion = () => {
    if (soundEnabled) {
      playChime();
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const { mode: completedMode, currentCategory: cat, currentNotes: notes, currentSessionStart: start, totalTime: durationSec } = stateRef.current;

    if (completedMode === TimerMode.FOCUS) {
      // 1. Log session
      const durationMin = Math.round(durationSec / 60);
      const session: PomodoroSession = {
        id: uuid(),
        date: todayStr,
        startTime: start || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: durationMin,
        category: cat,
        notes: notes,
        completed: true,
      };
      
      addSession(session);
      incrementSessionCount();
      
      // 2. Add XP (+25 XP per session)
      addXP(25);

      // 3. Trigger achievements check
      triggerAchievementsCheck();

      // 4. Determine next mode
      const count = usePomodoroStore.getState().sessionCount;
      if (count >= preset.sessionsBeforeLongBreak) {
        setMode(TimerMode.LONG_BREAK);
        setTimeRemaining(preset.breakMinutes * 3 * 60); // 15 mins (or breakMinutes * 3)
        resetSessionCount();
        setIsRunning(autoStartBreaks);
      } else {
        setMode(TimerMode.SHORT_BREAK);
        setTimeRemaining(preset.breakMinutes * 60); // 5 mins
        setIsRunning(autoStartBreaks);
      }
    } else {
      // It was a break, go back to Focus
      setMode(TimerMode.FOCUS);
      setTimeRemaining(preset.focusMinutes * 60);
      setIsRunning(autoStartFocus);
    }
  };

  const triggerAchievementsCheck = () => {
    const sessions = usePomodoroStore.getState().sessions;
    const tasks = useTaskStore.getState().tasks;
    const habits = useHabitStore.getState().habits;
    const habitLogs = useHabitStore.getState().logs;
    const prayerLogs = usePrayerStore.getState().logs;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todaySessions = sessions.filter(s => s.date === todayStr);
    const focusHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    // Streaks (using habitStore streak)
    let maxStreak = 0;
    habits.forEach(h => {
      const streak = useHabitStore.getState().getStreak(h.id);
      if (streak > maxStreak) maxStreak = streak;
    });
    const prayerStreak = usePrayerStore.getState().getStreak();
    const streak = Math.max(maxStreak, prayerStreak, 1);

    const activeHabits = habits.filter(h => !h.archived);
    const dailyHabits = activeHabits.filter(h => 
      habitLogs.some(l => l.habitId === h.id && l.date === todayStr && l.completed)
    ).length;

    const dailyPrayers = prayerLogs.filter(l => l.date === todayStr && l.completed).length;

    checkAchievements({
      pomodoros: sessions.length,
      tasks: completedTasks,
      streak,
      focusHours,
      dailyPrayers,
      dailyHabits,
      totalHabits: activeHabits.length
    });
  };

  return {
    handleTimerCompletion,
    triggerAchievementsCheck
  };
}
