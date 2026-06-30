// ============================================
// LifeOS — Dashboard Page
// ============================================

import React, { useMemo, useState, useEffect } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { useProjectStore } from '../stores/projectStore';
import { useNoteStore } from '../stores/noteStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getUpcomingEvents } from '../services/googleCalendarService';
import { TaskStatus, ProjectStatus } from '../types';
import { format, subDays } from 'date-fns';
import { Timer, CheckSquare, Flame, Target, BookOpen, Clock, CalendarDays, Plus, Activity, BookText, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Music, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getRandomQuote } from '../data/quotes';
import SpotifyWidget from '../components/layout/SpotifyWidget';
import Skeleton, { SkeletonCard } from '../components/layout/Skeleton';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function DashboardPage() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const sessions = usePomodoroStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.logs);
  const projects = useProjectStore((s) => s.projects);
  const notes = useNoteStore((s) => s.notes);

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

  // Compute stats for last 7 days dynamically
  const weeklyStatsData = useMemo(() => {
    const data = [];
    const todayObj = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = subDays(todayObj, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');
      
      const daySessions = sessions.filter(s => s.date === dateStr);
      const focusMins = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const focusHrs = parseFloat((focusMins / 60).toFixed(1));
      
      const dayCompletedTasks = tasks.filter(t => {
        if (!t.completedAt || t.status !== TaskStatus.COMPLETED) return false;
        try {
          return format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr;
        } catch {
          return false;
        }
      }).length;
      
      const dayCompletedHabits = activeHabits.filter(h =>
        habitLogs.some(l => l.habitId === h.id && l.date === dateStr && l.completed)
      ).length;
      
      data.push({
        name: dayLabel,
        'Focus Hours': focusHrs,
        'Tasks Done': dayCompletedTasks,
        'Habits Done': dayCompletedHabits,
      });
    }
    
    return data;
  }, [sessions, tasks, activeHabits, habitLogs]);

  const [weather, setWeather] = useState<{ temp: number; text: string; code: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.56&longitude=68.79&current_weather=true')
      .then(res => res.json())
      .then(data => {
        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          let text = 'Clear Sky';
          if (code === 0) text = 'Clear Sky';
          else if ([1,2,3].includes(code)) text = 'Partly Cloudy';
          else if ([45,48].includes(code)) text = 'Foggy';
          else if ([51,53,55,61,63,65,80,81,82].includes(code)) text = 'Rainy';
          else if ([71,73,75,77,85,86].includes(code)) text = 'Snowy';
          else if ([95,96,99].includes(code)) text = 'Thunderstorm';
          
          setWeather({ temp, text, code });
        }
      })
      .catch(err => console.error('Failed to load weather:', err))
      .finally(() => setLoadingWeather(false));
  }, []);

  // Weather style mapper
  const weatherStyles = useMemo(() => {
    if (!weather) return {
      bg: 'linear-gradient(135deg, rgba(8, 8, 20, 0.4) 0%, rgba(2, 2, 5, 0.6) 100%)',
      border: '1px solid var(--color-border)',
      icon: Sun,
      color: 'var(--color-accent)'
    };
    
    const code = weather.code;
    if (code === 0) {
      return { 
        bg: 'linear-gradient(135deg, rgba(210, 153, 34, 0.1) 0%, rgba(8, 8, 20, 0.5) 100%)',
        border: '1px solid rgba(210, 153, 34, 0.2)',
        icon: Sun,
        color: 'var(--color-amber)'
      };
    }
    if ([1,2,3].includes(code)) {
      return {
        bg: 'linear-gradient(135deg, rgba(110, 118, 129, 0.1) 0%, rgba(8, 8, 20, 0.5) 100%)',
        border: '1px solid rgba(110, 118, 129, 0.2)',
        icon: Cloud,
        color: 'var(--color-text-secondary)'
      };
    }
    if ([51,53,55,61,63,65,80,81,82].includes(code)) {
      return {
        bg: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(8, 8, 20, 0.5) 100%)',
        border: '1px solid rgba(88, 166, 255, 0.2)',
        icon: CloudRain,
        color: 'var(--color-cyan)'
      };
    }
    if ([71,73,75,77,85,86].includes(code)) {
      return {
        bg: 'linear-gradient(135deg, rgba(240, 243, 246, 0.08) 0%, rgba(8, 8, 20, 0.5) 100%)',
        border: '1px solid rgba(240, 243, 246, 0.15)',
        icon: CloudSnow,
        color: 'var(--color-text-primary)'
      };
    }
    if ([95,96,99].includes(code)) {
      return {
        bg: 'linear-gradient(135deg, rgba(163, 113, 247, 0.1) 0%, rgba(8, 8, 20, 0.5) 100%)',
        border: '1px solid rgba(163, 113, 247, 0.2)',
        icon: CloudLightning,
        color: 'var(--color-violet)'
      };
    }
    return {
      bg: 'linear-gradient(135deg, rgba(8, 8, 20, 0.4) 0%, rgba(2, 2, 5, 0.6) 100%)',
      border: '1px solid var(--color-border)',
      icon: Sun,
      color: 'var(--color-accent)'
    };
  }, [weather]);

  const randomQuote = useMemo(() => {
    return getRandomQuote();
  }, []);

  const googleCalendarToken = useSettingsStore((s) => s.googleCalendarToken);
  const [upcomingGoogleEvents, setUpcomingGoogleEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (!googleCalendarToken) return;
    setLoadingEvents(true);
    getUpcomingEvents(new Date().toISOString(), 5)
      .then(setUpcomingGoogleEvents)
      .catch(err => console.error('Error loading dashboard events:', err))
      .finally(() => setLoadingEvents(false));
  }, [googleCalendarToken]);

  const todaySessions = sessions.filter((s) => s.date === today);
  const focusHours = (todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  
  const todayTasks = tasks.filter((t) => t.dueDate === today || t.status === TaskStatus.IN_PROGRESS);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  const habitsCompletedToday = activeHabits.filter((h) =>
    habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed)
  ).length;

  const activeProjects = projects.filter((p) => p.status === ProjectStatus.ACTIVE);
  const recentNotes = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  // Daily Progress aggregation
  const dailyProgress = useMemo(() => {
    const totalTodayHabits = activeHabits.length;
    const completedTodayHabits = activeHabits.filter((h) =>
      habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed)
    ).length;

    const totalTodayTasks = todayTasks.length;
    const completedTodayTasks = todayTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

    const totalItems = totalTodayHabits + totalTodayTasks;
    if (totalItems === 0) return 0;

    const completedItems = completedTodayHabits + completedTodayTasks;
    return Math.round((completedItems / totalItems) * 100);
  }, [activeHabits, habitLogs, todayTasks, today]);

  // Heatmap data (last 180 days)
  const heatmapData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    sessions.forEach(s => {
      counts[s.date] = (counts[s.date] || 0) + 1;
    });
    
    tasks.forEach(t => {
      if (t.completedAt) {
        try {
          const dateStr = format(new Date(t.completedAt), 'yyyy-MM-dd');
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        } catch (e) {
          // Ignore invalid dates
        }
      }
    });

    const data: { date: string; count: number }[] = [];
    for (let i = 180; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      data.push({ date: dateStr, count: counts[dateStr] || 0 });
    }
    return data;
  }, [sessions, tasks]);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'var(--color-heat-0)';
    if (count <= 1) return 'var(--color-heat-1)';
    if (count <= 3) return 'var(--color-heat-2)';
    if (count <= 5) return 'var(--color-heat-3)';
    return 'var(--color-heat-4)';
  };

  // Progress ring dimensions
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (dailyProgress / 100) * ringCircumference;

  const WeatherIcon = weatherStyles.icon;

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header Area */}
      <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4, letterSpacing: '-0.03em' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Here's what's happening today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/settings')} className="btn btn-secondary" style={{ gap: 6 }}>
            <CalendarDays size={14} />
            Connect Calendar
          </button>
          <button onClick={() => navigate('/focus')} className="btn btn-primary" style={{ gap: 6 }}>
            <Timer size={14} fill="currentColor" />
            Start Focus Mode
          </button>
        </div>
      </motion.div>

      {/* Top Widgets Panel: Weather & Quote */}
      <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        
        {/* Weather Widget */}
        {loadingWeather ? (
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <Skeleton width={32} height={32} borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width="40%" height={10} />
              <Skeleton width="80%" height={14} />
            </div>
          </div>
        ) : (
          <div 
            className="glass-card" 
            style={{ 
              padding: '16px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              background: weatherStyles.bg,
              borderColor: weatherStyles.border,
            }}
          >
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: weatherStyles.color }}>
              <WeatherIcon size={28} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Dushanbe weather
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                {weather ? `${weather.temp}°C · ${weather.text}` : 'Weather Offline'}
              </div>
            </div>
          </div>
        )}

        {/* Motivational Quotes Widget */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '16px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, rgba(63, 185, 80, 0.03) 0%, rgba(8, 8, 20, 0.4) 100%)', 
            borderLeft: '3px solid var(--color-accent)' 
          }}
        >
          <div style={{ fontSize: 12.5, fontStyle: 'italic', color: 'var(--color-text-primary)', lineHeight: 1.45 }}>
            "{randomQuote?.text}"
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 6, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            — {randomQuote?.author} ({randomQuote?.category.toUpperCase()})
          </div>
        </div>

      </motion.div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* LEFT COLUMN: Overview, Tasks, Habits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Quick Stats & Daily Ring Card */}
          <motion.div variants={item} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  <Clock size={13} /> <span style={{ fontSize: 11, fontWeight: 600 }}>FOCUS HOURS</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{focusHours}h</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  <CheckSquare size={13} /> <span style={{ fontSize: 11, fontWeight: 600 }}>TASKS DONE</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{completedTasks}</div>
              </div>
            </div>
            
            {/* Visual Ring Loader */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--color-border)', paddingLeft: 20 }}>
              <div style={{ position: 'relative', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="30" cy="30" r={ringRadius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                  <motion.circle 
                    cx="30" 
                    cy="30" 
                    r={ringRadius} 
                    fill="transparent" 
                    stroke="var(--color-accent)" 
                    strokeWidth="3.5" 
                    strokeDasharray={ringCircumference}
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ position: 'absolute', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {dailyProgress}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Today's Goal</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Tasks &amp; Habits</div>
              </div>
            </div>
          </motion.div>

          {/* Spotify Widget card */}
          <motion.div variants={item} className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 700 }}>
              <Music size={14} style={{ color: '#1DB954' }} /> Spotify Soundtrack
            </div>
            <SpotifyWidget height={152} />
          </motion.div>

          {/* Tasks Panel */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <CheckSquare size={14} /> Today's Tasks
              </h3>
              <span className="badge badge-accent">{todayTasks.length} pending</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {todayTasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>No tasks scheduled for today.</p>
              ) : todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 'var(--radius-md)', transition: 'background 0.15s',
                  background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/tasks')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, border: '1.5px solid var(--color-border-light)',
                    background: task.status === TaskStatus.COMPLETED ? 'var(--color-text-primary)' : 'transparent',
                  }} />
                  <span style={{ fontSize: 13, flex: 1, color: 'var(--color-text-primary)' }}>{task.title}</span>
                  <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Habits Panel */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <Target size={14} /> Habits
              </h3>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                {habitsCompletedToday} / {activeHabits.length} completed
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeHabits.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>No habits registered.</p>
              ) : activeHabits.slice(0, 4).map((habit) => {
                const isCompleted = habitLogs.some((l) => l.habitId === habit.id && l.date === today && l.completed);
                return (
                  <div 
                    key={habit.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      fontSize: 13, 
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <span style={{ fontWeight: 500, color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {habit.name}
                    </span>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--color-border-light)',
                      background: isCompleted ? habit.color : 'transparent', borderColor: isCompleted ? habit.color : 'var(--color-border-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCompleted ? `0 0 10px ${habit.color}40` : 'none',
                    }} />
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
        
        {/* RIGHT COLUMN: Heatmap, Skeletons, Analytics, Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* GitHub-style Heatmap */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Flame size={14} style={{ color: 'var(--color-rose)' }} /> Activity Heatmap
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              overflowX: 'auto',
              paddingBottom: 8
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateRows: 'repeat(7, 10px)', 
                gridAutoFlow: 'column', 
                gridAutoColumns: '10px',
                gap: 4 
              }}>
                {heatmapData.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count} activities`}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2.5,
                      background: getHeatColor(d.count),
                      transition: 'background 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Project Progress */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Activity size={14} /> Project Progress
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeProjects.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>No active projects.</p>
              ) : activeProjects.slice(0, 3).map((project) => (
                <div key={project.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{project.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{project.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${project.progress}%`, background: 'linear-gradient(90deg, var(--color-accent), var(--color-cyan))' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Study / Coding Statistics (Weekly Charts) */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <BookText size={14} /> Weekly Statistics
            </h3>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--color-text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--color-bg-secondary)', 
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                      color: 'var(--color-text-primary)'
                    }} 
                    labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
                    verticalAlign="bottom" 
                    height={36} 
                  />
                  <Bar dataKey="Focus Hours" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tasks Done" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Habits Done" fill="var(--color-violet)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <CalendarDays size={14} /> Upcoming Events
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingEvents ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton width="100%" height={32} />
                  <Skeleton width="100%" height={32} />
                </div>
              ) : !googleCalendarToken ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '16px 0', textAlign: 'center' }}>
                  No events scheduled. Connect Google Calendar in Settings.
                </div>
              ) : upcomingGoogleEvents.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '16px 0', textAlign: 'center' }}>
                  No upcoming events today.
                </div>
              ) : (
                upcomingGoogleEvents.map((event) => {
                  const startDateTime = event.start?.dateTime || event.start?.date;
                  const dateStr = startDateTime ? format(new Date(startDateTime), 'MMM d, yyyy') : '';
                  const timeStr = event.start?.dateTime ? format(new Date(event.start.dateTime), 'HH:mm') : 'All Day';
                  return (
                    <div
                      key={event.id}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.01)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--color-accent)',
                        border: '1px solid rgba(255,255,255,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {event.summary}
                      </span>
                      <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
