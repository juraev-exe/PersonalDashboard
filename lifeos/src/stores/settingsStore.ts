// ============================================
// LifeOS — Settings Store (Theme + App Config)
// ============================================

import { create } from 'zustand';
import type { AppSettings, PomodoroPreset } from '../types';
import { getValue, setValue } from '../services/storage';
import { pomodoroPresets } from '../data/seed';

interface SettingsState extends AppSettings {
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setPomodoroPreset: (preset: PomodoroPreset) => void;
  setAutoStartBreaks: (v: boolean) => void;
  setAutoStartFocus: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setIntegrationKey: (key: keyof AppSettings, value: string) => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  pomodoroPreset: pomodoroPresets[0],
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  notificationsEnabled: true,
  sidebarCollapsed: false,
  notionDatabaseId: '',
  notionParentType: 'database',
};

const loadSettings = (): AppSettings => getValue<AppSettings>('settings', defaultSettings);

export const useSettingsStore = create<SettingsState>((set) => ({
  ...loadSettings(),

  setTheme: (theme) => set((s) => {
    const next = { ...s, theme };
    setValue('settings', next);
    document.documentElement.setAttribute('data-theme', theme);
    return { theme };
  }),

  toggleTheme: () => set((s) => {
    const theme = s.theme === 'dark' ? 'light' : 'dark';
    const next = { ...s, theme };
    setValue('settings', next);
    document.documentElement.setAttribute('data-theme', theme);
    return { theme };
  }),

  setPomodoroPreset: (pomodoroPreset) => set((s) => {
    const next = { ...s, pomodoroPreset };
    setValue('settings', next);
    return { pomodoroPreset };
  }),

  setAutoStartBreaks: (autoStartBreaks) => set((s) => {
    const next = { ...s, autoStartBreaks };
    setValue('settings', next);
    return { autoStartBreaks };
  }),

  setAutoStartFocus: (autoStartFocus) => set((s) => {
    const next = { ...s, autoStartFocus };
    setValue('settings', next);
    return { autoStartFocus };
  }),

  setSoundEnabled: (soundEnabled) => set((s) => {
    const next = { ...s, soundEnabled };
    setValue('settings', next);
    return { soundEnabled };
  }),

  setNotificationsEnabled: (notificationsEnabled) => set((s) => {
    const next = { ...s, notificationsEnabled };
    setValue('settings', next);
    return { notificationsEnabled };
  }),

  setSidebarCollapsed: (sidebarCollapsed) => set((s) => {
    const next = { ...s, sidebarCollapsed };
    setValue('settings', next);
    return { sidebarCollapsed };
  }),

  toggleSidebar: () => set((s) => {
    const sidebarCollapsed = !s.sidebarCollapsed;
    const next = { ...s, sidebarCollapsed };
    setValue('settings', next);
    return { sidebarCollapsed };
  }),

  setIntegrationKey: (key, value) => set((s) => {
    const next = { ...s, [key]: value };
    setValue('settings', next);
    return { [key]: value } as Partial<SettingsState>;
  }),
}));
