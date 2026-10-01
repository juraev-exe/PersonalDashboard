// ============================================
// LifeOS — Microsoft To Do ↔ LifeOS Sync Engine
// ============================================

import type { Task } from '../types';
import { TaskStatus, TaskPriority, TaskCategory } from '../types';
import {
  fetchTodoLists,
  fetchTasksFromList,
  createTaskInList,
  updateTaskInList,
  type MicrosoftTodoTask,
} from './microsoftTodoService';

export type MicrosoftTaskDraft = Omit<Task, 'id' | 'createdAt'> & {
  todoId: string;
  todoListId: string;
};

/**
 * Maps a Microsoft Graph To Do task into LifeOS Task structure
 */
export const mapMicrosoftTaskToLifeOS = (
  item: MicrosoftTodoTask,
  listId: string
): MicrosoftTaskDraft => {
  // Map Status
  const status =
    item.status === 'completed' ? TaskStatus.COMPLETED : TaskStatus.TODO;

  // Map Priority
  let priority = TaskPriority.MEDIUM;
  if (item.importance === 'high') priority = TaskPriority.HIGH;
  else if (item.importance === 'low') priority = TaskPriority.LOW;

  // Map Due Date (Microsoft returns UTC datetime e.g. "2026-09-30T00:00:00.0000000")
  let dueDate: string | undefined;
  if (item.dueDateTime?.dateTime) {
    dueDate = item.dueDateTime.dateTime.split('T')[0];
  }

  // Strip simple HTML tags from body if present
  let description = item.body?.content || '';
  if (description.includes('<') && description.includes('>')) {
    description = description.replace(/<[^>]*>/g, '').trim();
  }

  return {
    title: item.title || 'Untitled Task',
    description,
    status,
    priority,
    category: TaskCategory.PERSONAL,
    dueDate,
    recurring: false,
    completedAt: item.completedDateTime?.dateTime,
    todoId: item.id,
    todoListId: listId,
  };
};

/**
 * Fetch all tasks from a Microsoft To Do list.
 * If no listId is passed, automatically detects the default list.
 */
export const fetchMicrosoftTasks = async (
  specifiedListId?: string
): Promise<{ tasks: MicrosoftTaskDraft[]; listId: string; listName: string }> => {
  let listId = specifiedListId;
  let listName = 'Tasks';

  if (!listId) {
    const lists = await fetchTodoLists();
    if (!lists || lists.length === 0) {
      throw new Error('No task lists found in your Microsoft To Do account.');
    }
    // Look for default list first, otherwise pick the first list
    const defaultList =
      lists.find(
        (l) => l.wellknownListName === 'defaultList' || l.displayName.toLowerCase() === 'tasks'
      ) || lists[0];
    listId = defaultList.id;
    listName = defaultList.displayName;
  }

  const rawTasks = await fetchTasksFromList(listId);
  const tasks = rawTasks.map((t) => mapMicrosoftTaskToLifeOS(t, listId!));

  return { tasks, listId, listName };
};

/**
 * Export a local task to Microsoft To Do
 */
export const exportTaskToMicrosoft = async (
  listId: string,
  task: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
  }
): Promise<MicrosoftTodoTask> => {
  let importance: 'low' | 'normal' | 'high' = 'normal';
  if (task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT) {
    importance = 'high';
  } else if (task.priority === TaskPriority.LOW) {
    importance = 'low';
  }

  return await createTaskInList(listId, {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: importance,
  });
};

/**
 * Sync status update (e.g. completion) back to Microsoft To Do
 */
export const syncTaskStatusToMicrosoft = async (
  listId: string,
  taskId: string,
  status: TaskStatus
): Promise<void> => {
  const msStatus: 'completed' | 'notStarted' =
    status === TaskStatus.COMPLETED ? 'completed' : 'notStarted';

  await updateTaskInList(listId, taskId, {
    status: msStatus,
  });
};
