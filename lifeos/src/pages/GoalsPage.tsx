// ============================================
// LifeOS — Goals Tracking Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useGoalStore } from '../stores/goalStore';
import type { Goal } from '../types';
import { Target, Plus, Trophy, Clock, Trash2, Edit3, CheckCircle, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function GoalsPage() {
  const goals = useGoalStore((s) => s.goals);
  const loadGoals = useGoalStore((s) => s.loadGoals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState(100);
  const [currentValue, setCurrentValue] = useState(0);
  const [unit, setUnit] = useState('%');
  const [category, setCategory] = useState('Personal');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setTargetValue(100);
    setCurrentValue(0);
    setUnit('%');
    setCategory('Personal');
    setDeadline('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setTargetValue(goal.targetValue);
    setCurrentValue(goal.currentValue);
    setUnit(goal.unit);
    setCategory(goal.category);
    setDeadline(goal.deadline || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      targetValue,
      currentValue,
      unit,
      category,
      deadline: deadline || undefined,
      status: (currentValue >= targetValue ? 'completed' : 'active') as any,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Life Goals</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Track your long-term objectives and vision.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={14} /> Add New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {goals.map((goal) => {
          const progress = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
          const isCompleted = goal.status === 'completed';

          return (
            <motion.div
              layout
              key={goal.id}
              className="glass-card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? 'var(--color-emerald)' : 'var(--color-text-secondary)',
                  }}>
                    {isCompleted ? <Trophy size={20} /> : <Target size={20} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{goal.title}</h3>
                    <span className="badge" style={{ fontSize: 10 }}>{goal.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleOpenEdit(goal)} className="btn btn-icon btn-ghost btn-sm"><Edit3 size={14} /></button>
                  <button onClick={() => deleteGoal(goal.id)} className="btn btn-icon btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', minHeight: 40 }}>{goal.description}</p>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Progress</span>
                  <span style={{ fontWeight: 600 }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${progress}%`,
                      background: isCompleted ? 'var(--color-emerald)' : 'var(--color-accent)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {goal.deadline ? `Deadline: ${format(new Date(goal.deadline), 'MMM d, yyyy')}` : 'No deadline'}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: isCompleted ? 'var(--color-emerald)' : 'var(--color-text-primary)' }}>
                    {progress}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Target size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p>No goals set yet. Start by defining your first objective!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 450 }}
            >
              <div className="modal-header">
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Goal Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Master React & TS" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Describe your vision..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target Value</label>
                      <input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} className="input" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Current Value</label>
                      <input type="number" value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))} className="input" required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Unit</label>
                      <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="input" placeholder="%, hrs, pages..." />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                        <option>Personal</option>
                        <option>Study</option>
                        <option>Health</option>
                        <option>Career</option>
                        <option>Finance</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Deadline (Optional)</label>
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Goal</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
