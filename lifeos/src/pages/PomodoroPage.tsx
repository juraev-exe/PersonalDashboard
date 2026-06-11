import React, { useEffect, useState } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePomodoro } from '../hooks/usePomodoro';
import { PomodoroCategory, TimerMode } from '../types';
import { Play, Pause, Square, SkipForward, Flame, BookOpen, Clock, Tag, MessageSquare, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function PomodoroPage() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const isPaused = usePomodoroStore((s) => s.isPaused);
  const mode = usePomodoroStore((s) => s.mode);
  const timeRemaining = usePomodoroStore((s) => s.timeRemaining);
  const totalTime = usePomodoroStore((s) => s.totalTime);
  const currentCategory = usePomodoroStore((s) => s.currentCategory);
  const currentNotes = usePomodoroStore((s) => s.currentNotes);
  const sessions = usePomodoroStore((s) => s.sessions);
  const sessionCount = usePomodoroStore((s) => s.sessionCount);

  const startTimer = usePomodoroStore((s) => s.startTimer);
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer);
  const resumeTimer = usePomodoroStore((s) => s.resumeTimer);
  const stopTimer = usePomodoroStore((s) => s.stopTimer);
  const setCategory = usePomodoroStore((s) => s.setCategory);
  const setNotes = usePomodoroStore((s) => s.setNotes);
  const setMode = usePomodoroStore((s) => s.setMode);
  const setTimeRemaining = usePomodoroStore((s) => s.setTimeRemaining);

  const preset = useSettingsStore((s) => s.pomodoroPreset);

  // Hook to handle ticks
  const { handleTimerCompletion } = usePomodoro();

  // Selected preset logic
  const handlePresetSelect = (m: TimerMode, durationMinutes: number) => {
    stopTimer();
    setMode(m);
    setTimeRemaining(durationMinutes * 60);
  };

  const handleStart = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      startTimer(timeRemaining);
    }
  };

  // Skip break or focus
  const handleSkip = () => {
    stopTimer();
    if (mode === TimerMode.FOCUS) {
      // Skip to short break
      setMode(TimerMode.SHORT_BREAK);
      setTimeRemaining(preset.breakMinutes * 60);
    } else {
      // Skip to focus
      setMode(TimerMode.FOCUS);
      setTimeRemaining(preset.focusMinutes * 60);
    }
  };

  // Helper formatting MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG calculations for progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalTime > 0 ? circumference - (timeRemaining / totalTime) * circumference : 0;

  // Active theme color
  const themeColor = mode === TimerMode.FOCUS ? 'var(--color-accent)' : 'var(--color-emerald)';
  const glowColor = mode === TimerMode.FOCUS ? 'var(--color-accent-glow)' : 'var(--color-emerald-glow)';

  // Today sessions log
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const totalFocusMin = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }} className="animate-fade-in">
      {/* Left panel: Timer & Configurations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Timer Card */}
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
            <button
              onClick={() => handlePresetSelect(TimerMode.FOCUS, preset.focusMinutes)}
              className={`btn btn-sm ${mode === TimerMode.FOCUS ? 'btn-primary' : 'btn-secondary'}`}
              disabled={isRunning && mode === TimerMode.FOCUS}
            >
              Focus ({preset.focusMinutes}m)
            </button>
            <button
              onClick={() => handlePresetSelect(TimerMode.SHORT_BREAK, preset.breakMinutes)}
              className={`btn btn-sm ${mode === TimerMode.SHORT_BREAK ? 'btn-primary' : 'btn-secondary'}`}
              disabled={isRunning && mode === TimerMode.SHORT_BREAK}
            >
              Short Break ({preset.breakMinutes}m)
            </button>
            <button
              onClick={() => handlePresetSelect(TimerMode.LONG_BREAK, preset.longBreakMinutes)}
              className={`btn btn-sm ${mode === TimerMode.LONG_BREAK ? 'btn-primary' : 'btn-secondary'}`}
              disabled={isRunning && mode === TimerMode.LONG_BREAK}
            >
              Long Break ({preset.longBreakMinutes}m)
            </button>
          </div>

          {/* Circle Ring */}
          <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="270" height="270" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              {/* Background circle */}
              <circle
                cx="135"
                cy="135"
                r={radius}
                fill="transparent"
                stroke="var(--color-bg-tertiary)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="135"
                cy="135"
                r={radius}
                fill="transparent"
                stroke={themeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: isRunning ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
                  transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease',
                }}
              />
            </svg>

            {/* Timer digits overlay */}
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <div style={{ fontSize: 54, fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {formatTime(timeRemaining)}
              </div>
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 8 }}>
                {mode === TimerMode.FOCUS ? 'Focus Session' : mode === TimerMode.SHORT_BREAK ? 'Short Break' : 'Long Break'}
              </div>
              {mode === TimerMode.FOCUS && (
                <div className="badge badge-accent" style={{ marginTop: 12, fontSize: 11 }}>
                  {currentCategory}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 16, marginTop: 35, alignItems: 'center' }}>
            {isRunning ? (
              <button onClick={pauseTimer} className="btn btn-secondary btn-icon" style={{ width: 50, height: 50, borderRadius: '50%' }} title="Pause">
                <Pause size={20} />
              </button>
            ) : (
              <button onClick={handleStart} className="btn btn-primary btn-icon" style={{ width: 60, height: 60, borderRadius: '50%', background: themeColor, boxShadow: `0 4px 14px ${glowColor}` }} title="Start">
                <Play size={24} fill="white" style={{ marginLeft: 3 }} />
              </button>
            )}

            {(isRunning || isPaused) && (
              <button onClick={stopTimer} className="btn btn-secondary btn-icon" style={{ width: 50, height: 50, borderRadius: '50%' }} title="Stop/Reset">
                <Square size={18} fill="currentColor" />
              </button>
            )}

            <button onClick={handleSkip} className="btn btn-secondary btn-icon" style={{ width: 50, height: 50, borderRadius: '50%' }} title="Skip Mode">
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        {/* Configuration details (Category & Notes) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={18} style={{ color: 'var(--color-accent)' }} /> Session Setup
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Activity Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => setCategory(e.target.value as PomodoroCategory)}
                className="input"
                disabled={isRunning}
              >
                {Object.values(PomodoroCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Session Goal
              </label>
              <div style={{ position: 'relative' }}>
                <span className="badge badge-accent" style={{ position: 'absolute', right: 8, top: 11, fontSize: 10 }}>
                  +25 XP
                </span>
                <div className="input" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', padding: '10px 14px', fontSize: 14 }}>
                  Complete Pomodoro
                </div>
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Quick Notes
            </label>
            <textarea
              value={currentNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What are you working on? (Will be saved in your history logs)"
              className="input"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Right panel: Live stats & Session logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Today's Focus Stats */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} style={{ color: 'var(--color-rose)' }} /> Today's Focus
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--color-bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Focus Time</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {totalFocusMin >= 60 ? `${(totalFocusMin / 60).toFixed(1)}h` : `${totalFocusMin}m`}
              </div>
            </div>
            <div style={{ background: 'var(--color-bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Sessions Completed</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {todaySessions.length} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)' }}>/ {preset.sessionsBeforeLongBreak}</span>
              </div>
            </div>
          </div>
          {/* Progress bar to long break */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
              <span>To Long Break</span>
              <span>{sessionCount} / {preset.sessionsBeforeLongBreak} done</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min((sessionCount / preset.sessionsBeforeLongBreak) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, var(--color-accent), var(--color-cyan))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Focus History Logs */}
        <div className="glass-card" style={{ padding: '20px', flexGrow: 1, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={16} style={{ color: 'var(--color-violet)' }} /> Session History
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flexGrow: 1, maxHeight: 380, paddingRight: 4 }}>
            {todaySessions.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                <Clock size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>No focus sessions completed today yet.</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Start the timer to earn XP!</p>
              </div>
            ) : (
              [...todaySessions].reverse().map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--color-accent)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {session.category}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {format(new Date(session.startTime), 'hh:mm a')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Focus: {session.duration} mins
                    </span>
                    <span className="badge badge-emerald" style={{ fontSize: 9 }}>
                      +25 XP
                    </span>
                  </div>
                  {session.notes && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, fontStyle: 'italic', borderTop: '1px solid var(--color-border)', paddingTop: 4 }}>
                      "{session.notes}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
