import React, { useRef, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { pomodoroPresets } from '../data/seed';
import { exportAllData, importAllData, clearAllData } from '../services/storage';
import { Settings, Sun, Moon, Bell, Volume2, Download, Upload, Trash2, ShieldAlert, Plug, GitBranch, Code, CalendarDays, FileSpreadsheet, CheckCircle } from 'lucide-react';

import type { AppSettings } from '../types';
import { supabase } from '../services/supabase';
import { connectGoogleCalendar } from '../services/googleAuth';

import { exportToGoogleSheets } from '../services/googleSheetsService';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { usePomodoroStore } from '../stores/pomodoroStore';

import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme);
  const selectedPreset = useSettingsStore((s) => s.pomodoroPreset);
  const autoStartBreaks = useSettingsStore((s) => s.autoStartBreaks);
  const autoStartFocus = useSettingsStore((s) => s.autoStartFocus);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  
  const githubToken = useSettingsStore((s) => s.githubToken) || '';
  const wakatimeApiKey = useSettingsStore((s) => s.wakatimeApiKey) || '';
  const notionApiKey = useSettingsStore((s) => s.notionApiKey) || '';
  const googleCalendarToken = useSettingsStore((s) => s.googleCalendarToken) || '';
  const googleUserEmail = useSettingsStore((s) => s.googleUserEmail as string | undefined) || '';
  const spotifyPlaylistUrl = useSettingsStore((s) => s.spotifyPlaylistUrl) || '';

  const clearGoogleSession = useSettingsStore((s) => s.clearGoogleSession);


  const setTheme = useSettingsStore((s) => s.setTheme);
  const setPreset = useSettingsStore((s) => s.setPomodoroPreset);
  const setAutoStartBreaks = useSettingsStore((s) => s.setAutoStartBreaks);
  const setAutoStartFocus = useSettingsStore((s) => s.setAutoStartFocus);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setIntegrationKey = useSettingsStore((s) => s.setIntegrationKey);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportingSheets, setExportingSheets] = useState(false);

  const handleConnectGoogle = async () => {
    if (!supabase) {
      alert('Supabase is not configured. Google integration requires a live Supabase instance.');
      return;
    }
    const { error } = await connectGoogleCalendar();
    if (error) alert(`Connection failed: ${error}`);
    // On success, the page redirects to /settings and main.tsx captures the token automatically.
  };

  const handleDisconnectGoogle = () => {
    clearGoogleSession();
  };


  const handleExportToGoogleSheets = async () => {
    if (!googleCalendarToken) {
      alert('Google account token is missing. Please connect or input your Google OAuth token.');
      return;
    }
    setExportingSheets(true);
    try {
      const tasks = useTaskStore.getState().tasks;
      const habits = useHabitStore.getState().habits;
      const pomodoros = usePomodoroStore.getState().sessions;

      const { spreadsheetUrl } = await exportToGoogleSheets(googleCalendarToken, {
        tasks,
        habits,
        pomodoros,
      });
      alert('Export to Google Sheets completed successfully!');
      window.open(spreadsheetUrl, '_blank');
    } catch (e: any) {
      alert(`Google Sheets Export failed: ${e.message}`);
    } finally {
      setExportingSheets(false);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export data backup.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target?.result as string;
      if (jsonString) {
        const success = importAllData(jsonString);
        if (success) {
          alert('Data backup imported successfully. Reloading the page...');
          window.location.reload();
        } else {
          alert('Invalid backup file formatting.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('CAUTION: Are you absolutely sure you want to delete all logs, tasks, habits, and focus hours? This action is permanent and cannot be undone.')) {
      clearAllData();
      alert('All dashboard data cleared. Reloading page...');
      window.location.reload();
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      {/* Header bar */}
      <motion.div variants={item}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-primary)' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Customize your application, manage timer intervals, integrations, and back up your records.</p>
      </motion.div>

      {/* Main Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Section 1: Appearance */}
        <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
            <Sun size={16} /> Appearance Theme
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setTheme('dark')}
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, gap: 8 }}
            >
              <Moon size={14} /> Dark Theme
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, gap: 8 }}
            >
              <Sun size={14} /> Light Theme
            </button>
          </div>
        </motion.div>

        {/* Section 2: Integrations */}
        <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
            <Plug size={16} /> Integrations & API Keys
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Connect third-party services to enrich your dashboard experience. Keys are stored locally.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* GitHub */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <GitBranch size={14} /> GitHub Personal Access Token
              </label>
              <input
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setIntegrationKey('githubToken', e.target.value)}
                className="input"
              />
            </div>
            
            {/* WakaTime */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <Code size={14} /> WakaTime API Key
              </label>
              <input
                type="password"
                placeholder="waka_..."
                value={wakatimeApiKey}
                onChange={(e) => setIntegrationKey('wakatimeApiKey', e.target.value)}
                className="input"
              />
            </div>
            
            {/* Notion */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>N</div> 
                Notion Internal Integration Token
              </label>
              <input
                type="password"
                placeholder="secret_..."
                value={notionApiKey}
                onChange={(e) => setIntegrationKey('notionApiKey', e.target.value)}
                className="input"
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Export Target</label>
                  <select
                    value={useSettingsStore((s) => s.notionParentType) || 'database'}
                    onChange={(e) => setIntegrationKey('notionParentType', e.target.value)}
                    className="input"
                  >
                    <option value="database">Database</option>
                    <option value="page">Parent Page</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Default {useSettingsStore((s) => s.notionParentType) === 'page' ? 'Page ID' : 'Database ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={useSettingsStore((s) => s.notionParentType) === 'page' ? 'e.g. 4b29...' : 'e.g. 8f10...'}
                    value={useSettingsStore((s) => s.notionDatabaseId) || ''}
                    onChange={(e) => setIntegrationKey('notionDatabaseId', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Spotify */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <span style={{ color: '#1DB954', fontWeight: 'bold' }}>Spotify</span> Playlist URL or ID
              </label>
              <input
                type="text"
                placeholder="https://open.spotify.com/playlist/... or playlist ID"
                value={spotifyPlaylistUrl}
                onChange={(e) => setIntegrationKey('spotifyPlaylistUrl', e.target.value)}
                className="input"
              />
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Enter any Spotify playlist URL to show it inside your dashboard and Focus timer widget.
              </p>
            </div>

            {/* Google Services */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                <CalendarDays size={14} /> Google Calendar &amp; Sheets
              </label>

              {googleCalendarToken ? (
                // ── Connected state ──────────────────────────────────────────
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(63, 185, 80, 0.06)',
                  border: '1px solid rgba(63, 185, 80, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={16} style={{ color: '#3fb950', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#3fb950', margin: 0 }}>Google Connected</p>
                        {googleUserEmail && (
                          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{googleUserEmail}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectGoogle}
                      className="btn btn-danger btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Disconnect
                    </button>
                  </div>

                  <button
                    onClick={handleExportToGoogleSheets}
                    className="btn btn-secondary btn-sm"
                    disabled={exportingSheets}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
                  >
                    <FileSpreadsheet size={14} />
                    {exportingSheets ? 'Exporting...' : 'Export Dashboard to Google Sheets'}
                  </button>
                </div>
              ) : (
                // ── Disconnected state ───────────────────────────────────────
                <div style={{
                  padding: '14px 16px',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                    Connect your Google account to sync calendar events and export data to Sheets.
                    Grants access to Calendar read/write and Sheets.
                  </p>
                  <button
                    onClick={handleConnectGoogle}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
                  >
                    <CalendarDays size={14} />
                    Connect Google Account
                  </button>
                </div>
              )}
            </div>

          </div>
        </motion.div>

        {/* Section 3: Pomodoro defaults */}
        <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
            <Settings size={16} /> Pomodoro Timer Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Select Preset Schedule
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {pomodoroPresets.map((preset) => {
                  const isSelected = selectedPreset.label === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPreset(preset)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{preset.label}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>
                        Focus: {preset.focusMinutes}m • Break: {preset.breakMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  style={{ width: 14, height: 14, cursor: 'pointer' }}
                />
                Auto-start break sessions
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoStartFocus}
                  onChange={(e) => setAutoStartFocus(e.target.checked)}
                  style={{ width: 14, height: 14, cursor: 'pointer' }}
                />
                Auto-start focus sessions
              </label>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Audio & Notifications */}
        <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
            <Volume2 size={16} /> Alerts & Notification Preferences
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ width: 14, height: 14, cursor: 'pointer' }}
              />
              Enable audio alert chime
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                style={{ width: 14, height: 14, cursor: 'pointer' }}
              />
              Enable desktop notifications
            </label>
          </div>
        </motion.div>

        {/* Section 5: Data management */}
        <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
            <Download size={16} /> Backup & Data Maintenance
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Export your data to a secure local file, restore from previous backups, or wipe all records.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <button onClick={handleExport} className="btn btn-secondary" style={{ gap: 8 }}>
              <Download size={14} /> Export Backup (.json)
            </button>
            
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ gap: 8 }}>
              <Upload size={14} /> Restore Backup (.json)
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <ShieldAlert size={14} /> Danger Zone
            </h4>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Clicking the button below will clear all stored logs, stats, and configurations from this device.
            </p>
            <button onClick={handleReset} className="btn btn-danger btn-sm" style={{ gap: 6 }}>
              <Trash2 size={13} /> Reset All Dashboard Data
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
