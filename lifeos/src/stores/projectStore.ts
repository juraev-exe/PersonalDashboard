// ============================================
// LifeOS — Project Store
// ============================================

import { create } from 'zustand';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import * as storage from '../services/storage';
import { v4 as uuid } from 'uuid';

const COLLECTION = 'projects';

interface ProjectState {
  projects: Project[];
  loadProjects: () => void;
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],

  loadProjects: () => {
    set({ projects: storage.getAll<Project>(COLLECTION) });
  },

  addProject: (data) => {
    const project: Project = { ...data, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    storage.create(COLLECTION, project);
    set((s) => ({ projects: [...s.projects, project] }));
  },

  updateProject: (id, updates) => {
    const u = { ...updates, updatedAt: new Date().toISOString() };
    storage.update<Project>(COLLECTION, id, u);
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...u } : p)) }));
  },

  deleteProject: (id) => {
    storage.remove<Project>(COLLECTION, id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },
}));
