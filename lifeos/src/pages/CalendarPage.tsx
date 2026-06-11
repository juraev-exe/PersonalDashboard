import React, { useState, useMemo } from 'react';
import { useCalendarStore } from '../stores/calendarStore';
import { useTaskStore } from '../stores/taskStore';
import { useProjectStore } from '../stores/projectStore';
import type { CalendarEvent } from '../types';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, Bookmark, List, Trash2, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

export default function CalendarPage() {
  const customEvents = useCalendarStore((s) => s.events);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);

  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'task' | 'exam' | 'deadline' | 'event' | 'study_plan'>('event');
  const [color, setColor] = useState('#6c63ff');
  const [time, setTime] = useState('');

  // Synthesize events from tasks and projects
  const allEvents = useMemo(() => {
    const eventsList: Array<CalendarEvent & { isGenerated?: boolean; originalId?: string }> = [
      ...customEvents.map(e => ({ ...e, isGenerated: false }))
    ];

    // Add tasks
    tasks.forEach(t => {
      if (t.dueDate) {
        eventsList.push({
          id: `task-${t.id}`,
          originalId: t.id,
          title: `Task: ${t.title}`,
          description: t.description,
          date: t.dueDate,
          type: 'task',
          color: t.status === 'completed' ? '#10b981' : '#06b6d4',
          isGenerated: true
        });
      }
    });

    // Add projects
    projects.forEach(p => {
      if (p.deadline) {
        eventsList.push({
          id: `proj-${p.id}`,
          originalId: p.id,
          title: `Project: ${p.title} (Deadline)`,
          description: p.description,
          date: p.deadline,
          type: 'deadline',
          color: '#f59e0b',
          isGenerated: true
        });
      }
    });

    return eventsList;
  }, [customEvents, tasks, projects]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(e => isSameDay(new Date(e.date), date));
  };

  const selectedDayEvents = useMemo(() => {
    return getEventsForDate(selectedDate);
  }, [selectedDate, allEvents]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title,
      description: description || undefined,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: time || undefined,
      type,
      color
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setTime('');
  };

  const getEventBadgeColor = (t: string) => {
    switch (t) {
      case 'task': return 'badge-cyan';
      case 'exam': return 'badge-rose';
      case 'deadline': return 'badge-amber';
      case 'study_plan': return 'badge-accent';
      default: return 'badge-violet';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
      
      {/* Left Column: Calendar Grid */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Navigation header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Double click a cell to add a calendar event
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleToday} className="btn btn-secondary btn-sm">
              Today
            </button>
            <button onClick={handlePrevMonth} className="btn btn-secondary btn-icon btn-sm" style={{ width: 30, height: 30 }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth} className="btn btn-secondary btn-icon btn-sm" style={{ width: 30, height: 30 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Days of week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 10, fontWeight: 700, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ padding: '8px 0' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            {calendarDays.map((day, idx) => {
              const events = getEventsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  onDoubleClick={() => {
                    setSelectedDate(day);
                    setIsModalOpen(true);
                  }}
                  style={{
                    minHeight: 96,
                    padding: 8,
                    background: isSelected 
                      ? 'var(--color-bg-hover)' 
                      : isToday 
                        ? 'rgba(108, 99, 255, 0.05)'
                        : 'var(--color-bg-card)',
                    color: isCurrentMonth ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.1s',
                    position: 'relative',
                    border: isToday ? '1px solid var(--color-accent)' : 'none'
                  }}
                >
                  {/* Day Number */}
                  <span style={{
                    fontWeight: isToday || isSelected ? 700 : 400,
                    alignSelf: 'flex-end',
                    background: isToday ? 'var(--color-accent)' : 'transparent',
                    color: isToday ? 'white' : 'inherit',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10
                  }}>
                    {format(day, 'd')}
                  </span>

                  {/* Events dots / preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, overflow: 'hidden', maxHeight: 52 }}>
                    {events.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        style={{
                          fontSize: 9,
                          padding: '2px 4px',
                          borderRadius: 3,
                          background: `${e.color}15`,
                          color: e.color,
                          borderLeft: `2px solid ${e.color}`,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          fontWeight: 600
                        }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div style={{ fontSize: 8, color: 'var(--color-text-muted)', paddingLeft: 4, fontWeight: 600 }}>
                        + {events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Day Events & Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Selected Day View */}
        <div className="glass-card" style={{ padding: '20px', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {format(selectedDate, 'eeee')}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {format(selectedDate, 'MMM d, yyyy')}
              </p>
            </div>
            
            <button onClick={() => setIsModalOpen(true)} className="btn btn-ghost btn-icon btn-sm" title="Add Event">
              <Plus size={18} />
            </button>
          </div>

          {/* List of events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1, overflowY: 'auto', maxHeight: 420 }}>
            {selectedDayEvents.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                <Calendar size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>No events scheduled.</p>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>
                  Add Event
                </button>
              </div>
            ) : (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    padding: '12px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${event.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {event.title}
                    </span>
                    
                    {!event.isGenerated && (
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ width: 20, height: 20, color: 'var(--color-rose)', flexShrink: 0 }}
                        title="Delete Event"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {event.description && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <span className={`badge ${getEventBadgeColor(event.type)}`} style={{ fontSize: 9, textTransform: 'capitalize' }}>
                      {event.type.replace('_', ' ')}
                    </span>
                    {event.startTime && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {event.startTime}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Calendar Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Calendar Event</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Date</label>
                  <div style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--color-text-primary)' }}>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Cybersecurity Exam, Team Meeting..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description</label>
                  <textarea
                    placeholder="Enter event details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Event Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="input"
                    >
                      <option value="event">General Event</option>
                      <option value="exam">Exam</option>
                      <option value="study_plan">Study Plan</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Start Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Label Color</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['#6c63ff', '#10b981', '#06b6d4', '#f43f5e', '#f59e0b', '#8b5cf6'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColor(col)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: color === col ? '2px solid white' : 'none',
                          background: col,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
