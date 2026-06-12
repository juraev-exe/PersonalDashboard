// ============================================
// LifeOS — Note Store
// ============================================

import { create } from 'zustand';
import type { Note } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapNoteFromDB, mapNoteToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'notes';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  loadNotes: () => Promise<void>;
  addNote: (data: { title: string; content: string; tags: string[] }) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  setActiveNote: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  searchQuery: '',

  loadNotes: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('notes')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ notes: data.map(mapNoteFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading notes from Supabase:', e);
      }
    }
    const notes = storage.getAll<Note>(COLLECTION);
    set({ notes });
  },

  addNote: async (data) => {
    const { user, isGuest } = useAuthStore.getState();
    const note: Note = {
      ...data,
      id: uuid(),
      pinned: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('notes')
          .insert(mapNoteToDB(note, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving note to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(COLLECTION, note);
    }
    
    set((s) => ({ notes: [...s.notes, note], activeNoteId: note.id }));
    return note;
  },

  updateNote: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    const u = { ...updates, updatedAt: new Date().toISOString() };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.pinned !== undefined) dbUpdates.pinned = updates.pinned;
        if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
        dbUpdates.updated_at = u.updatedAt;

        const { error } = await supabase!
          .from('notes')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating note in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<Note>(COLLECTION, id, u);
    }
    
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...u } : n)) }));
  },

  deleteNote: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('notes')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting note in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<Note>(COLLECTION, id);
    }
    
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      activeNoteId: s.activeNoteId === id ? null : s.activeNoteId
    }));
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) await get().updateNote(id, { pinned: !note.pinned });
  },

  toggleArchive: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) await get().updateNote(id, { archived: !note.archived });
  },

  setActiveNote: (activeNoteId) => set({ activeNoteId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
