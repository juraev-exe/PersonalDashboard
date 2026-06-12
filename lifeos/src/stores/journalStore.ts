// ============================================
// LifeOS — Journal Store
// ============================================

import { create } from 'zustand';
import type { JournalEntry } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapJournalFromDB, mapJournalToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

const COLLECTION = 'journal_entries';

interface JournalState {
  entries: JournalEntry[];
  loadEntries: () => Promise<void>;
  getEntryByDate: (date: string) => JournalEntry | undefined;
  saveEntry: (date: string, content: string, mood?: string, tags?: string[]) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],

  loadEntries: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ entries: data.map(mapJournalFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading journal entries from Supabase:', e);
      }
    }
    set({ entries: storage.getAll<JournalEntry>(COLLECTION) });
  },

  getEntryByDate: (date) => {
    return get().entries.find((e) => e.date === date);
  },

  saveEntry: async (date, content, mood, tags = []) => {
    const { user, isGuest } = useAuthStore.getState();
    const existing = get().getEntryByDate(date);
    const now = new Date().toISOString();

    if (existing) {
      const updated = {
        ...existing,
        content,
        mood,
        tags,
        updatedAt: now,
      };

      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!
            .from('journal_entries')
            .update(mapJournalToDB(updated, user.id))
            .eq('id', existing.id);
          if (error) throw error;
        } catch (e) {
          console.error('Error updating journal entry in Supabase:', e);
          throw e;
        }
      } else {
        storage.update<JournalEntry>(COLLECTION, existing.id, updated);
      }

      set((s) => ({
        entries: s.entries.map((e) => (e.id === existing.id ? updated : e)),
      }));
      return updated;
    } else {
      const entry: JournalEntry = {
        id: uuid(),
        date,
        content,
        mood,
        tags,
        createdAt: now,
        updatedAt: now,
      };

      if (isSupabaseConfigured && !isGuest && user) {
        try {
          const { error } = await supabase!
            .from('journal_entries')
            .insert(mapJournalToDB(entry, user.id));
          if (error) throw error;
        } catch (e) {
          console.error('Error saving journal entry to Supabase:', e);
          throw e;
        }
      } else {
        storage.create(COLLECTION, entry);
      }

      set((s) => ({ entries: [...s.entries, entry] }));
      return entry;
    }
  },

  deleteEntry: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('journal_entries')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting journal entry in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<JournalEntry>(COLLECTION, id);
    }
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },
}));
