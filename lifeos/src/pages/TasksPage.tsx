import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { TaskStatus, TaskPriority, TaskCategory, type Task } from '../types';
import { Plus, List, Kanban, Search, Filter, ArrowUpDown, Calendar, Trash2, Edit3, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const completeTask = useTaskStore((s) => s.completeTask);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.PROGRAMMING);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(TaskCategory.PROGRAMMING);
    setPriority(TaskPriority.MEDIUM);
    setDueDate('');
    setRecurring(false);
    setRecurringPattern('weekly');
    setEditingTask(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate || '');
    setRecurring(task.recurring);
    setRecurringPattern(task.recurringPattern || 'weekly');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      description,
      status: editingTask ? editingTask.status : TaskStatus.TODO,
      priority,
      category,
      dueDate: dueDate || undefined,
      recurring,
      recurringPattern: recurring ? recurringPattern : undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      if (status === TaskStatus.COMPLETED) {
        completeTask(taskId);
      } else {
        updateTask(taskId, { status });
      }
    }
  };

  // Filter & Sort logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority') {
          const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, search, categoryFilter, priorityFilter, statusFilter, sortBy]);

  // Kanban tasks
  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === TaskStatus.TODO), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.status === TaskStatus.COMPLETED), [filteredTasks]);

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.URGENT: return 'rose';
      case TaskPriority.HIGH: return 'amber';
      case TaskPriority.MEDIUM: return 'accent';
      case TaskPriority.LOW: return 'emerald';
      default: return 'accent';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Tasks</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Organize, schedule, and execute your study and work items.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ gap: '6px' }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filter and View toolbar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flexGrow: 1 }}>
          <div style={{ position: 'relative', minWidth: '200px', flexGrow: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 36 }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="all">All Categories</option>
            {Object.values(TaskCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="all">All Priorities</option>
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>

          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input"
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Date Created</option>
          </select>
        </div>

        {/* View toggles */}
        <div style={{ display: 'flex', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 3, border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: viewMode === 'list' ? 'var(--color-bg-card)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: viewMode === 'kanban' ? 'var(--color-bg-card)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Kanban size={16} /> Kanban
          </button>
        </div>

      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: '8px', display: 'flex', flexDirection: 'column' }}
          >
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <Clock size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>No tasks found matching current filters.</p>
                <button onClick={handleOpenAddModal} className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                  Create one now
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600 }}>
                      <th style={{ padding: '12px 16px', width: 40 }}></th>
                      <th style={{ padding: '12px 16px' }}>Task Description</th>
                      <th style={{ padding: '12px 16px', width: 140 }}>Category</th>
                      <th style={{ padding: '12px 16px', width: 100 }}>Priority</th>
                      <th style={{ padding: '12px 16px', width: 120 }}>Due Date</th>
                      <th style={{ padding: '12px 16px', width: 100, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={task.id}
                        className="transition-colors duration-200"
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          background: task.status === TaskStatus.COMPLETED ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() => task.status !== TaskStatus.COMPLETED && completeTask(task.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: task.status === TaskStatus.COMPLETED ? 'default' : 'pointer',
                              color: task.status === TaskStatus.COMPLETED ? 'var(--color-emerald)' : 'var(--color-text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <CheckCircle
                              size={20}
                              fill={task.status === TaskStatus.COMPLETED ? 'currentColor' : 'transparent'}
                              stroke="currentColor"
                            />
                          </button>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>
                            <div style={{
                              fontSize: 14,
                              fontWeight: 600,
                              textDecoration: task.status === TaskStatus.COMPLETED ? 'line-through' : 'none',
                              color: task.status === TaskStatus.COMPLETED ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                            }}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                {task.description}
                              </div>
                            )}
                            {task.recurring && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-accent)', marginTop: 6, fontWeight: 500 }}>
                                <RefreshCw size={10} /> Recurring ({task.recurringPattern})
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge badge-accent" style={{ fontSize: 11 }}>
                            {task.category}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge badge-${getPriorityColor(task.priority)}`} style={{ fontSize: 11, textTransform: 'capitalize' }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED ? 'var(--color-rose)' : 'var(--color-text-secondary)' }}>
                            <Calendar size={14} />
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No Date'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => handleOpenEditModal(task)} className="btn btn-ghost btn-icon btn-sm" title="Edit Task">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-rose)' }} title="Delete Task">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          /* Kanban Board */
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', minHeight: 500 }}
          >
            {/* Columns */}
            {[
              { status: TaskStatus.TODO, title: 'To Do', tasks: todoTasks, color: 'var(--color-accent)' },
              { status: TaskStatus.IN_PROGRESS, title: 'In Progress', tasks: inProgressTasks, color: 'var(--color-cyan)' },
              { status: TaskStatus.COMPLETED, title: 'Completed', tasks: completedTasks, color: 'var(--color-emerald)' },
            ].map((col) => (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className="glass-card"
                style={{
                  padding: '16px',
                  background: 'var(--color-bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: 450,
                  borderTop: `4px solid ${col.color}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                    {col.title}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                    {col.tasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flexGrow: 1, maxHeight: 600, paddingRight: 2 }}>
                  {col.tasks.length === 0 ? (
                    <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '30px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      Drag tasks here
                    </div>
                  ) : (
                    col.tasks.map((task) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={task.id}
                        draggable={task.status !== TaskStatus.COMPLETED}
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                        className="glass-card"
                        style={{
                          padding: '14px',
                          background: 'var(--color-bg-tertiary)',
                          cursor: task.status === TaskStatus.COMPLETED ? 'default' : 'grab',
                          opacity: task.status === TaskStatus.COMPLETED ? 0.75 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: '10px' }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: task.status === TaskStatus.COMPLETED ? 'line-through' : 'none',
                            color: 'var(--color-text-primary)'
                          }}>
                            {task.title}
                          </div>
                          {task.status !== TaskStatus.COMPLETED && (
                            <button
                              onClick={() => completeTask(task.id)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                              title="Mark Complete"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {task.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 10 }}>
                          <span className="badge badge-accent" style={{ fontSize: 9 }}>
                            {task.category}
                          </span>
                          <span className={`badge badge-${getPriorityColor(task.priority)}`} style={{ fontSize: 9, textTransform: 'capitalize' }}>
                            {task.priority}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 10, color: 'var(--color-text-muted)' }}>
                            <Calendar size={12} />
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleOpenEditModal(task)} className="btn btn-ghost btn-icon btn-sm" style={{ width: 22, height: 22 }} title="Edit">
                              <Edit3 size={11} />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="btn btn-ghost btn-icon btn-sm" style={{ width: 22, height: 22, color: 'var(--color-rose)' }} title="Delete">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter task title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description</label>
                  <textarea
                    placeholder="Add optional notes or descriptions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TaskCategory)}
                      className="input"
                    >
                      {Object.values(TaskCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="input"
                    >
                      {Object.values(TaskPriority).map((p) => (
                        <option key={p} value={p}>{p.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13, color: 'var(--color-text-primary)', cursor: 'pointer', marginTop: 16 }}>
                      <input
                        type="checkbox"
                        checked={recurring}
                        onChange={(e) => setRecurring(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      Recurring Task
                    </label>
                  </div>
                </div>

                {recurring && (
                  <div className="animate-fade-in" style={{ background: 'var(--color-bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Repeat Pattern</label>
                    <select
                      value={recurringPattern}
                      onChange={(e) => setRecurringPattern(e.target.value as any)}
                      className="input"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
