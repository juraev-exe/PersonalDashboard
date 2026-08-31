// ============================================
// LifeOS — Notion Sync Button
// ============================================

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  /** Runs the sync and reports what changed. */
  onSync: () => Promise<{ imported: number; updated: number }>;
  label?: string;
}

type Result = { ok: true; text: string } | { ok: false; text: string };

export default function NotionSyncButton({ onSync, label = 'Sync Notion' }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleClick = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const { imported, updated } = await onSync();
      setResult({
        ok: true,
        text:
          imported === 0 && updated === 0
            ? 'Already up to date'
            : `${imported} added, ${updated} updated`,
      });
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : 'Sync failed' });
    } finally {
      setSyncing(false);
      // Clear the inline status so it doesn't linger in the header.
      setTimeout(() => setResult(null), 6000);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {result && (
        <span
          role="status"
          style={{
            fontSize: 11,
            color: result.ok ? 'var(--color-accent)' : 'var(--color-danger)',
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={result.text}
        >
          {result.text}
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={syncing}
        className="btn btn-secondary btn-sm"
        style={{ opacity: syncing ? 0.6 : 1, cursor: syncing ? 'wait' : 'pointer' }}
      >
        <RefreshCw
          size={14}
          style={syncing ? { animation: 'spin 1s linear infinite' } : undefined}
        />
        {syncing ? 'Syncing…' : label}
      </button>
    </div>
  );
}
