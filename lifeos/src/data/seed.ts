// ============================================
// LifeOS — Seed Data & Constants
// ============================================

import {
  type Quote,
  type Achievement,
  type Habit,
  type Task,
  type Project,
  type Note,
  type PomodoroPreset,
  type PomodoroSession,
  type HabitLog,
  type PrayerLog,
  type CalendarEvent,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  ProjectStatus,
  PomodoroCategory,
  PrayerName,
} from '../types';
import { v4 as uuid } from 'uuid';
import { format, subDays, subHours } from 'date-fns';

// --- Motivational Quotes ---
export const quotes: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
];

// --- Pomodoro Presets ---
export const pomodoroPresets: PomodoroPreset[] = [
  { label: '25/5', focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 },
  { label: '50/10', focusMinutes: 50, breakMinutes: 10, longBreakMinutes: 20, sessionsBeforeLongBreak: 4 },
  { label: '90/20', focusMinutes: 90, breakMinutes: 20, longBreakMinutes: 30, sessionsBeforeLongBreak: 2 },
];

// --- Achievement Definitions ---
export const achievementDefinitions: Achievement[] = [
  { id: 'first_pomodoro', title: 'First Focus', description: 'Complete your first Pomodoro session', icon: 'target', xpReward: 50, condition: 'pomodoros >= 1' },
  { id: 'ten_pomodoros', title: 'Getting Focused', description: 'Complete 10 Pomodoro sessions', icon: 'flame', xpReward: 100, condition: 'pomodoros >= 10' },
  { id: 'fifty_pomodoros', title: 'Focus Master', description: 'Complete 50 Pomodoro sessions', icon: 'zap', xpReward: 250, condition: 'pomodoros >= 50' },
  { id: 'hundred_pomodoros', title: 'Unstoppable', description: 'Complete 100 Pomodoro sessions', icon: 'award', xpReward: 500, condition: 'pomodoros >= 100' },
  { id: 'first_task', title: 'Task Starter', description: 'Complete your first task', icon: 'check-square', xpReward: 25, condition: 'tasks >= 1' },
  { id: 'ten_tasks', title: 'Productive', description: 'Complete 10 tasks', icon: 'list', xpReward: 100, condition: 'tasks >= 10' },
  { id: 'fifty_tasks', title: 'Task Machine', description: 'Complete 50 tasks', icon: 'trophy', xpReward: 250, condition: 'tasks >= 50' },
  { id: 'hundred_tasks', title: 'Centurion', description: 'Complete 100 tasks', icon: 'award', xpReward: 500, condition: 'tasks >= 100' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'flame', xpReward: 150, condition: 'streak >= 7' },
  { id: 'streak_30', title: 'Monthly Champion', description: 'Maintain a 30-day streak', icon: 'award', xpReward: 500, condition: 'streak >= 30' },
  { id: 'streak_100', title: 'Legend', description: 'Maintain a 100-day streak', icon: 'star', xpReward: 1000, condition: 'streak >= 100' },
  { id: 'hundred_hours', title: 'Century Club', description: 'Accumulate 100 hours of focus time', icon: 'clock', xpReward: 500, condition: 'focusHours >= 100' },
  { id: 'all_prayers_day', title: 'Devoted', description: 'Complete all 5 prayers in a day', icon: 'moon', xpReward: 75, condition: 'dailyPrayers >= 5' },
  { id: 'all_habits_day', title: 'Disciplined', description: 'Complete all habits in a day', icon: 'activity', xpReward: 75, condition: 'dailyHabits >= all' },
];

// --- Default Habits ---
export const defaultHabits: Habit[] = [
  { id: uuid(), name: 'Read', icon: 'BookOpen', frequency: 'daily', dailyTarget: 1, color: '#6366f1', createdAt: new Date().toISOString(), archived: false },
  { id: uuid(), name: 'Exercise', icon: 'Activity', frequency: 'daily', dailyTarget: 1, color: '#f43f5e', createdAt: new Date().toISOString(), archived: false },
  { id: uuid(), name: 'Water', icon: 'GlassWater', frequency: 'daily', dailyTarget: 8, color: '#06b6d4', createdAt: new Date().toISOString(), archived: false },
  { id: uuid(), name: 'Sleep 8h', icon: 'Moon', frequency: 'daily', dailyTarget: 1, color: '#8b5cf6', createdAt: new Date().toISOString(), archived: false },
  { id: uuid(), name: 'Study', icon: 'Terminal', frequency: 'daily', dailyTarget: 1, color: '#10b981', createdAt: new Date().toISOString(), archived: false },
];

