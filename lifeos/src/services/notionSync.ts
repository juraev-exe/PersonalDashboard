// ============================================
// LifeOS — Notion ↔ LifeOS Mapping
// ============================================
// Notion databases have user-defined property names, so nothing here assumes a
// fixed schema: properties are located by Notion *type* first, then narrowed by
// a name hint. Anything we cannot find falls back to a sensible default rather
// than failing the whole sync.

import type { Task, Habit } from '../types';
import { TaskStatus, TaskPriority, TaskCategory } from '../types';
import {
  queryNotionDatabase,
  getNotionPage,
  updateNotionPage,
  type NotionPage,
} from './notionService';

type NotionProp = { type: string; [key: string]: any };

// --- Property lookup helpers ------------------------------------------------

/** Concatenate Notion rich-text / title arrays into a plain string. */
function plainText(rich: any): string {
  if (!Array.isArray(rich)) return '';
  return rich.map((r) => r?.plain_text ?? '').join('').trim();
}

/** All [name, prop] pairs of a given Notion property type. */
function propsOfType(page: NotionPage, ...types: string[]): [string, NotionProp][] {
  return Object.entries(page.properties ?? {}).filter(([, p]) =>
    types.includes((p as NotionProp)?.type)
  ) as [string, NotionProp][];
}

/**
 * Pick the property of `types` whose name best matches `nameHint`.
 * Falls back to the first property of that type so unnamed schemas still work.
 */
function pickProp(
  page: NotionPage,
  types: string[],
  nameHint?: RegExp
): NotionProp | undefined {
  const candidates = propsOfType(page, ...types);
  if (candidates.length === 0) return undefined;
  if (nameHint) {
    const named = candidates.find(([name]) => nameHint.test(name));
    if (named) return named[1];
  }
  return candidates[0][1];
}

/** Read a select/status/checkbox property down to a comparable string. */
function readChoice(prop: NotionProp | undefined): string | null {
  if (!prop) return null;
  switch (prop.type) {
    case 'status':
      return prop.status?.name ?? null;
    case 'select':
      return prop.select?.name ?? null;
    case 'multi_select':
      return prop.multi_select?.[0]?.name ?? null;
    case 'checkbox':
      return prop.checkbox ? 'done' : 'todo';
    default:
      return null;
  }
}

// --- Value mapping ----------------------------------------------------------

export function toTaskStatus(value: string | null): TaskStatus {
  if (!value) return TaskStatus.TODO;
  const label = value.trim();
  // Checked first: Notion's built-in Status property defaults to "Not started",
  // which would otherwise match the "started" keyword below. Same for "Not done".
  if (/^not\b/i.test(label)) return TaskStatus.TODO;
  if (/done|complete|finished|closed/i.test(label)) return TaskStatus.COMPLETED;
  if (/progress|doing|active|started|current/i.test(label)) return TaskStatus.IN_PROGRESS;
  return TaskStatus.TODO;
}

export function toTaskPriority(value: string | null): TaskPriority {
  if (!value) return TaskPriority.MEDIUM;
  if (/urgent|critical|highest|p0/i.test(value)) return TaskPriority.URGENT;
  if (/high|p1/i.test(value)) return TaskPriority.HIGH;
  if (/low|minor|p3/i.test(value)) return TaskPriority.LOW;
  return TaskPriority.MEDIUM;
}

