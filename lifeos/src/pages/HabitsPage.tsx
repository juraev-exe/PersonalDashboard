import React, { useState, useMemo } from 'react';
import { useHabitStore } from '../stores/habitStore';
import type { Habit } from '../types';
import { Plus, Repeat, Flame, Trash2, Edit3, Archive, Check, Calendar, HelpCircle, Award, Activity, GlassWater, BookOpen, Moon, Terminal, Shield, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';

const PRESET_ICONS = [
  { name: 'Activity', component: Activity },
  { name: 'GlassWater', component: GlassWater },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Moon', component: Moon },
  { name: 'Terminal', component: Terminal },
  { name: 'Shield', component: Shield },
  { name: 'Trophy', component: Trophy },
];

const PRESET_COLORS = [
  { name: 'Green', value: '#3fb950' },
  { name: 'Blue', value: '#58a6ff' },
  { name: 'Gold', value: '#d29922' },
  { name: 'Red', value: '#f85149' },
  { name: 'Purple', value: '#a371f7' },
  { name: 'Lime', value: '#56d364' },
];

export default function HabitsPage() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const toggleHabitDay = useHabitStore((s) => s.toggleHabitDay);
  const getHabitCompletionForDate = useHabitStore((s) => s.getHabitCompletionForDate);
  const getStreak = useHabitStore((s) => s.getStreak);
  const getCompletionPercentage = useHabitStore((s) => s.getCompletionPercentage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Activity');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [dailyTarget, setDailyTarget] = useState(1);
  const [color, setColor] = useState('#3fb950');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // Last 7 days helper
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(subDays(new Date(), i));
    }
    return dates;
  }, []);

  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits]);
  const archivedHabits = useMemo(() => habits.filter(h => h.archived), [habits]);

  const todayProgress = useMemo(() => getCompletionPercentage(todayStr), [logs, habits]);

  const resetForm = () => {
    setName('');
    setIcon('Activity');
    setFrequency('daily');
    setDailyTarget(1);
    setColor('#3fb950');
    setEditingHabit(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setIcon(habit.icon);
    setFrequency(habit.frequency);
    setDailyTarget(habit.dailyTarget);
    setColor(habit.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name,
      icon,
      frequency,
      dailyTarget,
      color,
    };

    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const getIconComponent = (iconName: string) => {
    const preset = PRESET_ICONS.find((pi) => pi.name === iconName);
    return preset ? preset.component : Activity;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Habit Tracker</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Build routines, track streaks, and levels up your discipline.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ gap: '6px' }}>
          <Plus size={18} /> New Habit
        </button>
      </div>

      {/* Progress Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Today's Performance</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
            {todayProgress === 100 ? "Amazing! You completed all active habits today! 🌟" : todayProgress > 50 ? "Over halfway there! Keep it up! 💪" : "Start completing habits to build your streaks! 🔥"}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="progress-bar" style={{ height: 10, flex: 1 }}>
              <div className="progress-bar-fill" style={{ width: `${todayProgress}%`, background: 'linear-gradient(90deg, var(--color-accent), var(--color-emerald))' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, minWidth: 42, textAlign: 'right' }}>{todayProgress}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
          <div style={{ background: 'var(--color-bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Completed Today</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {activeHabits.filter(h => getHabitCompletionForDate(h.id, todayStr)).length} <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>/ {activeHabits.length}</span>
            </div>
          </div>
          <div style={{ background: 'var(--color-bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Longest Streak</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Flame size={20} fill="currentColor" />
              {Math.max(...habits.map((h) => getStreak(h.id)), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Habits</h3>
        {activeHabits.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Repeat size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>No habits created yet.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Add study plans, reading, exercise, or hydration to keep going.</p>
            <button onClick={handleOpenAddModal} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
              Add First Habit
            </button>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}
          >
            {activeHabits.map((habit) => {
              const Icon = getIconComponent(habit.icon);
              const completedToday = getHabitCompletionForDate(habit.id, todayStr);
              const streak = getStreak(habit.id);

              return (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  key={habit.id} 
                  className="glass-card" 
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  
                  {/* Top header of Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 'var(--radius-md)',
                        background: `${habit.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={22} style={{ color: habit.color }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{habit.name}</h4>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                          <Repeat size={10} /> {habit.frequency}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 12, fontWeight: 700, color: 'var(--color-amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 12 }}>
                        <Flame size={14} fill="currentColor" /> {streak}d
                      </div>
                      <button onClick={() => handleOpenEditModal(habit)} className="btn btn-ghost btn-icon btn-sm" style={{ width: 28, height: 28 }} title="Edit">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => updateHabit(habit.id, { archived: true })} className="btn btn-ghost btn-icon btn-sm" style={{ width: 28, height: 28 }} title="Archive">
                        <Archive size={12} />
                      </button>
                    </div>
                  </div>

                  {/* 7-day Tracker Grid */}
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', marginBottom: 8, fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {last7Days.map((d) => (
                        <div key={d.toISOString()} style={{ width: 24, textAlign: 'center' }}>
                          {format(d, 'EE').charAt(0)}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                      {last7Days.map((d) => {
                        const formattedD = format(d, 'yyyy-MM-dd');
                        const isDone = getHabitCompletionForDate(habit.id, formattedD);
                        const isToday = formattedD === todayStr;

                        return (
                          <button
                            key={formattedD}
                            onClick={() => toggleHabitDay(habit.id, formattedD)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              border: isToday ? `1.5px solid ${habit.color}` : '1px solid transparent',
                              background: isDone ? habit.color : 'var(--color-heat-0)',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            title={`${format(d, 'EEEE, MMM d')}: ${isDone ? 'Completed' : 'Not completed'}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Complete button for today */}
                  <button
                    onClick={() => toggleHabitDay(habit.id, todayStr)}
                    className="btn"
                    style={{
                      width: '100%',
                      background: completedToday ? 'var(--color-bg-tertiary)' : habit.color,
                      color: completedToday ? 'var(--color-text-secondary)' : 'white',
                      border: completedToday ? '1px solid var(--color-border)' : 'none',
                      fontWeight: 600,
                      gap: '6px',
                    }}
                  >
                    {completedToday ? (
                      <>
                        <Check size={16} /> Completed Today (+5 XP)
                      </>
                    ) : (
                      <>
                        Mark Today Completed (+5 XP)
                      </>
                    )}
                  </button>

                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Archive Habits section */}
      {archivedHabits.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)' }}>Archived Habits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {archivedHabits.map((habit) => (
              <div key={habit.id} className="glass-card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{habit.name}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => updateHabit(habit.id, { archived: false })} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: 11 }}>
                    Restore
                  </button>
                  <button onClick={() => deleteHabit(habit.id)} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px', color: 'var(--color-rose)' }} title="Delete Permanently">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Habit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Habit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Read Research Papers, Stay Hydrated..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Choose Icon</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PRESET_ICONS.map((pi) => {
                      const IconComp = pi.component;
                      return (
                        <button
                          key={pi.name}
                          type="button"
                          onClick={() => setIcon(pi.name)}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            border: icon === pi.name ? `2px solid ${color}` : '1px solid var(--color-border)',
                            background: icon === pi.name ? `${color}15` : 'var(--color-bg-tertiary)',
                            color: icon === pi.name ? color : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Choose Theme Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {PRESET_COLORS.map((pc) => (
                      <button
                        key={pc.name}
                        type="button"
                        onClick={() => setColor(pc.value)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: color === pc.value ? '2px solid white' : 'none',
                          background: pc.value,
                          cursor: 'pointer',
                          boxShadow: color === pc.value ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none',
                        }}
                        title={pc.name}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="input"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Daily Goal Count</label>
                    <input
                      type="number"
                      min="1"
                      value={dailyTarget}
                      onChange={(e) => setDailyTarget(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: color }}>Save Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