// --- Sample Tasks ---
export function createSampleTasks(): Task[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(subDays(new Date(), -1), 'yyyy-MM-dd');
  const nextWeek = format(subDays(new Date(), -7), 'yyyy-MM-dd');
  return [
    { id: uuid(), title: 'Complete React Router setup', description: 'Set up all routes for LifeOS dashboard', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, category: TaskCategory.PROGRAMMING, dueDate: today, recurring: false, createdAt: subDays(new Date(), 2).toISOString() },
    { id: uuid(), title: 'Study Nmap fundamentals', description: 'Learn Nmap scanning techniques and flags', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, category: TaskCategory.CYBERSECURITY, dueDate: tomorrow, recurring: false, createdAt: subDays(new Date(), 1).toISOString() },
    { id: uuid(), title: 'IELTS Writing Task 2 practice', description: 'Write an essay on technology and education', status: TaskStatus.TODO, priority: TaskPriority.HIGH, category: TaskCategory.STUDY, dueDate: today, recurring: true, recurringPattern: 'daily', createdAt: subDays(new Date(), 3).toISOString() },
    { id: uuid(), title: 'Submit university assignment', description: 'Data structures assignment #3', status: TaskStatus.TODO, priority: TaskPriority.URGENT, category: TaskCategory.UNIVERSITY, dueDate: tomorrow, recurring: false, createdAt: subDays(new Date(), 5).toISOString() },
    { id: uuid(), title: 'Review Python OOP concepts', description: 'Go through class inheritance and polymorphism', status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, category: TaskCategory.PROGRAMMING, recurring: false, createdAt: subDays(new Date(), 7).toISOString(), completedAt: subDays(new Date(), 1).toISOString() },
    { id: uuid(), title: 'Set up home lab network', description: 'Configure VirtualBox network for pentesting lab', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, category: TaskCategory.CYBERSECURITY, dueDate: nextWeek, recurring: false, createdAt: subDays(new Date(), 4).toISOString() },
    { id: uuid(), title: 'Read 30 pages of "Clean Code"', description: 'Chapter 4-5 on comments and formatting', status: TaskStatus.TODO, priority: TaskPriority.LOW, category: TaskCategory.STUDY, dueDate: today, recurring: true, recurringPattern: 'daily', createdAt: subDays(new Date(), 2).toISOString() },
    { id: uuid(), title: 'Plan weekly meal prep', description: 'Prepare healthy meals for the week', status: TaskStatus.TODO, priority: TaskPriority.LOW, category: TaskCategory.PERSONAL, dueDate: nextWeek, recurring: true, recurringPattern: 'weekly', createdAt: subDays(new Date(), 1).toISOString() },
  ];
}

// --- Sample Projects ---
export function createSampleProjects(): Project[] {
  return [
    { id: uuid(), title: 'LifeOS Dashboard', description: 'Personal productivity dashboard with study tracking, pomodoro, habits, and analytics', progress: 35, deadline: format(subDays(new Date(), -30), 'yyyy-MM-dd'), status: ProjectStatus.ACTIVE, technologies: ['React', 'TypeScript', 'Tailwind', 'Vite'], githubUrl: 'https://github.com/user/lifeos', createdAt: subDays(new Date(), 14).toISOString(), updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'Vulnerability Scanner', description: 'Custom network vulnerability scanner built with Python', progress: 60, deadline: format(subDays(new Date(), -21), 'yyyy-MM-dd'), status: ProjectStatus.ACTIVE, technologies: ['Python', 'Scapy', 'Nmap'], githubUrl: 'https://github.com/user/vulnscan', createdAt: subDays(new Date(), 30).toISOString(), updatedAt: subDays(new Date(), 2).toISOString() },
    { id: uuid(), title: 'Portfolio Website', description: 'Personal portfolio with blog and project showcase', progress: 90, status: ProjectStatus.ACTIVE, technologies: ['Next.js', 'MDX', 'Tailwind'], createdAt: subDays(new Date(), 60).toISOString(), updatedAt: subDays(new Date(), 5).toISOString() },
    { id: uuid(), title: 'CLI Task Manager', description: 'Command-line task manager with Rust', progress: 100, status: ProjectStatus.COMPLETED, technologies: ['Rust', 'Clap'], createdAt: subDays(new Date(), 90).toISOString(), updatedAt: subDays(new Date(), 45).toISOString() },
  ];
}

