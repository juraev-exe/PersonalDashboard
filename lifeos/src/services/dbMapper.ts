// ============================================
// LifeOS — Database Mapper Service
// ============================================

import type {
  Task,
  PomodoroSession,
  Habit,
  HabitLog,
  PrayerLog,
  Project,
  Note,
  CalendarEvent,
  Achievement,
  JournalEntry,
  Goal
} from '../types';

// --- Task Mappers ---
export function mapTaskFromDB(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date || undefined,
    recurring: row.recurring,
    recurringPattern: row.recurring_pattern || undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at || undefined,
    notionId: row.notion_id || undefined,
  };
}

export function mapTaskToDB(task: Task, userId: string): any {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    due_date: task.dueDate || null,
    recurring: task.recurring,
    recurring_pattern: task.recurringPattern || null,
    created_at: task.createdAt,
    completed_at: task.completedAt || null,
    notion_id: task.notionId || null,
  };
}

// --- Pomodoro Mappers ---
export function mapPomodoroFromDB(row: any): PomodoroSession {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    category: row.category,
    notes: row.notes,
    completed: row.completed,
  };
}

export function mapPomodoroToDB(session: PomodoroSession, userId: string): any {
  return {
    id: session.id,
    user_id: userId,
    date: session.date,
    start_time: session.startTime,
    end_time: session.endTime,
    duration: session.duration,
    category: session.category,
    notes: session.notes,
    completed: session.completed,
  };
}

// --- Habit Mappers ---
export function mapHabitFromDB(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    frequency: row.frequency,
    dailyTarget: row.daily_target,
    color: row.color,
    createdAt: row.created_at,
    archived: row.archived,
    notionId: row.notion_id || undefined,
  };
}

export function mapHabitToDB(habit: Habit, userId: string): any {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    icon: habit.icon,
    frequency: habit.frequency,
    daily_target: habit.dailyTarget,
    color: habit.color,
    created_at: habit.createdAt,
    archived: habit.archived,
    notion_id: habit.notionId || null,
  };
}

// --- Habit Log Mappers ---
export function mapHabitLogFromDB(row: any): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed,
    value: row.value,
  };
}

export function mapHabitLogToDB(log: HabitLog): any {
  return {
    id: log.id,
    habit_id: log.habitId,
    date: log.date,
    completed: log.completed,
    value: log.value,
  };
}

// --- Prayer Log Mappers ---
export function mapPrayerLogFromDB(row: any): PrayerLog {
  return {
    id: row.id,
    date: row.date,
    prayer: row.prayer,
    completed: row.completed,
    time: row.time || undefined,
  };
}

export function mapPrayerLogToDB(log: PrayerLog, userId: string): any {
  return {
    id: log.id,
    user_id: userId,
    date: log.date,
    prayer: log.prayer,
    completed: log.completed,
    time: log.time || null,
  };
}

// --- Project Mappers ---
export function mapProjectFromDB(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    progress: row.progress,
    deadline: row.deadline || undefined,
    status: row.status,
    technologies: row.technologies,
    githubUrl: row.github_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectToDB(project: Project, userId: string): any {
  return {
    id: project.id,
    user_id: userId,
    title: project.title,
    description: project.description,
    progress: project.progress,
    deadline: project.deadline || null,
    status: project.status,
    technologies: project.technologies,
    github_url: project.githubUrl || null,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

// --- Note Mappers ---
export function mapNoteFromDB(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags,
    pinned: row.pinned,
    archived: row.archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNoteToDB(note: Note, userId: string): any {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    tags: note.tags,
    pinned: note.pinned,
    archived: note.archived,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
}

// --- Calendar Event Mappers ---
export function mapCalendarEventFromDB(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    date: row.date,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    type: row.type,
    color: row.color,
  };
}

export function mapCalendarEventToDB(event: CalendarEvent, userId: string): any {
  return {
    id: event.id,
    user_id: userId,
    title: event.title,
    description: event.description || null,
    date: event.date,
    start_time: event.startTime || null,
    end_time: event.endTime || null,
    type: event.type,
    color: event.color,
  };
}

// --- Journal Mappers ---
export function mapJournalFromDB(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    content: row.content,
    mood: row.mood || undefined,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapJournalToDB(entry: JournalEntry, userId: string): any {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    content: entry.content,
    mood: entry.mood || null,
    tags: entry.tags,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

// --- Goal Mappers ---
export function mapGoalFromDB(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit,
    deadline: row.deadline || undefined,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGoalToDB(goal: Goal, userId: string): any {
  return {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    description: goal.description,
    target_value: goal.targetValue,
    current_value: goal.currentValue,
    unit: goal.unit,
    deadline: goal.deadline || null,
    category: goal.category,
    status: goal.status,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
  };
}

