// ============================================
// LifeOS — Goals Store
// ============================================

import { create } from 'zustand';
import type { Goal } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'goals';

interface GoalState {
  goals: Goal[];
  loadGoals: () => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],

  loadGoals: () => {
    set({ goals: storage.getAll<Goal>(COLLECTION) });
  },

  addGoal: (goalData) => {
    const now = new Date().toISOString();
    const goal: Goal = {
      ...goalData,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    storage.create(COLLECTION, goal);
    set((s) => ({ goals: [...s.goals, goal] }));
  },

  updateGoal: (id, updates) => {
    const u = { ...updates, updatedAt: new Date().toISOString() };
    storage.update<Goal>(COLLECTION, id, u);
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...u } : g)),
    }));
  },

  deleteGoal: (id) => {
    storage.remove<Goal>(COLLECTION, id);
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },
}));
