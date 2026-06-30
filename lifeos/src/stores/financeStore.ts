// ============================================
// LifeOS — Finance Store
// ============================================

import { create } from 'zustand';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { useGamificationStore } from './gamificationStore';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'transactions';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

interface FinanceState {
  transactions: Transaction[];
  loadTransactions: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],

  loadTransactions: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('transactions')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({
            transactions: data.map((d: any) => ({
              id: d.id,
              type: d.type,
              amount: Number(d.amount),
              category: d.category,
              description: d.description || '',
              date: d.date,
              createdAt: d.created_at,
            })),
          });
          return;
        }
      } catch (e) {
        console.error('Error loading transactions from Supabase:', e);
      }
    }
    set({ transactions: storage.getAll<Transaction>(COLLECTION) });
  },

  addTransaction: async (txData) => {
    const { user, isGuest } = useAuthStore.getState();
    const transaction: Transaction = {
      ...txData,
      id: uuid(),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('transactions')
          .insert({
            id: transaction.id,
            user_id: user.id,
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            created_at: transaction.createdAt,
          });
        if (error) throw error;
      } catch (e) {
        console.error('Error saving transaction to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(COLLECTION, transaction);
    }

    set((s) => ({ transactions: [...s.transactions, transaction] }));

    // Reward XP for logging transactions
    setTimeout(() => {
      try {
        useGamificationStore.getState().addXP(2);
      } catch (err) {
        console.error('Gamification error in transaction log:', err);
      }
    }, 0);
  },

  deleteTransaction: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('transactions')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting transaction in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<Transaction>(COLLECTION, id);
    }
    set((s) => ({ transactions: s.transactions.filter((tx) => tx.id !== id) }));
  },
}));
