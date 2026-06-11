// ============================================
// LifeOS — Note Store
// ============================================

import { create } from 'zustand';
import type { Note } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'notes';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  loadNotes: () => void;
  addNote: (data: { title: string; content: string; tags: string[] }) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  searchQuery: '',

  loadNotes: () => { set({ notes: storage.getAll<Note>(COLLECTION) }); },

  addNote: (data) => {
    const note: Note = { ...data, id: uuid(), pinned: false, archived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    storage.create(COLLECTION, note);
    set((s) => ({ notes: [...s.notes, note], activeNoteId: note.id }));
    return note;
  },

  updateNote: (id, updates) => {
    const u = { ...updates, updatedAt: new Date().toISOString() };
    storage.update<Note>(COLLECTION, id, u);
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...u } : n)) }));
  },

  deleteNote: (id) => {
    storage.remove<Note>(COLLECTION, id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id), activeNoteId: s.activeNoteId === id ? null : s.activeNoteId }));
  },

  togglePin: (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) get().updateNote(id, { pinned: !note.pinned });
  },

  toggleArchive: (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) get().updateNote(id, { archived: !note.archived });
  },

  setActiveNote: (activeNoteId) => set({ activeNoteId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
