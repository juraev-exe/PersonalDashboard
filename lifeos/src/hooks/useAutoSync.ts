// ============================================
// LifeOS — Automated Background Two-Way Sync
// Periodically synchronizes Notion & Microsoft To Do
// ============================================

import { useEffect, useRef, useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useSettingsStore } from '../stores/settingsStore';

const AUTO_SYNC_INTERVAL_MS = 10 * 60 * 1000; // Every 10 minutes
const STORAGE_SYNC_KEY = 'lifeos_last_sync_timestamp';

export function useAutoSync() {
  const syncFromNotion = useTaskStore((s) => s.syncFromNotion);
  const syncFromMicrosoftTodo = useTaskStore((s) => s.syncFromMicrosoftTodo);
  const notionApiKey = useSettingsStore((s) => s.notionApiKey);
  const microsoftAccessToken = useSettingsStore((s) => s.microsoftAccessToken);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem(STORAGE_SYNC_KEY);
    return saved ? new Date(saved) : null;
  });
  const running = useRef(false);

  const executeSync = async () => {
    if (running.current) return;
    if (!notionApiKey && !microsoftAccessToken) return;

    running.current = true;
    setIsSyncing(true);

    try {
      if (notionApiKey) {
        await syncFromNotion();
      }
      if (microsoftAccessToken) {
        await syncFromMicrosoftTodo();
      }
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem(STORAGE_SYNC_KEY, now.toISOString());
    } catch (err) {
      console.warn('Background auto-sync encountered an issue:', err);
    } finally {
      running.current = false;
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial sync on mount if integrations are set
    if (notionApiKey || microsoftAccessToken) {
      executeSync();
    }

    // Set recurring timer
    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        executeSync();
      }
    }, AUTO_SYNC_INTERVAL_MS);

    // Sync when window re-focuses if more than 5 minutes have passed
    const handleVisibility = () => {
      if (!document.hidden) {
        const last = localStorage.getItem(STORAGE_SYNC_KEY);
        if (!last || Date.now() - new Date(last).getTime() > 5 * 60 * 1000) {
          executeSync();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [notionApiKey, microsoftAccessToken]);

  return { isSyncing, lastSyncTime, executeSync };
}
