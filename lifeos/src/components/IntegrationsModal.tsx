// ============================================
// LifeOS — Data Integrations Modal (Notion & Microsoft To Do)
// ============================================

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { X, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Database, Copy } from 'lucide-react';
import { configureSupabase, testSupabaseConnection, isSupabaseConfigured } from '../services/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'supabase' | 'notion' | 'microsoft';
}

export default function IntegrationsModal({ isOpen, onClose, defaultTab = 'supabase' }: Props) {
  const [activeTab, setActiveTab] = useState<'supabase' | 'notion' | 'microsoft'>(defaultTab);

  // Notion Settings
  const notionApiKey = useSettingsStore((s) => s.notionApiKey) || '';
  const notionTasksDatabaseId = useSettingsStore((s) => s.notionTasksDatabaseId) || '';
  const setIntegrationKey = useSettingsStore((s) => s.setIntegrationKey);

  // Microsoft Settings
  const microsoftAccessToken = useSettingsStore((s) => s.microsoftAccessToken) || '';
  const microsoftTodoListId = useSettingsStore((s) => s.microsoftTodoListId) || '';

  // Supabase Settings
  const supabaseUrl = useSettingsStore((s) => s.supabaseUrl) || '';
  const supabaseAnonKey = useSettingsStore((s) => s.supabaseAnonKey) || '';

  // Task store sync
  const syncFromNotion = useTaskStore((s) => s.syncFromNotion);
  const syncFromMicrosoftTodo = useTaskStore((s) => s.syncFromMicrosoftTodo);

  // Local form inputs
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseUrl);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseAnonKey);
  const [notionTokenInput, setNotionTokenInput] = useState(notionApiKey);
  const [notionDbInput, setNotionDbInput] = useState(notionTasksDatabaseId);
  const [msTokenInput, setMsTokenInput] = useState(microsoftAccessToken);
  const [msListInput, setMsListInput] = useState(microsoftTodoListId);

  // Status & Feedback
  const [syncing, setSyncing] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSupabaseUrlInput(supabaseUrl);
      setSupabaseKeyInput(supabaseAnonKey);
      setNotionTokenInput(notionApiKey);
      setNotionDbInput(notionTasksDatabaseId);
      setMsTokenInput(microsoftAccessToken);
      setMsListInput(microsoftTodoListId);
      setStatusMessage(null);
    }
  }, [isOpen, supabaseUrl, supabaseAnonKey, notionApiKey, notionTasksDatabaseId, microsoftAccessToken, microsoftTodoListId]);

  if (!isOpen) return null;

  const handleConnectSupabase = async () => {
    setStatusMessage(null);
    setTestingSupabase(true);
    try {
      const url = supabaseUrlInput.trim();
      const key = supabaseKeyInput.trim();
      const result = await testSupabaseConnection(url, key);
      if (result.success) {
        configureSupabase(url, key);
        setIntegrationKey('supabaseUrl', url);
        setIntegrationKey('supabaseAnonKey', key);
        useTaskStore.getState().loadTasks();
        useHabitStore.getState().loadHabits();
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Connection failed' });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleCopySql = async () => {
    try {
      const res = await fetch('/supabase_schema.sql');
      if (res.ok) {
        const sql = await res.text();
        await navigator.clipboard.writeText(sql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
      }
    } catch {
      alert('You can find the SQL script in your project at lifeos/supabase_schema.sql');
    }
  };

  const handleSaveNotion = async () => {
    setStatusMessage(null);
    setIntegrationKey('notionApiKey', notionTokenInput.trim());
    setIntegrationKey('notionTasksDatabaseId', notionDbInput.trim());
    setStatusMessage({ type: 'success', text: 'Notion credentials saved successfully.' });
  };

  const handleSyncNotion = async () => {
    setStatusMessage(null);
    setSyncing(true);
    // Auto-save any edited values first
    setIntegrationKey('notionApiKey', notionTokenInput.trim());
    setIntegrationKey('notionTasksDatabaseId', notionDbInput.trim());
    try {
      const res = await syncFromNotion();
      setStatusMessage({
        type: 'success',
        text: `Sync complete: ${res.imported} added, ${res.updated} updated.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Notion sync failed. Check your API key and database ID.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveMicrosoft = async () => {
    setStatusMessage(null);
    setIntegrationKey('microsoftAccessToken', msTokenInput.trim());
    setIntegrationKey('microsoftTodoListId', msListInput.trim());
    setStatusMessage({ type: 'success', text: 'Microsoft To Do credentials saved.' });
  };

  const handleSyncMicrosoft = async () => {
    setStatusMessage(null);
    setSyncing(true);
    // Auto-save any edited values first
    setIntegrationKey('microsoftAccessToken', msTokenInput.trim());
    setIntegrationKey('microsoftTodoListId', msListInput.trim());
    try {
      const res = await syncFromMicrosoftTodo();
      setStatusMessage({
        type: 'success',
        text: `Sync complete: ${res.imported} added, ${res.updated} updated.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Microsoft To Do sync failed. Verify your access token.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const isNotionConnected = Boolean(notionApiKey && notionTasksDatabaseId);
  const isMicrosoftConnected = Boolean(microsoftAccessToken);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540, width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Data Integrations
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Connect Notion and Microsoft To Do to synchronize your tasks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: 28, height: 28, color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 22px' }}>
          <button
            onClick={() => { setActiveTab('supabase'); setStatusMessage(null); }}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'supabase' ? '2px solid #3ecf8e' : '2px solid transparent',
              color: activeTab === 'supabase' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'supabase' ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Database size={14} style={{ color: '#3ecf8e' }} /> Supabase
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isSupabaseConfigured ? '#3ecf8e' : 'var(--color-border-light)',
              }}
            />
          </button>

          <button
            onClick={() => { setActiveTab('notion'); setStatusMessage(null); }}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'notion' ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeTab === 'notion' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'notion' ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 12 }}>N</span> Notion
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isNotionConnected ? 'var(--color-accent)' : 'var(--color-border-light)',
              }}
            />
          </button>

          <button
            onClick={() => { setActiveTab('microsoft'); setStatusMessage(null); }}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'microsoft' ? '2px solid #0284c7' : '2px solid transparent',
              color: activeTab === 'microsoft' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'microsoft' ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ color: '#0284c7', fontWeight: 'bold' }}>MS</span> To Do
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isMicrosoftConnected ? '#0284c7' : 'var(--color-border-light)',
              }}
            />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '22px' }}>
          {statusMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 18,
                background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(225, 29, 72, 0.25)'}`,
                color: statusMessage.type === 'success' ? '#3ecf8e' : 'var(--color-rose)',
              }}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'supabase' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project-id.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="input"
                />
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Find this under Project Settings &rarr; API in
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#3ecf8e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 600 }}
                  >
                    Supabase Dashboard <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleConnectSupabase}
                  disabled={testingSupabase || !supabaseUrlInput || !supabaseKeyInput}
                  className="btn btn-primary"
                  style={{ flex: 1, gap: 6, background: '#3ecf8e', borderColor: '#3ecf8e', color: '#000', fontWeight: 600 }}
                >
                  <RefreshCw size={14} className={testingSupabase ? 'animate-spin' : ''} />
                  {testingSupabase ? 'Connecting...' : 'Connect & Test'}
                </button>
                <button
                  onClick={handleCopySql}
                  className="btn btn-secondary"
                  style={{ gap: 6 }}
                >
                  <Copy size={14} />
                  {copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}
                </button>
              </div>
            </div>
          ) : activeTab === 'notion' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                  Notion Internal Integration Secret
                </label>
                <input
                  type="password"
                  placeholder="secret_..."
                  value={notionTokenInput}
                  onChange={(e) => setNotionTokenInput(e.target.value)}
                  className="input"
                />
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Create an integration at
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 600 }}
                  >
                    notion.so/my-integrations <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                  Tasks Database ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1a2b3c4d5e6f... (from your database URL)"
                  value={notionDbInput}
                  onChange={(e) => setNotionDbInput(e.target.value)}
                  className="input"
                />
                <p style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Open your Tasks database in Notion, click <strong>•••</strong> &rarr; <strong>Connect to</strong> &rarr; select your integration.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleSaveNotion}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Save Credentials
                </button>
                <button
                  onClick={handleSyncNotion}
                  disabled={syncing || !notionTokenInput || !notionDbInput}
                  className="btn btn-primary"
                  style={{ flex: 1, gap: 6 }}
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing...' : 'Sync Notion Tasks'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                  Microsoft Graph Access Token
                </label>
                <input
                  type="password"
                  placeholder="Paste your Microsoft Bearer token"
                  value={msTokenInput}
                  onChange={(e) => setMsTokenInput(e.target.value)}
                  className="input"
                />
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Generate an access token in 1 click at
                  <a
                    href="https://developer.microsoft.com/graph/graph-explorer"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 600 }}
                  >
                    Microsoft Graph Explorer <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                  Task List ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-detect default Tasks list"
                  value={msListInput}
                  onChange={(e) => setMsListInput(e.target.value)}
                  className="input"
                />
                <p style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  If empty, LifeOS will automatically discover and use your default "Tasks" list.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleSaveMicrosoft}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Save Credentials
                </button>
                <button
                  onClick={handleSyncMicrosoft}
                  disabled={syncing || !msTokenInput}
                  className="btn btn-primary"
                  style={{ flex: 1, gap: 6, background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing...' : 'Sync Microsoft Tasks'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
