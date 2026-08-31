import { describe, it, expect } from 'vitest';
import { pageToTask, pageToHabit, toTaskStatus, toTaskPriority, toTaskCategory } from './notionSync';
import { TaskStatus, TaskPriority, TaskCategory } from '../types';
import type { NotionPage } from './notionService';

const page = (properties: Record<string, unknown>, id = 'page-1'): NotionPage =>
  ({ id, properties } as NotionPage);

const title = (text: string) => ({ type: 'title', title: [{ plain_text: text }] });

describe('value mapping', () => {
  it('maps Notion status names onto TaskStatus', () => {
    expect(toTaskStatus('Done')).toBe(TaskStatus.COMPLETED);
    expect(toTaskStatus('Completed')).toBe(TaskStatus.COMPLETED);
    expect(toTaskStatus('In progress')).toBe(TaskStatus.IN_PROGRESS);
    expect(toTaskStatus('Doing')).toBe(TaskStatus.IN_PROGRESS);
    expect(toTaskStatus(null)).toBe(TaskStatus.TODO);
  });

  it('does not read negated labels as progress or completion', () => {
    // Notion's built-in Status property ships with "Not started" as the default.
    expect(toTaskStatus('Not started')).toBe(TaskStatus.TODO);
    expect(toTaskStatus('not started')).toBe(TaskStatus.TODO);
    expect(toTaskStatus('Not done')).toBe(TaskStatus.TODO);
    expect(toTaskStatus('To do')).toBe(TaskStatus.TODO);
    expect(toTaskStatus('Backlog')).toBe(TaskStatus.TODO);
  });

  it('maps priority labels, including P-numbers', () => {
    expect(toTaskPriority('Urgent')).toBe(TaskPriority.URGENT);
    expect(toTaskPriority('P0')).toBe(TaskPriority.URGENT);
    expect(toTaskPriority('High')).toBe(TaskPriority.HIGH);
    expect(toTaskPriority('Low')).toBe(TaskPriority.LOW);
    expect(toTaskPriority('Anything else')).toBe(TaskPriority.MEDIUM);
    expect(toTaskPriority(null)).toBe(TaskPriority.MEDIUM);
  });

  it('matches categories case-insensitively and falls back to Personal', () => {
    expect(toTaskCategory('cybersecurity')).toBe(TaskCategory.CYBERSECURITY);
    expect(toTaskCategory('  Study ')).toBe(TaskCategory.STUDY);
    expect(toTaskCategory('Unmapped label')).toBe(TaskCategory.PERSONAL);
  });
});

describe('pageToTask', () => {
  it('reads a status-property database', () => {
    const task = pageToTask(
      page({
        Name: title('Write report'),
        Status: { type: 'status', status: { name: 'In progress' } },
        Priority: { type: 'select', select: { name: 'High' } },
        'Due date': { type: 'date', date: { start: '2026-09-01' } },
      })
    );

    expect(task).not.toBeNull();
    expect(task!.title).toBe('Write report');
    expect(task!.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task!.priority).toBe(TaskPriority.HIGH);
    expect(task!.dueDate).toBe('2026-09-01');
    expect(task!.notionId).toBe('page-1');
  });

  it('treats a ticked checkbox database as completed', () => {
    const task = pageToTask(
      page({
        Task: title('Buy milk'),
        Done: { type: 'checkbox', checkbox: true },
      })
    );

    expect(task!.status).toBe(TaskStatus.COMPLETED);
    expect(task!.completedAt).toBeTruthy();
  });

  it('works with arbitrary property names via type detection', () => {
    const task = pageToTask(
      page({
        'Что делать': title('Прочитать книгу'),
        Состояние: { type: 'status', status: { name: 'Done' } },
      })
    );

    expect(task!.title).toBe('Прочитать книгу');
    expect(task!.status).toBe(TaskStatus.COMPLETED);
  });

  it('concatenates split rich-text titles', () => {
    const task = pageToTask(
      page({
        Name: { type: 'title', title: [{ plain_text: 'Part one ' }, { plain_text: 'part two' }] },
      })
    );

    expect(task!.title).toBe('Part one part two');
  });

  it('skips rows with an empty title', () => {
    expect(pageToTask(page({ Name: title('   ') }))).toBeNull();
    expect(pageToTask(page({ Name: { type: 'title', title: [] } }))).toBeNull();
  });

  it('defaults cleanly when only a title exists', () => {
    const task = pageToTask(page({ Name: title('Bare row') }))!;

    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.category).toBe(TaskCategory.PERSONAL);
    expect(task.dueDate).toBeUndefined();
    expect(task.recurring).toBe(false);
  });
});

describe('pageToHabit', () => {
  it('reads frequency and target', () => {
    const habit = pageToHabit(
      page({
        Habit: title('Read 20 pages'),
        Frequency: { type: 'select', select: { name: 'Weekly' } },
        Target: { type: 'number', number: 3 },
      })
    )!;

    expect(habit.name).toBe('Read 20 pages');
    expect(habit.frequency).toBe('weekly');
    expect(habit.dailyTarget).toBe(3);
  });

  it('defaults to a daily habit with a target of at least 1', () => {
    const habit = pageToHabit(
      page({ Habit: title('Stretch'), Target: { type: 'number', number: 0 } })
    )!;

    expect(habit.frequency).toBe('daily');
    expect(habit.dailyTarget).toBe(1);
  });
});
