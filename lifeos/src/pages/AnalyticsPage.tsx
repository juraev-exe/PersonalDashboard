import React, { useMemo, useState } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { usePrayerStore } from '../stores/prayerStore';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format, subDays, startOfWeek } from 'date-fns';
import { BarChart3, TrendingUp, Calendar, Clock, CheckSquare, Target, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  const sessions = usePomodoroStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.logs);
  const prayerLogs = usePrayerStore((s) => s.logs);

  const daysCount = timeRange === '7days' ? 7 : 30;

  // Chart 1: Focus Hours (Last 7 or 30 days)
  const focusData = useMemo(() => {
    const data = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const duration = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
      data.push({
        label: format(d, 'MMM d'),
        hours: parseFloat(duration.toFixed(1)),
      });
    }
    return data;
  }, [sessions, daysCount]);

  // Chart 2: Task Completion Trends
  const taskData = useMemo(() => {
    const data = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayTasks = tasks.filter((t) => t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr);
      data.push({
        label: format(d, 'MMM d'),
        completed: dayTasks.length,
      });
    }
    return data;
  }, [tasks, daysCount]);

  // Chart 3: Habit Performance Trend
  const habitData = useMemo(() => {
    const data = [];
    const activeHabits = habits.filter(h => !h.archived);
    if (activeHabits.length === 0) return [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const completedCount = activeHabits.filter(h => 
        habitLogs.some(l => l.habitId === h.id && l.date === dateStr && l.completed)
      ).length;
      
      const percentage = Math.round((completedCount / activeHabits.length) * 100);
      data.push({
        label: format(d, 'MMM d'),
        percentage,
      });
    }
    return data;
  }, [habits, habitLogs, daysCount]);

  // Chart 4: Category Distribution
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + s.duration;
    });

    return Object.entries(map).map(([name, val]) => ({
      name,
      value: parseFloat((val / 60).toFixed(1)) // in hours, with 1 decimal place
    })).filter(item => item.value > 0);
  }, [sessions]);

  const COLORS = ['#6c63ff', '#10b981', '#06b6d4', '#f43f5e', '#f59e0b', '#8b5cf6', '#a855f7'];

  // Overall Statistics
  const totalFocusHours = useMemo(() => {
    return (sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  }, [sessions]);

  const totalTasksCompleted = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed').length;
  }, [tasks]);

  const prayerCompletionRate = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const logsToday = prayerLogs.filter(l => l.date === todayStr && l.completed).length;
    return Math.round((logsToday / 5) * 100);
  }, [prayerLogs]);

  // Heatmap calculations
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
          // Ignore
        }
      }
    });

    const data: { date: string; count: number }[] = [];
    for (let i = 181; i >= 0; i--) { // Last ~6 months
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
    if (count <= 6) return 'var(--color-heat-3)';
    return 'var(--color-heat-4)';
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header bar */}
      <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Productivity Insights</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Visualize your performance trends, productivity metrics, and logs.</p>
        </div>

        {/* Time selector */}
        <div style={{ display: 'flex', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 3, border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setTimeRange('7days')}
            className={`btn btn-sm ${timeRange === '7days' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)' }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`btn btn-sm ${timeRange === '30days' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)' }}
          >
            Last 30 Days
          </button>
        </div>
      </motion.div>

      {/* Numerical widgets row */}
      <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c63ff' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Total Focus Time</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{totalFocusHours} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>hrs</span></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Tasks Completed</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{totalTasksCompleted}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Target size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Habit Logs</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{habitLogs.filter(l => l.completed).length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Star size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Prayers Complete</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{prayerCompletionRate}% <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)' }}>today</span></div>
          </div>
        </div>

      </motion.div>

      {/* Chart grids */}
      <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20 }}>
        
        {/* Chart 1: Focus Hours */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} style={{ color: '#6c63ff' }} /> Focus Sessions Output (Hours)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={focusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                />
                <Bar dataKey="hours" fill="#6c63ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Completion Trend */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={16} style={{ color: '#06b6d4' }} /> Task Completion Rate
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={taskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="completed" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Habit Streaks Area */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: '#10b981' }} /> Habit Completion Trend (%)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={habitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="habitGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#habitGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Focus Pie Distribution */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} style={{ color: '#8b5cf6' }} /> Category Focus Distribution
          </h3>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryData.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>No focus category data. Complete Pomodoros!</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', alignItems: 'center', gap: 10, width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                      formatter={(value) => [`${value} hrs`, 'Focus Output']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legends list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }} title={entry.name}>
                        {entry.name}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{entry.value}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* Expanded Activity Heatmap */}
      <motion.div variants={item} className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={16} style={{ color: 'var(--color-emerald)' }} /> Long Term Activity Log (6 Months Heatmap)
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '4px 0' }}>
          {heatmapData.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} activities`}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: getHeatColor(d.count),
                transition: 'transform 0.1s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} style={{ width: 10, height: 10, borderRadius: 2, background: `var(--color-heat-${level})` }} />
          ))}
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>More</span>
        </div>
      </motion.div>

    </motion.div>
  );
}
