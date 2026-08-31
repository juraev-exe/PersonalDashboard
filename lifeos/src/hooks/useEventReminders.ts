// ============================================
// LifeOS — Upcoming Event Reminders
// ============================================

import { useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { useCalendarStore } from '../stores/calendarStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getPermission, showNotification } from '../services/notifications';
import { getValue, setValue } from '../services/storage';

/** How far ahead of an event to fire its reminder. */
const LEAD_MS = 10 * 60 * 1000;
/** How often to re-scan for events entering the reminder window. */
const POLL_MS = 60 * 1000;
/** Keys older than this are dropped so the "already notified" list stays small. */
const KEY_TTL_MS = 48 * 60 * 60 * 1000;

const FIRED_KEY = 'notified_events';

type FiredMap = Record<string, number>;

/**
 * Resolve an event's start instant.
 * `startTime` is 'HH:mm' for locally-created events but a full ISO timestamp
 * for events imported from Google Calendar — both shapes appear in the store.
 */
export function resolveEventStart(event: CalendarEvent): Date | null {
  if (!event.startTime) return null; // All-day events get no timed reminder.

  if (event.startTime.includes('T')) {
    const parsed = new Date(event.startTime);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const match = /^(\d{1,2}):(\d{2})/.exec(event.startTime);
  if (!match || !event.date) return null;

  const parsed = new Date(`${event.date}T${match[1].padStart(2, '0')}:${match[2]}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Distinguishes a rescheduled event from one already announced. */
const firedKey = (event: CalendarEvent, start: Date) => `${event.id}@${start.toISOString()}`;

/**
 * Fires a local notification ~10 minutes before each upcoming calendar event.
 *
 * Reminders only fire while LifeOS is running — see services/notifications.ts
 * for why this is not server-driven push.
 */
export function useEventReminders() {
  const events = useCalendarStore((s) => s.events);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (getPermission() !== 'granted') return;

    let cancelled = false;

    const scan = async () => {
      const now = Date.now();
      const fired: FiredMap = getValue<FiredMap>(FIRED_KEY, {});

      // Drop stale bookkeeping before writing anything back.
      let changed = false;
      for (const [key, at] of Object.entries(fired)) {
        if (now - at > KEY_TTL_MS) {
          delete fired[key];
          changed = true;
        }
      }

      for (const event of events) {
        const start = resolveEventStart(event);
        if (!start) continue;

        const msUntil = start.getTime() - now;
        // Inside the lead window and not already past.
        if (msUntil > LEAD_MS || msUntil < 0) continue;

        const key = firedKey(event, start);
        if (fired[key]) continue;

        const minutes = Math.max(1, Math.round(msUntil / 60000));
        const shown = await showNotification(event.title, {
          body: `Starts in ${minutes} minute${minutes === 1 ? '' : 's'}`,
          tag: key,
        });

        if (cancelled) return;
        if (shown) {
          fired[key] = now;
          changed = true;
        }
      }

      if (changed) setValue(FIRED_KEY, fired);
    };

    void scan();
    const timer = setInterval(scan, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [events, notificationsEnabled]);
}
