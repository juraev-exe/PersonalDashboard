// ============================================
// LifeOS — Daily Journal Page
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { format, subDays, addDays, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Save, Trash2, Smile, Meh, Frown, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
  { icon: Smile, label: 'Great', color: '#3fb950', value: 'great' },
  { icon: Meh, label: 'Okay', color: '#58a6ff', value: 'okay' },
  { icon: Frown, label: 'Bad', color: '#f85149', value: 'bad' },
];

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const entries = useJournalStore((s) => s.entries);
  const loadEntries = useJournalStore((s) => s.loadEntries);
  const saveEntry = useJournalStore((s) => s.saveEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const currentEntry = useMemo(() => entries.find(e => e.date === dateStr), [entries, dateStr]);

  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (currentEntry) {
      setContent(currentEntry.content);
      setMood(currentEntry.mood);
      setLastSaved(new Date(currentEntry.updatedAt));
    } else {
      setContent('');
      setMood(undefined);
      setLastSaved(null);
    }
  }, [currentEntry, dateStr]);

  const handleSave = () => {
    setIsSaving(true);
    saveEntry(dateStr, content, mood);
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleDelete = () => {
    if (currentEntry && confirm('Are you sure you want to delete this journal entry?')) {
      deleteEntry(currentEntry.id);
      setContent('');
      setMood(undefined);
    }
  };

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handlePrevDay} className="btn btn-icon btn-secondary">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNextDay} className="btn btn-icon btn-secondary">
              <ChevronRight size={18} />
            </button>
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {format(selectedDate, 'MMMM yyyy')}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!isToday(selectedDate) && (
            <button onClick={handleToday} className="btn btn-secondary btn-sm">Today</button>
          )}
          {lastSaved && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} /> Saved {format(lastSaved, 'HH:mm')}
            </span>
          )}
          <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: 500 }}>
        
        {/* Mood Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>How are you feeling today?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {moods.map((m) => {
              const Icon = m.icon;
              const isSelected = mood === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? m.color : 'var(--color-border)',
                    background: isSelected ? `${m.color}15` : 'transparent',
                    color: isSelected ? m.color : 'var(--color-text-muted)',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Editor */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your day, achievements, or any thoughts..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontSize: 16,
            lineHeight: 1.6,
            resize: 'none',
            fontFamily: 'var(--font-sans)',
            padding: '8px 0',
          }}
        />

        {/* Footer info */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Tag size={12} /> Add tags
            </button>
          </div>
          
          {currentEntry && (
            <button onClick={handleDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}>
              <Trash2 size={12} /> Delete Entry
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
