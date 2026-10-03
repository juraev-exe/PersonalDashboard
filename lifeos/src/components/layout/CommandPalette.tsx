// ============================================
// LifeOS — Executive Command Palette (Ctrl+K)
// Raycast / Linear inspired design
// ============================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Timer,
  CheckSquare,
  Sun,
  Moon,
  RefreshCw,
  FolderKanban,
  FileText,
  Calendar,
  Flame,
  DollarSign,
  Shield,
  Settings,
  ArrowRight,
  Plus,
  Layers,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTaskStore } from '../../stores/taskStore';
import { useHabitStore } from '../../stores/habitStore';
import { useNoteStore } from '../../stores/noteStore';
import { useProjectStore } from '../../stores/projectStore';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Navigation' | 'Tasks' | 'Notes' | 'Projects';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  shortcut?: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const openIntegrationsModal = useSettingsStore((s) => s.openIntegrationsModal);
  const syncFromNotion = useTaskStore((s) => s.syncFromNotion);
  const syncFromMicrosoftTodo = useTaskStore((s) => s.syncFromMicrosoftTodo);
  const notionApiKey = useSettingsStore((s) => s.notionApiKey);
  const microsoftAccessToken = useSettingsStore((s) => s.microsoftAccessToken);

  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const notes = useNoteStore((s) => s.notes);
  const projects = useProjectStore((s) => s.projects);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global actions and navigation items
  const baseCommands = useMemo<CommandItem[]>(() => {
    return [
      // Quick Actions
      {
        id: 'action-focus',
        title: 'Start Deep Focus Session',
        subtitle: 'Launch 25-minute Pomodoro timer',
        category: 'Actions',
        icon: Timer,
        action: () => {
          navigate('/focus');
          onClose();
        },
        shortcut: 'F',
      },
      {
        id: 'action-new-task',
        title: 'Create New Task',
        subtitle: 'Add task to inbox',
        category: 'Actions',
        icon: Plus,
        action: () => {
          navigate('/tasks');
          onClose();
        },
        shortcut: 'N',
      },
      {
        id: 'action-sync',
        title: 'Sync Notion & Microsoft To Do',
        subtitle: (notionApiKey || microsoftAccessToken) ? 'Pull latest updates now' : 'Configure integration keys',
        category: 'Actions',
        icon: RefreshCw,
        action: () => {
          if (!notionApiKey && !microsoftAccessToken) {
            openIntegrationsModal();
          } else {
            if (notionApiKey) syncFromNotion();
            if (microsoftAccessToken) syncFromMicrosoftTodo();
          }
          onClose();
        },
        shortcut: 'S',
      },
      {
        id: 'action-theme',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle interface theme',
        category: 'Actions',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          toggleTheme();
          onClose();
        },
        shortcut: 'T',
      },

      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        subtitle: 'Executive overview & widgets',
        category: 'Navigation',
        icon: Layers,
        action: () => {
          navigate('/');
          onClose();
        },
      },
      {
        id: 'nav-tasks',
        title: 'Tasks Board',
        subtitle: `${tasks.filter((t) => t.status !== 'completed').length} pending tasks`,
        category: 'Navigation',
        icon: CheckSquare,
        action: () => {
          navigate('/tasks');
          onClose();
        },
      },
      {
        id: 'nav-habits',
        title: 'Habits & Streaks',
        subtitle: `${habits.filter((h) => !h.archived).length} active daily habits`,
        category: 'Navigation',
        icon: Flame,
        action: () => {
          navigate('/habits');
          onClose();
        },
      },
      {
        id: 'nav-projects',
        title: 'Projects',
        subtitle: `${projects.filter((p) => p.status === 'active').length} active projects`,
        category: 'Navigation',
        icon: FolderKanban,
        action: () => {
          navigate('/projects');
          onClose();
        },
      },
      {
        id: 'nav-calendar',
        title: 'Calendar & Schedule',
        subtitle: 'Events and day planner',
        category: 'Navigation',
        icon: Calendar,
        action: () => {
          navigate('/calendar');
          onClose();
        },
      },
      {
        id: 'nav-notes',
        title: 'Notes & Documents',
        subtitle: `${notes.length} total notes`,
        category: 'Navigation',
        icon: FileText,
        action: () => {
          navigate('/notes');
          onClose();
        },
      },
      {
        id: 'nav-finance',
        title: 'Finance & Budget',
        subtitle: 'Cashflow and expenses',
        category: 'Navigation',
        icon: DollarSign,
        action: () => {
          navigate('/finance');
          onClose();
        },
      },
      {
        id: 'nav-detox',
        title: 'Digital Detox',
        subtitle: 'Focus and screen hygiene',
        category: 'Navigation',
        icon: Shield,
        action: () => {
          navigate('/detox');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        subtitle: 'Preferences and data management',
        category: 'Navigation',
        icon: Settings,
        action: () => {
          navigate('/settings');
          onClose();
        },
      },
    ];
  }, [navigate, onClose, theme, toggleTheme, notionApiKey, microsoftAccessToken, openIntegrationsModal, syncFromNotion, syncFromMicrosoftTodo, tasks, habits, projects, notes]);

  // Live item searches (tasks, notes, projects)
  const dynamicCommands = useMemo<CommandItem[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedTasks: CommandItem[] = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        subtitle: `Task · ${t.priority.toUpperCase()} · ${t.status}`,
        category: 'Tasks',
        icon: CheckSquare,
        action: () => {
          navigate('/tasks');
          onClose();
        },
      }));

    const matchedNotes: CommandItem[] = notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .slice(0, 3)
      .map((n) => ({
        id: `note-${n.id}`,
        title: n.title,
        subtitle: `Note · Updated ${new Date(n.updatedAt).toLocaleDateString()}`,
        category: 'Notes',
        icon: FileText,
        action: () => {
          navigate('/notes');
          onClose();
        },
      }));

    const matchedProjects: CommandItem[] = projects
      .filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.title,
        subtitle: `Project · ${p.progress}% completed`,
        category: 'Projects',
        icon: FolderKanban,
        action: () => {
          navigate('/projects');
          onClose();
        },
      }));

    return [...matchedTasks, ...matchedNotes, ...matchedProjects];
  }, [query, tasks, notes, projects, navigate, onClose]);

  // Combined filtered results
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return baseCommands;
    const q = query.toLowerCase();
    const matchedBase = baseCommands.filter(
      (c) => c.title.toLowerCase().includes(q) || (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );
    return [...dynamicCommands, ...matchedBase];
  }, [query, baseCommands, dynamicCommands]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Auto-scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -12 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-[#12151e] dark:bg-[#12151e] light:bg-white text-slate-100 border border-slate-700/50 shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search tasks, notes, projects..."
                className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono rounded bg-foreground/5 text-muted-foreground border border-border/50">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-3">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No matching commands or items found for "{query}"
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <div className="px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
                      {category}
                    </div>
                    {items.map((cmd) => {
                      const itemIndex = filteredCommands.findIndex((c) => c.id === cmd.id);
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <div
                          key={cmd.id}
                          data-index={itemIndex}
                          onClick={() => cmd.action()}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                            isSelected
                              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                              : 'text-foreground/90 hover:bg-foreground/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-foreground/5 text-muted-foreground'
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-[13.5px] truncate">{cmd.title}</div>
                              {cmd.subtitle && (
                                <div className="text-[11.5px] text-muted-foreground truncate">{cmd.subtitle}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {cmd.shortcut && (
                              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-foreground/10 text-muted-foreground border border-border/50">
                                {cmd.shortcut}
                              </kbd>
                            )}
                            {isSelected && <ArrowRight size={13} className="text-blue-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 text-[11px] text-muted-foreground border-t border-border/40 bg-foreground/[0.02]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono text-[10px] bg-foreground/5 px-1 py-0.5 rounded border border-border/40">↑</kbd>
                  <kbd className="font-mono text-[10px] bg-foreground/5 px-1 py-0.5 rounded border border-border/40">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono text-[10px] bg-foreground/5 px-1 py-0.5 rounded border border-border/40">↵</kbd>
                  <span>select</span>
                </span>
              </div>
              <span className="font-mono">LifeOS Command Center</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
