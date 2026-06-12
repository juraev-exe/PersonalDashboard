// ============================================
// LifeOS — Project Store
// ============================================

import { create } from 'zustand';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import { mapProjectFromDB, mapProjectToDB } from '../services/dbMapper';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'projects';

interface ProjectState {
  projects: Project[];
  loadProjects: () => Promise<void>;
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],

  loadProjects: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { data, error } = await supabase!
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          set({ projects: data.map(mapProjectFromDB) });
          return;
        }
      } catch (e) {
        console.error('Error loading projects from Supabase:', e);
      }
    }
    const projects = storage.getAll<Project>(COLLECTION);
    set({ projects });
  },

  addProject: async (data) => {
    const { user, isGuest } = useAuthStore.getState();
    const project: Project = { ...data, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('projects')
          .insert(mapProjectToDB(project, user.id));
        if (error) throw error;
      } catch (e) {
        console.error('Error saving project to Supabase:', e);
        throw e;
      }
    } else {
      storage.create(COLLECTION, project);
    }
    set((s) => ({ projects: [...s.projects, project] }));
  },

  updateProject: async (id, updates) => {
    const { user, isGuest } = useAuthStore.getState();
    const u = { ...updates, updatedAt: new Date().toISOString() };
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
        if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.technologies !== undefined) dbUpdates.technologies = updates.technologies;
        if (updates.githubUrl !== undefined) dbUpdates.github_url = updates.githubUrl || null;
        dbUpdates.updated_at = u.updatedAt;

        const { error } = await supabase!
          .from('projects')
          .update(dbUpdates)
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error updating project in Supabase:', e);
        throw e;
      }
    } else {
      storage.update<Project>(COLLECTION, id, u);
    }
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...u } : p)) }));
  },

  deleteProject: async (id) => {
    const { user, isGuest } = useAuthStore.getState();
    
    if (isSupabaseConfigured && !isGuest && user) {
      try {
        const { error } = await supabase!
          .from('projects')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Error deleting project in Supabase:', e);
        throw e;
      }
    } else {
      storage.remove<Project>(COLLECTION, id);
    }
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },
}));