// --- Sample Notes ---
export function createSampleNotes(): Note[] {
  return [
    { id: uuid(), title: 'Nmap Cheatsheet', content: '# Nmap Commands\n\n## Basic Scans\n- `nmap -sS target` — SYN scan\n- `nmap -sV target` — Version detection\n- `nmap -O target` — OS detection\n- `nmap -A target` — Aggressive scan\n\n## Port Ranges\n- `nmap -p 1-1000 target`\n- `nmap -p- target` — All 65535 ports\n\n## Output\n- `nmap -oN output.txt target`\n- `nmap -oX output.xml target`', tags: ['cybersecurity', 'tools', 'reference'], pinned: true, archived: false, createdAt: subDays(new Date(), 10).toISOString(), updatedAt: subDays(new Date(), 2).toISOString() },
    { id: uuid(), title: 'React Design Patterns', content: '# React Patterns\n\n## Compound Components\nUse React.Children and context to share state.\n\n## Render Props\nShare logic via function-as-child.\n\n## Custom Hooks\nExtract reusable stateful logic.', tags: ['programming', 'react', 'patterns'], pinned: false, archived: false, createdAt: subDays(new Date(), 7).toISOString(), updatedAt: subDays(new Date(), 3).toISOString() },
    { id: uuid(), title: 'IELTS Writing Tips', content: '# Writing Task 2 Tips\n\n1. **Introduction**: Paraphrase the question, state your position\n2. **Body 1**: Main argument with example\n3. **Body 2**: Supporting argument with evidence\n4. **Conclusion**: Restate position, summarize\n\n## Key phrases\n- "It is widely believed that..."\n- "From my perspective..."\n- "In conclusion..."', tags: ['ielts', 'study', 'writing'], pinned: true, archived: false, createdAt: subDays(new Date(), 5).toISOString(), updatedAt: subDays(new Date(), 1).toISOString() },
  ];
}

// --- Sample Pomodoro Sessions (last 30 days) ---
export function createSamplePomodoros(): PomodoroSession[] {
  const sessions: PomodoroSession[] = [];
  const categories = Object.values(PomodoroCategory);
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    const sessionsPerDay = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < sessionsPerDay; j++) {
      const startHour = 8 + Math.floor(Math.random() * 12);
      const duration = [25, 50, 25, 25, 50][Math.floor(Math.random() * 5)];
      const start = new Date(date);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      sessions.push({
        id: uuid(),
        date: format(date, 'yyyy-MM-dd'),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration,
        category: categories[Math.floor(Math.random() * categories.length)],
        notes: '',
        completed: true,
      });
    }
  }
  return sessions;
}

// --- Sample Prayer Logs (last 14 days) ---
export function createSamplePrayerLogs(): PrayerLog[] {
  const logs: PrayerLog[] = [];
  const prayers = Object.values(PrayerName);
  for (let i = 0; i < 14; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    prayers.forEach(prayer => {
      const completed = Math.random() > 0.15; // 85% completion rate
      logs.push({ id: uuid(), date, prayer, completed });
    });
  }
  return logs;
}

// --- Sample Habit Logs (last 14 days) ---
export function createSampleHabitLogs(habitIds: string[]): HabitLog[] {
  const logs: HabitLog[] = [];
  for (let i = 0; i < 14; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    habitIds.forEach(habitId => {
      const completed = Math.random() > 0.25; // 75% completion rate
      logs.push({ id: uuid(), habitId, date, completed, value: completed ? 1 : 0 });
    });
  }
  return logs;
}

// --- Sample Calendar Events ---
export function createSampleCalendarEvents(): CalendarEvent[] {
  const today = new Date();
  return [
    { id: uuid(), title: 'Data Structures Exam', description: 'Final exam for DSA course', date: format(subDays(today, -3), 'yyyy-MM-dd'), startTime: '09:00', endTime: '11:00', type: 'exam', color: '#ef4444' },
    { id: uuid(), title: 'Study Group Meeting', description: 'Weekly study group for cybersecurity', date: format(subDays(today, -1), 'yyyy-MM-dd'), startTime: '14:00', endTime: '16:00', type: 'event', color: '#6366f1' },
    { id: uuid(), title: 'Project Deadline: Portfolio', description: 'Submit portfolio website v2', date: format(subDays(today, -7), 'yyyy-MM-dd'), type: 'deadline', color: '#f59e0b' },
    { id: uuid(), title: 'IELTS Mock Test', description: 'Full practice test at home', date: format(subDays(today, -5), 'yyyy-MM-dd'), startTime: '08:00', endTime: '12:00', type: 'exam', color: '#ef4444' },
    { id: uuid(), title: 'Python Study Plan', description: 'Advanced Python topics - decorators, generators', date: format(today, 'yyyy-MM-dd'), startTime: '10:00', endTime: '12:00', type: 'study_plan', color: '#10b981' },
  ];
}
