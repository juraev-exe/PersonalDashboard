import { describe, it, expect } from 'vitest';
import { resolveEventStart } from './useEventReminders';
import type { CalendarEvent } from '../types';

const event = (overrides: Partial<CalendarEvent>): CalendarEvent => ({
  id: 'e1',
  title: 'Standup',
  date: '2026-09-01',
  type: 'event',
  color: '#3fb950',
  ...overrides,
});

describe('resolveEventStart', () => {
  it('combines an HH:mm start with the event date', () => {
    const start = resolveEventStart(event({ startTime: '09:30' }))!;

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(8); // September
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(9);
    expect(start.getMinutes()).toBe(30);
  });

  it('pads a single-digit hour', () => {
    const start = resolveEventStart(event({ startTime: '9:05' }))!;

    expect(start.getHours()).toBe(9);
    expect(start.getMinutes()).toBe(5);
  });

  it('parses the full ISO timestamps that Google Calendar events carry', () => {
    const iso = '2026-09-01T14:00:00.000Z';
    const start = resolveEventStart(event({ startTime: iso }))!;

    expect(start.toISOString()).toBe(iso);
  });

  it('returns null for all-day events with no start time', () => {
    expect(resolveEventStart(event({ startTime: undefined }))).toBeNull();
  });

  it('returns null rather than an Invalid Date for unparseable input', () => {
    expect(resolveEventStart(event({ startTime: 'lunchtime' }))).toBeNull();
    expect(resolveEventStart(event({ startTime: '2026-13-45T99:99:99Z' }))).toBeNull();
  });
});
