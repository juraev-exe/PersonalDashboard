// ============================================
// LifeOS — Microsoft To Do Graph API Service
// ============================================

import { useSettingsStore } from '../stores/settingsStore';

/**
 * All Microsoft Graph requests go through the Vite/Vercel proxy at /api/microsoft
 * which routes to https://graph.microsoft.com/v1.0
 */
const MS_GRAPH_BASE = '/api/microsoft';

export interface MicrosoftTodoList {
  id: string;
  displayName: string;
  isOwner: boolean;
  isShared: boolean;
  wellknownListName?: string;
}

export interface MicrosoftTodoTask {
  id: string;
  title: string;
  status: 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred';
  importance: 'low' | 'normal' | 'high';
  body?: {
    content: string;
    contentType: 'text' | 'html';
  };
  dueDateTime?: {
    dateTime: string;
    timeZone: string;
  };
  completedDateTime?: {
    dateTime: string;
    timeZone: string;
  };
  createdDateTime: string;
  lastModifiedDateTime: string;
}

const getHeaders = () => {
  const token = useSettingsStore.getState().microsoftAccessToken;
  if (!token) throw new Error('Microsoft Access Token is not configured. Add it in Settings.');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Fetch all task lists from Microsoft To Do
 */
export const fetchTodoLists = async (): Promise<MicrosoftTodoList[]> => {
  const res = await fetch(`${MS_GRAPH_BASE}/me/todo/lists`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Microsoft Graph API error: ${res.status}`);
  }

  const data = await res.json();
  return (data.value || []) as MicrosoftTodoList[];
};

/**
 * Fetch tasks from a specific list in Microsoft To Do
 */
export const fetchTasksFromList = async (listId: string): Promise<MicrosoftTodoTask[]> => {
  if (!listId) throw new Error('Microsoft To Do List ID is required');

  const res = await fetch(`${MS_GRAPH_BASE}/me/todo/lists/${listId}/tasks?$top=100`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch tasks from list: ${res.status}`);
  }

  const data = await res.json();
  return (data.value || []) as MicrosoftTodoTask[];
};

/**
 * Create a new task in Microsoft To Do
 */
export const createTaskInList = async (
  listId: string,
  task: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'normal' | 'high';
  }
): Promise<MicrosoftTodoTask> => {
  if (!listId) throw new Error('Microsoft To Do List ID is required');

  const body: Record<string, unknown> = {
    title: task.title,
    importance: task.priority || 'normal',
  };

  if (task.description) {
    body.body = {
      content: task.description,
      contentType: 'text',
    };
  }

  if (task.dueDate) {
    body.dueDateTime = {
      dateTime: `${task.dueDate}T00:00:00`,
      timeZone: 'UTC',
    };
  }

  const res = await fetch(`${MS_GRAPH_BASE}/me/todo/lists/${listId}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create task in Microsoft To Do: ${res.status}`);
  }

  return (await res.json()) as MicrosoftTodoTask;
};

/**
 * Update an existing task in Microsoft To Do (e.g. mark complete or change title)
 */
export const updateTaskInList = async (
  listId: string,
  taskId: string,
  updates: Partial<{
    title: string;
    status: 'notStarted' | 'inProgress' | 'completed';
    importance: 'low' | 'normal' | 'high';
    dueDateTime?: { dateTime: string; timeZone: string };
  }>
): Promise<MicrosoftTodoTask> => {
  if (!listId || !taskId) throw new Error('List ID and Task ID are required');

  const res = await fetch(`${MS_GRAPH_BASE}/me/todo/lists/${listId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update Microsoft task: ${res.status}`);
  }

  return (await res.json()) as MicrosoftTodoTask;
};

/**
 * Delete a task from Microsoft To Do
 */
export const deleteTaskInList = async (listId: string, taskId: string): Promise<void> => {
  if (!listId || !taskId) return;

  const res = await fetch(`${MS_GRAPH_BASE}/me/todo/lists/${listId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete Microsoft task: ${res.status}`);
  }
};

/**
 * Test Microsoft connection validity
 */
export const testMicrosoftConnection = async (): Promise<{ displayName: string; email: string }> => {
  const res = await fetch(`${MS_GRAPH_BASE}/me`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Microsoft connection check failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    displayName: data.displayName || 'Microsoft User',
    email: data.mail || data.userPrincipalName || '',
  };
};
