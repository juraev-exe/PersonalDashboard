// ============================================
// LifeOS — Focus Mode (Zen Timer)
// ============================================

import React, { useState, useEffect } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { usePomodoro } from '../hooks/usePomodoro';
import { TimerMode, PomodoroCategory } from '../types';
import { Play, Pause, Square, Volume2, VolumeX, Maximize2, Minimize2, Tag, Edit3, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyWidget from '../components/layout/SpotifyWidget';

export default function FocusPage() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const isPaused = usePomodoroStore((s) => s.isPaused);
  const timeRemaining = usePomodoroStore((s) => s.timeRemaining);
  const totalTime = usePomodoroStore((s) => s.totalTime);
  const mode = usePomodoroStore((s) => s.mode);
  const currentCategory = usePomodoroStore((s) => s.currentCategory);
  const currentNotes = usePomodoroStore((s) => s.currentNotes);

  const startTimer = usePomodoroStore((s) => s.startTimer);
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer);
  const resumeTimer = usePomodoroStore((s) => s.resumeTimer);
  const stopTimer = usePomodoroStore((s) => s.stopTimer);
  const setCategory = usePomodoroStore((s) => s.setCategory);
  const setNotes = usePomodoroStore((s) => s.setNotes);
  const setTimeRemaining = usePomodoroStore((s) => s.setTimeRemaining);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [showMusic, setShowMusic] = useState(true);

  // Initialize ticks via hook
  usePomodoro();

  // Load configured duration when idle
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setTimeRemaining(focusMinutes * 60);
    }
  }, [focusMinutes, isRunning, isPaused, setTimeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      startTimer(timeRemaining);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Exit fullscreen handler on escape
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // SVG calculations for progress circle
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalTime > 0 ? circumference - (timeRemaining / totalTime) * circumference : 0;

  const isTimerActive = isRunning || isPaused;

  return (
    <div 
      style={{
        minHeight: isTimerActive ? '100vh' : 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isTimerActive ? 'radial-gradient(circle at center, #0a0a1f 0%, #020205 100%)' : 'transparent',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isTimerActive ? 100 : 1,
        position: isTimerActive ? 'fixed' : 'relative',
        inset: isTimerActive ? 0 : 'auto',
        padding: '40px 20px',
      }}
    >
      <AnimatePresence mode="wait">
        {!isTimerActive ? (
          // ── SETUP SCREEN ─────────────────────────────────────────────────────
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="glass-card" 
            style={{ 
              padding: '32px', 
              maxWidth: 540, 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 24,
              boxShadow: 'var(--shadow-card-hover)',
              background: 'linear-gradient(135deg, rgba(16, 16, 32, 0.6) 0%, rgba(8, 8, 18, 0.8) 100%)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Enter Focus Mode</h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Mute notifications and lock your focus on a single objective.</p>
            </div>

            {/* Goal Input */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <Edit3 size={14} /> What is your primary objective?
              </label>
              <textarea
                value={currentNotes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Reviewing cloud firewall logs, finalizing UI redesign specs..."
                className="input"
                rows={3}
                style={{ fontSize: 14 }}
              />
            </div>

            {/* Config Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Category selector */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  <Tag size={14} /> Category
                </label>
                <select
                  value={currentCategory}
                  onChange={(e) => setCategory(e.target.value as PomodoroCategory)}
                  className="input"
                >
                  {Object.values(PomodoroCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Time Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  Duration
                </label>
                <select
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(Number(e.target.value))}
                  className="input"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={25}>25 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleToggleTimer}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 8px 24px var(--color-accent-glow)',
                marginTop: 8
              }}
            >
              Start Session (+25 XP)
            </button>
          </motion.div>
        ) : (
          // ── ZEN ACTIVE TIMER SCREEN ──────────────────────────────────────────
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 60,
              maxWidth: 1000,
              width: '100%',
            }}
          >
            {/* Left Box: Timer circle & focus indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, flex: '1 1 400px' }}>
              
              {/* Circular Ring Timer */}
              <div style={{ position: 'relative', width: 360, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="360" height="360" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                  <circle
                    cx="180"
                    cy="180"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="5"
                  />
                  <motion.circle
                    cx="180"
                    cy="180"
                    r={radius}
                    fill="transparent"
                    stroke={mode === TimerMode.FOCUS ? 'var(--color-accent)' : 'var(--color-emerald)'}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'linear' }}
                    strokeLinecap="round"
                    style={{
                      filter: isRunning ? `drop-shadow(0 0 10px ${mode === TimerMode.FOCUS ? 'var(--color-accent-glow)' : 'var(--color-emerald-glow)'})` : 'none',
                    }}
                  />
                </svg>

                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <motion.div
                    key={timeRemaining}
                    initial={{ opacity: 0.85, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                      fontSize: 84, 
                      fontWeight: 200, 
                      letterSpacing: '-0.05em', 
                      color: 'var(--color-text-primary)', 
                      fontFamily: 'var(--font-mono)', 
                      lineHeight: 1 
                    }}
                  >
                    {formatTime(timeRemaining)}
                  </motion.div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 12 }}>
                    {mode === TimerMode.FOCUS ? 'Focusing' : 'Break'}
                  </div>
                  <div className="badge badge-accent" style={{ marginTop: 12 }}>
                    {currentCategory}
                  </div>
                </div>
              </div>

              {/* Active Objective Statement */}
              {currentNotes && (
                <div style={{ textAlign: 'center', maxWidth: 460 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Current Objective
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                    "{currentNotes}"
                  </div>
                </div>
              )}

              {/* Central Controller Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Mute chimes button */}
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="btn btn-icon btn-ghost" 
                  style={{ color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.05)' }} 
                  title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Main Play/Pause Button */}
                <button
                  onClick={handleToggleTimer}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: 'var(--color-text-primary)',
                    color: 'var(--color-bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isRunning ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: 3 }} />}
                </button>

                {/* Cancel / Stop Timer Session */}
                <button 
                  onClick={stopTimer} 
                  className="btn btn-icon btn-ghost" 
                  style={{ color: 'var(--color-rose)', border: '1px solid rgba(248,81,73,0.1)' }} 
                  title="Stop and Exit Zen"
                >
                  <Square size={18} fill="currentColor" />
                </button>

                {/* Music Panel Toggle */}
                <button 
                  onClick={() => setShowMusic(!showMusic)} 
                  className="btn btn-icon btn-ghost" 
                  style={{ color: showMusic ? 'var(--color-accent)' : 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.05)' }} 
                  title="Toggle Spotify Focus Player"
                >
                  <Music size={18} />
                </button>
              </div>
            </div>

            {/* Right Box: Spotify Player */}
            {showMusic && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ flex: '1 1 320px', maxWidth: 360, width: '100%' }}
              >
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
                    FOCUS SOUNDTRACK
                  </span>
                </div>
                <SpotifyWidget height={360} />
              </motion.div>
            )}

            {/* Top Right Corner Controls */}
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
              <button 
                onClick={toggleFullscreen} 
                className="btn btn-icon btn-ghost" 
                style={{ color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
