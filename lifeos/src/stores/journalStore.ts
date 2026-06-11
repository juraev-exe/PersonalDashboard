// ============================================
// LifeOS — Journal Store
// ============================================

import { create } from 'zustand';
import type { JournalEntry } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

const COLLECTION = 'journal_entries';

interface JournalState {
  entries: JournalEntry[];
  loadEntries: () => void;
  getEntryByDate: (date: string) => JournalEntry | undefined;
  saveEntry: (date: string, content: string, mood?: string, tags?: string[]) => JournalEntry;
  deleteEntry: (id: string) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],

  loadEntries: () => {
    set({ entries: storage.getAll<JournalEntry>(COLLECTION) });
  },

  getEntryByDate: (date) => {
    return get().entries.find((e) => e.date === date);
  },

  saveEntry: (date, content, mood, tags = []) => {
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
      storage.update<JournalEntry>(COLLECTION, existing.id, updated);
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
      storage.create(COLLECTION, entry);
      set((s) => ({ entries: [...s.entries, entry] }));
      return entry;
    }
  },

  deleteEntry: (id) => {
    storage.remove<JournalEntry>(COLLECTION, id);
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },
}));
