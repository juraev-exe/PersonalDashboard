// ============================================
// LifeOS — Digital Detox & Bad Habit Tracker Page
// ============================================

import React, { useState, useMemo } from 'react';
import { useDetoxStore } from '../stores/detoxStore';
import type { BadHabit, ScreentimeLog } from '../stores/detoxStore';
import { Plus, Trash2, Smartphone, ShieldAlert, CheckCircle, Flame, Award, Calendar, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SCREENTIME_CATEGORIES = ['Social Media', 'Gaming', 'Doom Scrolling', 'Netflix/Video', 'Productive Work', 'Other'];
const PRESET_COLORS = ['#ff7b72', '#ffc069', '#d29922', '#a371f7', '#58a6ff'];

export default function DetoxPage() {
  const badHabits = useDetoxStore((s) => s.badHabits);
  const badHabitLogs = useDetoxStore((s) => s.badHabitLogs);
  const screentimeLogs = useDetoxStore((s) => s.screentimeLogs);
  
  const addBadHabit = useDetoxStore((s) => s.addBadHabit);
  const deleteBadHabit = useDetoxStore((s) => s.deleteBadHabit);
  const toggleBadHabit = useDetoxStore((s) => s.toggleBadHabit);
  
  const addScreentimeLog = useDetoxStore((s) => s.addScreentimeLog);
  const deleteScreentimeLog = useDetoxStore((s) => s.deleteScreentimeLog);
  const getCleanStreak = useDetoxStore((s) => s.getCleanStreak);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Modals states
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);

  // Form states - Bad Habit
  const [bhName, setBhName] = useState('');
  const [bhColor, setBhColor] = useState(PRESET_COLORS[0]);

  // Form states - Screen Time
  const [stHours, setStHours] = useState('');
  const [stCategory, setStCategory] = useState(SCREENTIME_CATEGORIES[0]);
  const [stDate, setStDate] = useState(todayStr);

  // 7 days helper for bad habit grid
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(subDays(new Date(), i));
    }
    return dates;
  }, []);

  const handleSaveBadHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bhName.trim()) return;
    await addBadHabit(bhName, bhColor);
    setIsHabitModalOpen(false);
    setBhName('');
    setBhColor(PRESET_COLORS[0]);
  };

  const handleSaveScreentime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stHours || isNaN(Number(stHours)) || Number(stHours) <= 0) {
      alert('Please enter valid hours');
      return;
    }
    await addScreentimeLog(Number(stHours), stCategory, stDate);
    setIsScreenModalOpen(false);
    setStHours('');
    setStDate(todayStr);
  };

  // Screen time stats
  const totalScreentimeToday = useMemo(() => {
    return screentimeLogs
      .filter((l) => l.date === todayStr)
      .reduce((sum, l) => sum + l.hours, 0);
  }, [screentimeLogs, todayStr]);

  // Screen time chart data (last 7 days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');

      const dayLogs = screentimeLogs.filter((l) => l.date === dateStr);
      
      const categoryData: Record<string, number> = {};
      SCREENTIME_CATEGORIES.forEach(cat => {
        categoryData[cat] = dayLogs.filter(l => l.category === cat).reduce((sum, l) => sum + l.hours, 0);
      });

      data.push({
        name: dayLabel,
        ...categoryData,
      });
    }
    return data;
  }, [screentimeLogs]);

  // Clean status today
  const allCleanToday = useMemo(() => {
    return badHabits.every(h => {
      const log = badHabitLogs.find(l => l.habitId === h.id && l.date === todayStr);
      return log ? !log.occurred : true;
    });
  }, [badHabits, badHabitLogs, todayStr]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Digital Detox & Bad Habits</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Break bad routines, track screen time usage, and earn discipline XP.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsScreenModalOpen(true)} className="btn btn-secondary" style={{ gap: '6px' }}>
            <Smartphone size={18} /> Track Screen Time
          </button>
          <button onClick={() => setIsHabitModalOpen(true)} className="btn btn-primary" style={{ gap: '6px' }}>
            <Plus size={18} /> New Bad Habit
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {/* Screen Time Status */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${totalScreentimeToday > 4 ? 'var(--color-rose)' : 'var(--color-success)'}` }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(88, 166, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
            <Smartphone size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Screen Time Today</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {totalScreentimeToday.toFixed(1)} <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>hours</span>
            </div>
          </div>
        </div>

        {/* Bad Habit Clean Status */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${allCleanToday ? 'var(--color-success)' : 'var(--color-rose)'}` }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: allCleanToday ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: allCleanToday ? 'var(--color-success)' : 'var(--color-rose)' }}>
            {allCleanToday ? <CheckCircle size={22} /> : <ShieldAlert size={22} />}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Discipline Status</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: allCleanToday ? 'var(--color-success)' : 'var(--color-rose)' }}>
              {allCleanToday ? 'Clean Day! (+10 XP pending)' : 'Slipped up today'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left: Bad Habits Avoidance Grid */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Habits to Avoid (Stay Clean)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {badHabits.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No bad habits configured. Good job!
              </div>
            ) : (
              badHabits.map((habit) => {
                const logToday = badHabitLogs.find((l) => l.habitId === habit.id && l.date === todayStr);
                const occurredToday = logToday ? logToday.occurred : false;
                const cleanStreak = getCleanStreak(habit.id);

                return (
                  <div
                    key={habit.id}
                    style={{
                      padding: '16px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: habit.color }} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{habit.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 11, fontWeight: 700, color: 'var(--color-amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 12 }}>
                          <Flame size={12} fill="currentColor" /> {cleanStreak}d clean
                        </div>
                        <button
                          onClick={() => deleteBadHabit(habit.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--color-text-muted)', width: 24, height: 24 }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* 7-day clean tracker grid */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {last7Days.map((d) => {
                          const formattedD = format(d, 'yyyy-MM-dd');
                          const log = badHabitLogs.find((l) => l.habitId === habit.id && l.date === formattedD);
                          const occurred = log ? log.occurred : false;
                          const isToday = formattedD === todayStr;

                          return (
                            <button
                              key={formattedD}
                              onClick={() => toggleBadHabit(habit.id, formattedD, !occurred)}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '4px',
                                border: isToday ? '1.5px solid var(--color-text-muted)' : 'none',
                                background: occurred ? 'var(--color-rose)' : 'var(--color-success)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              title={`${format(d, 'EEEE, MMM d')}: ${occurred ? 'Slipped up' : 'Clean'}`}
                            />
                          );
                        })}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        {occurredToday ? 'Slipped today ❌' : 'Clean today ✔'}
                      </span>
                    </div>

                    {/* Slipped Up/Clean quick toggle for today */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleBadHabit(habit.id, todayStr, false)}
                        className="btn"
                        style={{
                          flex: 1,
                          fontSize: 12,
                          height: '32px',
                          background: !occurredToday ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                          color: !occurredToday ? '#ffffff' : 'var(--color-text-secondary)',
                          border: occurredToday ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        I Stayed Clean!
                      </button>
                      <button
                        onClick={() => toggleBadHabit(habit.id, todayStr, true)}
                        className="btn"
                        style={{
                          flex: 1,
                          fontSize: 12,
                          height: '32px',
                          background: occurredToday ? 'var(--color-rose)' : 'var(--color-bg-tertiary)',
                          color: occurredToday ? '#ffffff' : 'var(--color-text-secondary)',
                          border: !occurredToday ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        I Slipped Up
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Screen Time Charts */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Screen Time (Last 7 Days)</h3>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                {SCREENTIME_CATEGORIES.map((cat, idx) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={PRESET_COLORS[idx % PRESET_COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Screen Time Logs table */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-text-primary)' }}>Logged Sessions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {screentimeLogs.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '12px' }}>
                  No screen time logged yet.
                </div>
              ) : (
                [...screentimeLogs].reverse().map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{log.category}</span>
                      <span style={{ margin: '0 6px', color: 'var(--color-text-muted)' }}>•</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{log.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{log.hours}h</span>
                      <button
                        onClick={() => deleteScreentimeLog(log.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--color-text-muted)', width: 22, height: 22 }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Bad Habit Modal */}
      {isHabitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHabitModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Bad Habit</h3>
              <button onClick={() => setIsHabitModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSaveBadHabit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Bad Habit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Biting Nails, Doom Scrolling..."
                    value={bhName}
                    onChange={(e) => setBhName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Alert Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setBhColor(col)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: bhColor === col ? '2px solid white' : 'none',
                          background: col,
                          cursor: 'pointer',
                          boxShadow: bhColor === col ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsHabitModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Screen Time Modal */}
      {isScreenModalOpen && (
        <div className="modal-overlay" onClick={() => setIsScreenModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Log Screen Time (+3 XP)</h3>
              <button onClick={() => setIsScreenModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSaveScreentime}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Hours Used</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="24"
                      required
                      placeholder="E.g., 1.5"
                      value={stHours}
                      onChange={(e) => setStHours(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
                    <select
                      value={stCategory}
                      onChange={(e) => setStCategory(e.target.value)}
                      className="input"
                    >
                      {SCREENTIME_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Date</label>
                  <input
                    type="date"
                    required
                    value={stDate}
                    onChange={(e) => setStDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsScreenModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Log Usage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
