import React, { useState, useMemo } from 'react';
import { useNoteStore } from '../stores/noteStore';
import { useSettingsStore } from '../stores/settingsStore';
import { createNotionPage } from '../services/notionService';
import type { Note } from '../types';
import { Plus, Search, Pin, Archive, Trash2, Tag, BookOpen, Clock, ChevronRight, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function NotesPage() {
  const notes = useNoteStore((s) => s.notes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const togglePin = useNoteStore((s) => s.togglePin);
  const toggleArchive = useNoteStore((s) => s.toggleArchive);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Editor states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  // Notion integration states
  const notionApiKey = useSettingsStore((s) => s.notionApiKey);
  const defaultNotionDatabaseId = useSettingsStore((s) => s.notionDatabaseId);
  const defaultNotionParentType = useSettingsStore((s) => s.notionParentType);

  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [notionParentId, setNotionParentId] = useState('');
  const [notionParentType, setNotionParentType] = useState<'database' | 'page'>('database');
  const [exportingNotion, setExportingNotion] = useState(false);
  const [notionExportStatus, setNotionExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleExportToNotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !notionParentId.trim()) return;

    setExportingNotion(true);
    setNotionExportStatus(null);
    try {
      await createNotionPage(
        notionParentId.trim(),
        notionParentType,
        activeNote.title,
        activeNote.content
      );
      setNotionExportStatus({ type: 'success', message: 'Note exported to Notion successfully!' });
      setTimeout(() => {
        setIsNotionModalOpen(false);
        setNotionExportStatus(null);
      }, 2000);
    } catch (err: any) {
      setNotionExportStatus({ type: 'error', message: err.message || 'Failed to export note.' });
    } finally {
      setExportingNotion(false);
    }
  };

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || null;
  }, [activeNoteId, notes]);

  // Sync editor on note switch
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditTags(activeNote.tags.join(', '));
    } else {
      setEditTitle('');
      setEditContent('');
      setEditTags('');
    }
  }, [activeNoteId]);

  const handleCreateNote = () => {
    const newNote = addNote({
      title: 'Untitled Note',
      content: '',
      tags: []
    });
    setActiveNote(newNote.id);
  };

  const handleUpdate = () => {
    if (!activeNoteId) return;

    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    updateNote(activeNoteId, {
      title: editTitle || 'Untitled Note',
      content: editContent,
      tags: tagsArray
    });
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !selectedTag || n.tags.includes(selectedTag);
        const matchesArchive = n.archived === showArchived;
        return matchesSearch && matchesTag && matchesArchive;
      })
      .sort((a, b) => {
        // Pinned notes always first, then descending by updatedAt
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, search, selectedTag, showArchived]);

  // Gather all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [notes]);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, height: 'calc(100vh - 130px)' }}>
      
      {/* Left Panel: Note List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Search & Actions Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>Notes</h2>
            <button onClick={handleCreateNote} className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }}>
              <Plus size={14} /> New
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 30, paddingRight: 10, fontSize: 13, padding: '6px 12px 6px 30px' }}
            />
          </div>

          {/* Archive toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 6px', fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Archive size={12} /> {showArchived ? 'View Active' : 'View Archived'}
            </button>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear Tag Filter
              </button>
            )}
          </div>
        </div>

        {/* Tag filters bar */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="badge"
                style={{
                  background: selectedTag === tag ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                  color: selectedTag === tag ? 'white' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontSize: 10,
                  whiteSpace: 'nowrap'
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable list */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12 }}>No notes found.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={note.id}
                onClick={() => setActiveNote(note.id)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  background: activeNoteId === note.id ? 'var(--color-bg-tertiary)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <h4 style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}>
                    {note.title || 'Untitled Note'}
                  </h4>
                  {note.pinned && (
                    <Pin size={12} fill="var(--color-accent)" style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  )}
                </div>

                <p style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4
                }}>
                  {note.content || 'Empty note...'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: '70%' }}>
                    {note.tags.slice(0, 2).map((t) => (
                      <span key={t} style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} />
                    {format(new Date(note.updatedAt), 'MMM d')}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Editor Area */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {activeNote ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', gap: 16 }}>
            {/* Editor Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    togglePin(activeNote.id);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeNote.pinned ? 'var(--color-accent)' : 'inherit' }}
                >
                  <Pin size={13} fill={activeNote.pinned ? 'currentColor' : 'transparent'} />
                  {activeNote.pinned ? 'Pinned' : 'Pin'}
                </button>
                <button
                  onClick={() => {
                    toggleArchive(activeNote.id);
                    setActiveNote(null);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Archive size={13} />
                  {activeNote.archived ? 'Activate' : 'Archive'}
                </button>
                {notionApiKey && (
                  <button
                    onClick={() => {
                      setNotionParentId(defaultNotionDatabaseId || '');
                      setNotionParentType(defaultNotionParentType || 'database');
                      setIsNotionModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Export Note to Notion"
                  >
                    <div style={{ width: 12, height: 12, fontWeight: 'bold', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border-light)', borderRadius: 2 }}>N</div>
                    Export
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleUpdate}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={14} /> Save Changes
                </button>
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-rose)' }}
                  title="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Note Title Input */}
            <input
              type="text"
              placeholder="Note Title"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
              }}
              onBlur={handleUpdate}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-sans)'
              }}
            />

            {/* Note Tags Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <Tag size={13} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Add tags separated by commas (e.g. cybersecurity, exam, logic)"
                value={editTags}
                onChange={(e) => {
                  setEditTags(e.target.value);
                }}
                onBlur={handleUpdate}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  color: 'var(--color-text-primary)',
                  flex: 1,
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            {/* Editor Body Content */}
            <textarea
              placeholder="Start writing notes or markdown contents here..."
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
              }}
              onBlur={handleUpdate}
              style={{
                flexGrow: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: 'var(--color-text-primary)',
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', padding: 40, textAlign: 'center' }}>
            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>No Active Note</h3>
            <p style={{ fontSize: 13, maxWidth: 320, margin: '0 auto 16px', lineHeight: 1.4 }}>
              Select an existing note from the sidebar panel or write a brand new note.
            </p>
            <button onClick={handleCreateNote} className="btn btn-primary" style={{ gap: 6 }}>
              <Plus size={16} /> Create Note
            </button>
          </div>
        )}
      </div>

      {/* Notion Export Modal */}
      {isNotionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNotionModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, fontWeight: 'bold', fontSize: 13, background: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>N</div>
                Export Note to Notion
              </h3>
              <button onClick={() => setIsNotionModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleExportToNotion}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Export Target Type</label>
                  <select
                    value={notionParentType}
                    onChange={(e) => setNotionParentType(e.target.value as any)}
                    className="input"
                  >
                    <option value="database">Database</option>
                    <option value="page">Parent Page</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Notion {notionParentType === 'page' ? 'Page ID' : 'Database ID'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={notionParentType === 'page' ? 'Enter Parent Page ID...' : 'Enter Database ID...'}
                    value={notionParentId}
                    onChange={(e) => setNotionParentId(e.target.value)}
                    className="input"
                  />
                </div>

                {notionExportStatus && (
                  <div style={{
                    background: notionExportStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: notionExportStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    fontSize: 12,
                    color: notionExportStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {notionExportStatus.message}
                  </div>
                )}

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsNotionModalOpen(false)} className="btn btn-secondary" disabled={exportingNotion}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={exportingNotion}>
                  {exportingNotion ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
