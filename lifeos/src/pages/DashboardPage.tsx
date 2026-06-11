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
import { Timer, CheckSquare, Flame, Target, BookOpen, Clock, CalendarDays, Plus, Activity, BookText } from 'lucide-react';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function DashboardPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const sessions = usePomodoroStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.logs);
  const projects = useProjectStore((s) => s.projects);
  const notes = useNoteStore((s) => s.notes);

  const googleCalendarToken = useSettingsStore((s) => s.googleCalendarToken);
  const [upcomingGoogleEvents, setUpcomingGoogleEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!googleCalendarToken) return;
    getUpcomingEvents(new Date().toISOString(), 5)
      .then(setUpcomingGoogleEvents)
      .catch(err => console.error('Error loading dashboard events:', err));
  }, [googleCalendarToken]);

  const todaySessions = sessions.filter((s) => s.date === today);
  const focusHours = (todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  const pomodorosToday = todaySessions.length;
  
  const todayTasks = tasks.filter((t) => t.dueDate === today || t.status === TaskStatus.IN_PROGRESS);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  const activeHabits = habits.filter((h) => !h.archived);
  const habitsCompletedToday = activeHabits.filter((h) =>
    habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed)
  ).length;

  const activeProjects = projects.filter((p) => p.status === ProjectStatus.ACTIVE);
  const recentNotes = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

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

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Header Area */}
      <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Here's what's happening today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            <CalendarDays size={14} />
            Connect Calendar
          </button>
          <button className="btn btn-primary">
            <Plus size={14} />
            Quick Add
          </button>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 4fr) minmax(400px, 6fr)', gap: 24 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Quick Stats Grid */}
          <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                <Clock size={14} /> <span style={{ fontSize: 12, fontWeight: 500 }}>Focus Hours</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{focusHours}h</div>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                <CheckSquare size={14} /> <span style={{ fontSize: 12, fontWeight: 500 }}>Tasks Done</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{completedTasks}</div>
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)' }}>
                <CheckSquare size={14} /> Tasks
              </h3>
              <span className="badge">{todayTasks.length} pending</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {todayTasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: '12px 0' }}>No tasks for today.</p>
              ) : todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px',
                  borderRadius: 'var(--radius-md)', transition: 'background 0.15s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, border: '1px solid var(--color-border-light)',
                    background: task.status === TaskStatus.COMPLETED ? 'var(--color-text-primary)' : 'transparent',
                  }} />
                  <span style={{ fontSize: 13, flex: 1, color: 'var(--color-text-primary)' }}>{task.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Habits */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)' }}>
                <Target size={14} /> Habits
              </h3>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                {habitsCompletedToday} / {activeHabits.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeHabits.slice(0, 4).map((habit) => {
                const isCompleted = habitLogs.some((l) => l.habitId === habit.id && l.date === today && l.completed);
                return (
                  <div key={habit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>{habit.name}</span>
                    <div style={{
                      width: 18, height: 18, borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border-light)',
                      background: isCompleted ? 'var(--color-success)' : 'transparent', borderColor: isCompleted ? 'var(--color-success)' : 'var(--color-border-light)'
                    }} />
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-primary)' }}>
              <BookOpen size={14} /> Recent Notes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentNotes.map((note, index) => (
                <div key={note.id} style={{ borderBottom: index === recentNotes.length - 1 ? 'none' : '1px solid var(--color-border)', paddingBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: 'var(--color-text-primary)' }}>{note.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {note.tags.map((t) => `#${t}`).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* GitHub-style Heatmap */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={14} /> Activity Heatmap
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
                      borderRadius: 2,
                      background: getHeatColor(d.count),
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Project Progress */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} /> Project Progress
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeProjects.slice(0, 3).map((project) => (
                <div key={project.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{project.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Study / Coding Statistics (Mock for now, to be populated later) */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookText size={14} /> Weekly Statistics
            </h3>
            <div style={{ 
              height: 160, 
              border: '1px dashed var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 13
            }}>
              Chart Data (Connect Integrations)
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarDays size={14} /> Upcoming Events
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!googleCalendarToken ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '12px 0', textAlign: 'center' }}>
                  No events scheduled. Connect Google Calendar in Settings.
                </div>
              ) : upcomingGoogleEvents.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '12px 0', textAlign: 'center' }}>
                  No upcoming events.
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
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--color-accent)',
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
