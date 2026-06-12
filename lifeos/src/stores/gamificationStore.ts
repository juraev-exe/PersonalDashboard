// ============================================
// LifeOS — Gamification Store (XP, Levels, Achievements)
// ============================================

import { create } from 'zustand';
import type { Achievement } from '../types';
import { getValue, setValue } from '../services/storage';
import { achievementDefinitions } from '../data/seed';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';

interface GamificationState {
  xp: number;
  level: number;
  achievements: Achievement[];
  addXP: (amount: number) => Promise<void>;
  checkAchievements: (stats: { pomodoros: number; tasks: number; streak: number; focusHours: number; dailyPrayers: number; dailyHabits: number; totalHabits: number }) => Promise<void>;
  loadGamification: () => Promise<void>;
  getXPForNextLevel: () => number;
  getXPProgress: () => number;
}

function levelFromXP(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

function xpForLevel(level: number): number {
  return (level - 1) * 200;
}

function xpForNextLevel(level: number): number {
  return level * 200;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xp: 0,
  level: 1,
  achievements: [],

  loadGamification: async () => {
    const { user, isGuest } = useAuthStore.getState();
    let xp = getValue<number>('xp', 0);
    let level = levelFromXP(xp);
    let achievements = getValue<Achievement[]>('achievements', []);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        xp = user.xp;
        level = user.level;
        
        // Fetch unlocked achievements
        const { data, error } = await supabase!
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id);
        
        if (!error && data) {
          const unlockedSet = new Set(data.map(row => row.achievement_id));
          const unlockDates = new Map(data.map(row => [row.achievement_id, row.unlocked_at]));
          
          achievements = achievementDefinitions.map(def => {
            if (unlockedSet.has(def.id)) {
              return { ...def, unlockedAt: unlockDates.get(def.id) };
            }
            return def;
          });
        }
      } catch (e) {
        console.error('Error loading gamification from Supabase:', e);
      }
    }
    set({ xp, level, achievements });
  },

  addXP: async (amount) => {
    const { user, isGuest } = useAuthStore.getState();
    const nextXp = get().xp + amount;
    const nextLevel = levelFromXP(nextXp);
    
    setValue('xp', nextXp);
    set({ xp: nextXp, level: nextLevel });

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        await useAuthStore.getState().updateUserXp(nextLevel, nextXp);
      } catch (e) {
        console.error('Error syncing XP to Supabase:', e);
      }
    }
  },

  checkAchievements: async (stats) => {
    const { user, isGuest } = useAuthStore.getState();
    const { achievements } = get();
    const unlockedIds = new Set(achievements.filter(a => a.unlockedAt).map(a => a.id));
    const newUnlocks: Achievement[] = [];

    achievementDefinitions.forEach(def => {
      if (unlockedIds.has(def.id)) return;
      let unlocked = false;

      if (def.condition === 'pomodoros >= 1' && stats.pomodoros >= 1) unlocked = true;
      if (def.condition === 'pomodoros >= 10' && stats.pomodoros >= 10) unlocked = true;
      if (def.condition === 'pomodoros >= 50' && stats.pomodoros >= 50) unlocked = true;
      if (def.condition === 'pomodoros >= 100' && stats.pomodoros >= 100) unlocked = true;
      if (def.condition === 'tasks >= 1' && stats.tasks >= 1) unlocked = true;
      if (def.condition === 'tasks >= 10' && stats.tasks >= 10) unlocked = true;
      if (def.condition === 'tasks >= 50' && stats.tasks >= 50) unlocked = true;
      if (def.condition === 'tasks >= 100' && stats.tasks >= 100) unlocked = true;
      if (def.condition === 'streak >= 7' && stats.streak >= 7) unlocked = true;
      if (def.condition === 'streak >= 30' && stats.streak >= 30) unlocked = true;
      if (def.condition === 'streak >= 100' && stats.streak >= 100) unlocked = true;
      if (def.condition === 'focusHours >= 100' && stats.focusHours >= 100) unlocked = true;
      if (def.condition === 'dailyPrayers >= 5' && stats.dailyPrayers >= 5) unlocked = true;
      if (def.condition === 'dailyHabits >= all' && stats.dailyHabits >= stats.totalHabits && stats.totalHabits > 0) unlocked = true;

      if (unlocked) {
        newUnlocks.push({ ...def, unlockedAt: new Date().toISOString() });
      }
    });

    if (newUnlocks.length > 0) {
      const all = [...achievements.filter(a => a.unlockedAt), ...newUnlocks];
      const allWithLocked = achievementDefinitions.map(def => {
        const found = all.find(a => a.id === def.id);
        return found || def;
      });
      
      setValue('achievements', allWithLocked);
      set({ achievements: allWithLocked });

      // Persist unlocks to Supabase if configured
      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const rows = newUnlocks.map(ach => ({
            user_id: user.id,
            achievement_id: ach.id,
            unlocked_at: ach.unlockedAt
          }));
          await supabase!
            .from('user_achievements')
            .insert(rows);
        } catch (e) {
          console.error('Error saving user achievements to Supabase:', e);
        }
      }

      // Add XP for new achievements
      const totalXP = newUnlocks.reduce((sum, a) => sum + a.xpReward, 0);
      if (totalXP > 0) await get().addXP(totalXP);
    }
  },

  getXPForNextLevel: () => {
    const { level } = get();
    return xpForNextLevel(level);
  },

  getXPProgress: () => {
    const { xp, level } = get();
    const currentLevelXP = xpForLevel(level);
    const nextLevelXP = xpForNextLevel(level);
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  },
}));
