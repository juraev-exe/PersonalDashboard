// ============================================
// LifeOS — Calendar Store
// ============================================

import { create } from 'zustand';
import type { CalendarEvent } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'calendar_events';

interface CalendarState {
  events: CalendarEvent[];
  viewMode: 'month' | 'week' | 'day';
  selectedDate: string;
  loadEvents: () => void;
  addEvent: (data: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  setSelectedDate: (date: string) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  viewMode: 'month',
  selectedDate: new Date().toISOString().split('T')[0],

  loadEvents: () => { set({ events: storage.getAll<CalendarEvent>(COLLECTION) }); },

  addEvent: (data) => {
    const event = { ...data, id: uuid() };
    storage.create(COLLECTION, event);
    set((s) => ({ events: [...s.events, event] }));
  },

  updateEvent: (id, updates) => {
    storage.update<CalendarEvent>(COLLECTION, id, updates);
    set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
  },

  deleteEvent: (id) => {
    storage.remove<CalendarEvent>(COLLECTION, id);
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
