// ============================================
// LifeOS — Type Definitions
// ============================================

// --- Enums ---

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskCategory {
  STUDY = 'Study',
  UNIVERSITY = 'University',
  CYBERSECURITY = 'Cybersecurity',
  PROGRAMMING = 'Programming',
  BUSINESS = 'Business',
  PERSONAL = 'Personal',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum PomodoroCategory {
  CYBERSECURITY = 'Cybersecurity',
  PROGRAMMING = 'Programming',
  UNIVERSITY = 'University',
  IELTS = 'IELTS',
  READING = 'Reading',
  RESEARCH = 'Research',
  PERSONAL = 'Personal',
}

export enum PrayerName {
  FAJR = 'Fajr',
  DHUHR = 'Dhuhr',
  ASR = 'Asr',
  MAGHRIB = 'Maghrib',
  ISHA = 'Isha',
}

export enum TimerMode {
  FOCUS = 'focus',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
}

// --- Core Interfaces ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXp: number;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  category: PomodoroCategory;
  notes: string;
  completed: boolean;
}

export interface PomodoroPreset {
  label: string;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  dailyTarget: number;
  color: string;
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value: number;
}

export interface PrayerLog {
  id: string;
  date: string;
  prayer: PrayerName;
  completed: boolean;
  time?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  deadline?: string;
  status: ProjectStatus;
  technologies: string[];
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  content: string;
  mood?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  category: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'task' | 'exam' | 'deadline' | 'event' | 'study_plan';
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
  unlockedAt?: string;
}

export interface UserStatistics {
  totalFocusHours: number;
  totalPomodoros: number;
  totalTasksCompleted: number;
  totalHabitsCompleted: number;
  totalPrayersCompleted: number;
  longestStreak: number;
  currentStreak: number;
  mostProductiveDay: string;
  mostProductiveCategory: string;
}

export interface DayActivity {
  date: string;
  focusMinutes: number;
  tasksCompleted: number;
  habitsCompleted: number;
  prayersCompleted: number;
  pomodoroSessions: number;
  productivityScore: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  pomodoroPreset: PomodoroPreset;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  sidebarCollapsed: boolean;
  githubToken?: string;
  wakatimeApiKey?: string;
  notionApiKey?: string;
  googleCalendarToken?: string;
  googleUserEmail?: string;
  notionDatabaseId?: string;
  notionParentType?: 'database' | 'page';
  spotifyPlaylistUrl?: string;
}

export interface Quote {
  text: string;
  author: string;
}