export function toTaskCategory(value: string | null): TaskCategory {
  if (!value) return TaskCategory.PERSONAL;
  const match = Object.values(TaskCategory).find(
    (c) => c.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? TaskCategory.PERSONAL;
}

/** LifeOS status → the value to write back into Notion for a given property type. */
function statusToNotionValue(propType: string, status: TaskStatus): unknown {
  const done = status === TaskStatus.COMPLETED;
  switch (propType) {
    case 'checkbox':
      return { checkbox: done };
    case 'status':
      return { status: { name: done ? 'Done' : status === TaskStatus.IN_PROGRESS ? 'In progress' : 'Not started' } };
    case 'select':
      return { select: { name: done ? 'Done' : status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'To Do' } };
    default:
      return null;
  }
}

// --- Page → LifeOS entities -------------------------------------------------

const STATUS_HINT = /status|state|done|complete/i;
const DUE_HINT = /due|deadline|when|date/i;
const PRIORITY_HINT = /priority|importance|urgency/i;
const CATEGORY_HINT = /category|type|area|tag|project/i;

/** A Notion page mapped onto LifeOS task fields (no id/createdAt — the store owns those). */
export type NotionTaskDraft = Omit<Task, 'id' | 'createdAt'> & { notionId: string };

export function pageToTask(page: NotionPage): NotionTaskDraft | null {
  const titleProp = pickProp(page, ['title']);
  const title = plainText(titleProp?.title);
  // A page with no title is almost always an empty row — skip it.
  if (!title) return null;

  const status = toTaskStatus(
    readChoice(pickProp(page, ['status', 'select', 'checkbox'], STATUS_HINT))
  );
  const dueProp = pickProp(page, ['date'], DUE_HINT);
  const descProp = pickProp(page, ['rich_text'], /description|notes|summary|details/i);

  return {
    title,
    description: plainText(descProp?.rich_text),
    status,
    priority: toTaskPriority(readChoice(pickProp(page, ['select', 'status'], PRIORITY_HINT))),
    category: toTaskCategory(
      readChoice(pickProp(page, ['select', 'multi_select'], CATEGORY_HINT))
    ),
    dueDate: dueProp?.date?.start || undefined,
    recurring: false,
    completedAt: status === TaskStatus.COMPLETED ? new Date().toISOString() : undefined,
    notionId: page.id,
  };
}

export type NotionHabitDraft = Omit<Habit, 'id' | 'createdAt'> & { notionId: string };

export function pageToHabit(page: NotionPage): NotionHabitDraft | null {
  const titleProp = pickProp(page, ['title']);
  const name = plainText(titleProp?.title);
  if (!name) return null;

  const frequencyRaw = readChoice(pickProp(page, ['select', 'status'], /frequency|cadence|repeat/i));
  const targetProp = pickProp(page, ['number'], /target|goal|times|count/i);

  return {
    name,
    icon: 'Activity',
    frequency: frequencyRaw && /week/i.test(frequencyRaw) ? 'weekly' : 'daily',
    dailyTarget: Math.max(1, Math.round(targetProp?.number ?? 1)),
    color: '#3fb950',
    archived: page.archived === true,
    notionId: page.id,
  };
}

// --- Public sync API --------------------------------------------------------

/** Fetch and map every task row from the configured Notion tasks database. */
export async function fetchNotionTasks(databaseId: string): Promise<NotionTaskDraft[]> {
  const pages = await queryNotionDatabase(databaseId);
  return pages
    .filter((p) => !p.archived)
    .map(pageToTask)
    .filter((t): t is NotionTaskDraft => t !== null);
}

/** Fetch and map every habit row from the configured Notion habits database. */
export async function fetchNotionHabits(databaseId: string): Promise<NotionHabitDraft[]> {
  const pages = await queryNotionDatabase(databaseId);
  return pages
    .filter((p) => !p.archived)
    .map(pageToHabit)
    .filter((h): h is NotionHabitDraft => h !== null);
}

/**
 * Push a status change back to Notion. Reads the page first so we write to
 * whichever property (status / select / checkbox) that database actually uses.
 */
export async function pushTaskStatusToNotion(
  notionId: string,
  status: TaskStatus
): Promise<void> {
  const page = await getNotionPage(notionId);

  const entry = Object.entries(page.properties ?? {}).find(([name, p]) => {
    const prop = p as NotionProp;
    if (!['status', 'select', 'checkbox'].includes(prop.type)) return false;
    return prop.type === 'status' || prop.type === 'checkbox' || STATUS_HINT.test(name);
  });

  if (!entry) {
    throw new Error('No status property found on the Notion page');
  }

  const [propName, prop] = entry as [string, NotionProp];
  const value = statusToNotionValue(prop.type, status);
  if (!value) throw new Error(`Cannot write status to a "${prop.type}" property`);

  await updateNotionPage(notionId, { [propName]: value });
}
