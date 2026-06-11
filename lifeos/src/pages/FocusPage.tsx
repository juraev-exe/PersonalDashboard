// ============================================
// LifeOS — Focus Mode (Zen Timer)
// ============================================

import React, { useState, useEffect } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { usePomodoro } from '../hooks/usePomodoro';
import { TimerMode } from '../types';
import { Play, Pause, Square, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusPage() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const isPaused = usePomodoroStore((s) => s.isPaused);
  const timeRemaining = usePomodoroStore((s) => s.timeRemaining);
  const totalTime = usePomodoroStore((s) => s.totalTime);
  const mode = usePomodoroStore((s) => s.mode);

  const startTimer = usePomodoroStore((s) => s.startTimer);
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer);
  const resumeTimer = usePomodoroStore((s) => s.resumeTimer);
  const stopTimer = usePomodoroStore((s) => s.stopTimer);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize ticks via hook
  usePomodoro();

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
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // SVG calculations for progress circle
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalTime > 0 ? circumference - (timeRemaining / totalTime) * circumference : 0;

  return (
    <div style={{
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      background: isFullscreen ? 'var(--color-bg-primary)' : 'transparent',
      transition: 'all 0.5s ease',
      zIndex: isFullscreen ? 100 : 1,
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
    }}>
      
      {/* Timer Circle */}
      <div style={{ position: 'relative', width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="400" height="400" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="200"
            cy="200"
            r={radius}
            fill="transparent"
            stroke="var(--color-bg-tertiary)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <motion.circle
            cx="200"
            cy="200"
            r={radius}
            fill="transparent"
            stroke={mode === TimerMode.FOCUS ? 'var(--color-accent)' : 'var(--color-emerald)'}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'linear' }}
            strokeLinecap="round"
          />
        </svg>

        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <motion.div
            key={timeRemaining}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: 84, fontWeight: 200, letterSpacing: '-0.05em', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: -10 }}>
            {mode === TimerMode.FOCUS ? 'Focus' : 'Break'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button onClick={() => setIsMuted(!isMuted)} className="btn btn-icon btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button
          onClick={handleToggleTimer}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
          }}
        >
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: 4 }} />}
        </button>

        <button onClick={stopTimer} className="btn btn-icon btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
          <Square size={20} fill="currentColor" />
        </button>
      </div>

      {/* Mode Indicator Overlay */}
      {!isRunning && !isPaused && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', bottom: 40, color: 'var(--color-text-muted)', fontSize: 13 }}
        >
          Press Space to start your focus session
        </motion.div>
      )}

      {/* Corner Tools */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button onClick={toggleFullscreen} className="btn btn-icon btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
    </div>
  );
}
