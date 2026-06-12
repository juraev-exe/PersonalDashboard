// ============================================
// LifeOS — Calendar Store
// ============================================

import { create } from 'zustand';
import type { CalendarEvent } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapCalendarEventFromDB, mapCalendarEventToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'calendar_events';

interface CalendarState {
  events: CalendarEvent[];
  viewMode: 'month' | 'week' | 'day';
  selectedDate: string;
  loadEvents: () => Promise<void>;
  addEvent: (data: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  setSelectedDate: (date: string) => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  viewMode: 'month',
  selectedDate: new Date().toISOString().split('T')[0],

  loadEvents: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ events: data.map(mapCalendarEventFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading calendar events from Supabase:', e);
      }
    }
    const events = storage.getAll<CalendarEvent>(COLLECTION);
    set({ events });
  },

  addEvent: async (data) => {
    const { user, isGuest } = useAuthStore.getState();
    const event: CalendarEvent = { ...data, id: uuid() };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('calendar_events')
          .insert(mapCalendarEventToDB(event, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving calendar event to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(COLLECTION, event);
    }

    set((s) => ({ events: [...s.events, event] }));
    return event;
  },

  updateEvent: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description || null;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime || null;
        if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime || null;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.color !== undefined) dbUpdates.color = updates.color;

        const { error } = await supabase!
          .from('calendar_events')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating calendar event in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<CalendarEvent>(COLLECTION, id, updates);
    }

    set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
  },

  deleteEvent: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('calendar_events')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting calendar event in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<CalendarEvent>(COLLECTION, id);
    }

    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
