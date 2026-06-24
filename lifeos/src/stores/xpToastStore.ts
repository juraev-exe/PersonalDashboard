// ============================================
// LifeOS — XP Notification Toast Store
// ============================================

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export interface XpToast {
  id: string;
  amount: number;
  message?: string;
  isLevelUp?: boolean;
}

interface XpToastState {
  toasts: XpToast[];
  addXpToast: (amount: number, message?: string) => void;
  addLevelUpToast: (level: number) => void;
  removeToast: (id: string) => void;
}

export const useXpToastStore = create<XpToastState>((set) => ({
  toasts: [],
  addXpToast: (amount, message) => {
    const toast: XpToast = { id: uuid(), amount, message, isLevelUp: false };
    set((s) => ({ toasts: [...s.toasts, toast] }));
  },
  addLevelUpToast: (level) => {
    const toast: XpToast = { id: uuid(), amount: level, message: `Reached Level ${level}!`, isLevelUp: true };
    set((s) => ({ toasts: [...s.toasts, toast] }));
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
