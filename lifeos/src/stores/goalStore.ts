// ============================================
// LifeOS — Goals Store
// ============================================

import { create } from 'zustand';
import type { Goal } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapGoalFromDB, mapGoalToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'goals';

interface GoalState {
  goals: Goal[];
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],

  loadGoals: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('goals')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ goals: data.map(mapGoalFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading goals from Supabase:', e);
      }
    }
    set({ goals: storage.getAll<Goal>(COLLECTION) });
  },

  addGoal: async (goalData) => {
    const { user, isGuest } = useAuthStore.getState();
    const now = new Date().toISOString();
    const goal: Goal = {
      ...goalData,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('goals')
          .insert(mapGoalToDB(goal, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving goal to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(COLLECTION, goal);
    }
    set((s) => ({ goals: [...s.goals, goal] }));
  },

  updateGoal: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    const u = { ...updates, updatedAt: new Date().toISOString() };

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
        if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
        if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
        if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        dbUpdates.updated_at = u.updatedAt;

        const { error } = await supabase!
          .from('goals')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating goal in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<Goal>(COLLECTION, id, u);
    }

    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...u } : g)),
    }));
  },

  deleteGoal: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('goals')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting goal in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<Goal>(COLLECTION, id);
    }

    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },
}));
