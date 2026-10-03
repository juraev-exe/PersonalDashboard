// ============================================
// LifeOS — Executive Dashboard
// Industrial Precision Design System
// ============================================

import React, { useMemo, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isToday, parseISO } from 'date-fns';
import {
  Timer,
  CheckSquare,
  Check,
  Flame,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  RefreshCw,
  FolderKanban,
  Zap,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Calendar,
  Volume2,
  VolumeX,
  Play,
  Square,
  Activity,
  Settings,
  Music,
  Plus,
} from 'lucide-react';
import DraggableWidgetGrid, {
  type WidgetItem,
  type WidgetSize,
} from '@/components/ui/draggable-widget-grid';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useTaskStore } from '../stores/taskStore';
import { useHabitStore } from '../stores/habitStore';
import { useProjectStore } from '../stores/projectStore';
import { useCalendarStore } from '../stores/calendarStore';
import { useSettingsStore } from '../stores/settingsStore';
import { TaskStatus, TaskPriority, ProjectStatus, TaskCategory, type CalendarEvent } from '../types';
import { getUpcomingEvents } from '../services/googleCalendarService';
import { getRandomQuote } from '../data/quotes';

/* ------------------------------------------------------------------ *
 * Widget Definitions & Default Arrangement
 * ------------------------------------------------------------------ */

export type DashboardWidgetKind =
  | 'performance'
  | 'focus-time'
  | 'tasks-progress'
  | 'calendar-event'
  | 'daily-habits'
  | 'ambient-audio'
  | 'scratchpad'
  | 'data-sync'
  | 'today-tasks'
  | 'active-projects'
  | 'weather'
  | 'mindset';

export interface DashboardWidget extends WidgetItem {
  kind: DashboardWidgetKind;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'performance', kind: 'performance', size: 'wide', label: 'Performance Summary' },
  { id: 'calendar-event', kind: 'calendar-event', size: 'sm', label: 'Upcoming Schedule' },
  { id: 'focus-time', kind: 'focus-time', size: 'sm', label: 'Focus Time' },
  { id: 'tasks-progress', kind: 'tasks-progress', size: 'sm', label: 'Task Execution' },
  { id: 'daily-habits', kind: 'daily-habits', size: 'sm', label: 'Daily Habits' },
  { id: 'ambient-audio', kind: 'ambient-audio', size: 'sm', label: 'Focus Soundscape' },
  { id: 'data-sync', kind: 'data-sync', size: 'sm', label: 'Data Sync' },
  { id: 'scratchpad', kind: 'scratchpad', size: 'wide', label: 'Quick Scratchpad' },
  { id: 'today-tasks', kind: 'today-tasks', size: 'wide', label: "Today's Priorities" },
  { id: 'active-projects', kind: 'active-projects', size: 'wide', label: 'Active Projects' },
  { id: 'weather', kind: 'weather', size: 'sm', label: 'Local Weather' },
  { id: 'mindset', kind: 'mindset', size: 'sm', label: 'Daily Mindset' },
];

const STORAGE_KEY = 'lifeos_dashboard_widgets_v3';
const SCRATCHPAD_KEY = 'lifeos_dashboard_scratchpad_v1';

/* ------------------------------------------------------------------ *
 * Architectural Card Shell & Metrics
 * ------------------------------------------------------------------ */

function Shell({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col justify-between p-4 sm:p-5 select-none bg-card text-card-foreground">
      <header className="flex items-center justify-between gap-2 pb-2 mb-1.5 border-b border-border/40">
        <span className="text-[12px] font-medium tracking-tight text-foreground/80">
          {title}
        </span>
        {meta && <div className="shrink-0 text-[11px] text-muted-foreground">{meta}</div>}
      </header>
      <div className="flex min-h-0 flex-1 flex-col justify-between">{children}</div>
    </section>
  );
}

function MetricNumber({
  children,
  unit,
}: {
  children: ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5 font-mono text-[26px] font-medium tracking-tight text-foreground tabular-nums">
      <span>{children}</span>
      {unit && (
        <span className="font-sans text-[12px] font-normal text-muted-foreground tracking-normal">
          {unit}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Web Audio Ambient Sound Synthesizer (Zero Dependencies)
 * ------------------------------------------------------------------ */

class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;

  start(preset: 'rain' | 'noise' | 'waves') {
    this.stop();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // Create 4-second looping noise buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      if (preset === 'noise') {
        // Brown noise
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else {
        // Pink / Rain noise
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.05 * white) / 1.05;
        lastOut = data[i];
        data[i] *= 2.5;
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    if (preset === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 900;
    } else if (preset === 'waves') {
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 1.2;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 450;
    }

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    noiseSource.start(0);
    this.noiseNode = noiseSource;
  }

  stop() {
    try {
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
    } catch {}
    this.ctx = null;
    this.noiseNode = null;
    this.gainNode = null;
  }
}

const ambientAudio = new AmbientSoundGenerator();

/* ------------------------------------------------------------------ *
 * Main Executive Dashboard
 * ------------------------------------------------------------------ */

export default function DashboardPage() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Stores
  const sessions = usePomodoroStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const habits = useHabitStore((s) => s.habits);
  const habitLogs = useHabitStore((s) => s.logs);
  const toggleHabitDay = useHabitStore((s) => s.toggleHabitDay);
  const getStreak = useHabitStore((s) => s.getStreak);
  const projects = useProjectStore((s) => s.projects);
  const calendarEvents = useCalendarStore((s) => s.events);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completeTask = useTaskStore((s) => s.completeTask);

  const notionApiKey = useSettingsStore((s) => s.notionApiKey);
  const microsoftAccessToken = useSettingsStore((s) => s.microsoftAccessToken);
  const googleCalendarToken = useSettingsStore((s) => s.googleCalendarToken);
  const openIntegrationsModal = useSettingsStore((s) => s.openIntegrationsModal);
  const syncFromNotion = useTaskStore((s) => s.syncFromNotion);
  const syncFromMicrosoftTodo = useTaskStore((s) => s.syncFromMicrosoftTodo);
  const spotifyPlaylistUrl = useSettingsStore((s) => s.spotifyPlaylistUrl);

  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [nowTime, setNowTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!googleCalendarToken) return;
    getUpcomingEvents(new Date().toISOString(), 10)
      .then((items) => {
        const mapped: CalendarEvent[] = (items || []).map((item: any) => {
          let eventDate = today;
          let eventTime: string | undefined = undefined;

          if (item.start?.dateTime) {
            const d = new Date(item.start.dateTime);
            eventDate = format(d, 'yyyy-MM-dd');
            eventTime = format(d, 'HH:mm');
          } else if (item.start?.date) {
            eventDate = item.start.date;
          }

          return {
            id: `google-${item.id}`,
            title: item.summary || 'Untitled Event',
            description: item.description || '',
            date: eventDate,
            startTime: eventTime,
            type: 'event',
            color: '#4285F4',
          };
        });
        setGoogleEvents(mapped);
      })
      .catch((err) => console.warn('Could not load Google Calendar events for dashboard:', err));
  }, [googleCalendarToken, today]);

  // Layout State
  const [editable, setEditable] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse dashboard widgets from storage:', e);
    }
    return DEFAULT_WIDGETS;
  });

  const handleWidgetsChange = useCallback((next: WidgetItem[]) => {
    const updated = next as DashboardWidget[];
    setWidgets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save dashboard widgets:', e);
    }
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WIDGETS));
    } catch (e) {
      console.warn('Failed to reset dashboard widgets:', e);
    }
  }, []);

  // Quick Scratchpad State
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem(SCRATCHPAD_KEY) || '';
  });
  const [scratchpadFeedback, setScratchpadFeedback] = useState<string | null>(null);

  const handleScratchpadChange = (text: string) => {
    setScratchpadText(text);
    localStorage.setItem(SCRATCHPAD_KEY, text);
  };

  const handleConvertToTask = async () => {
    const trimmed = scratchpadText.trim();
    if (!trimmed) return;
    const firstLine = trimmed.split('\n')[0].substring(0, 80);
    try {
      await addTask({
        title: firstLine,
        description: trimmed,
        priority: TaskPriority.MEDIUM,
        category: TaskCategory.PERSONAL,
        status: TaskStatus.TODO,
        recurring: false,
        dueDate: today,
      });
      setScratchpadText('');
      localStorage.removeItem(SCRATCHPAD_KEY);
      setScratchpadFeedback('Converted to task in Inbox');
      setTimeout(() => setScratchpadFeedback(null), 3000);
    } catch (err: any) {
      setScratchpadFeedback(err?.message || 'Failed to create task');
      setTimeout(() => setScratchpadFeedback(null), 3000);
    }
  };

  // Ambient Audio State
  const [activeSound, setActiveSound] = useState<'rain' | 'noise' | 'waves' | null>(null);

  const toggleSound = (sound: 'rain' | 'noise' | 'waves') => {
    if (activeSound === sound) {
      ambientAudio.stop();
      setActiveSound(null);
    } else {
      ambientAudio.start(sound);
      setActiveSound(sound);
    }
  };

  useEffect(() => {
    return () => ambientAudio.stop();
  }, []);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleQuickSync = async () => {
    if (!notionApiKey && !microsoftAccessToken) {
      openIntegrationsModal();
      return;
    }
    setIsSyncing(true);
    setSyncFeedback(null);
    let imported = 0;
    let updated = 0;
    try {
      if (notionApiKey) {
        const res = await syncFromNotion();
        imported += res.imported;
        updated += res.updated;
      }
      if (microsoftAccessToken) {
        const res = await syncFromMicrosoftTodo();
        imported += res.imported;
        updated += res.updated;
      }
      setSyncFeedback(`Synced: ${imported} added, ${updated} updated`);
    } catch (err: any) {
      setSyncFeedback(err?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Weather data
  const [weather, setWeather] = useState<{ temp: number; text: string; code: number } | null>(null);
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.56&longitude=68.79&current_weather=true')
      .then((res) => res.json())
      .then((data) => {
        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          let text = 'Clear Sky';
          if (code === 0) text = 'Clear Sky';
          else if ([1, 2, 3].includes(code)) text = 'Partly Cloudy';
          else if ([45, 48].includes(code)) text = 'Foggy';
          else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) text = 'Rainy';
          else if ([71, 73, 75, 77, 85, 86].includes(code)) text = 'Snowy';
          else if ([95, 96, 99].includes(code)) text = 'Thunderstorm';
          setWeather({ temp, text, code });
        }
      })
      .catch((err) => console.error('Failed to load weather:', err));
  }, []);

  const randomQuote = useMemo(() => getRandomQuote(), []);

  // Aggregated Metrics
  const todaySessions = useMemo(() => sessions.filter((s) => s.date === today), [sessions, today]);
  const focusMinutesToday = useMemo(() => todaySessions.reduce((acc, s) => acc + s.duration, 0), [todaySessions]);
  const focusHoursToday = (focusMinutesToday / 60).toFixed(1);

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const habitsCompletedToday = useMemo(
    () =>
      activeHabits.filter((h) =>
        habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed)
      ).length,
    [activeHabits, habitLogs, today]
  );
  const longestStreak = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    return Math.max(...activeHabits.map((h) => getStreak(h.id)), 0);
  }, [activeHabits, getStreak]);

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === today || t.status === TaskStatus.IN_PROGRESS),
    [tasks, today]
  );
  const completedTodayTasksCount = useMemo(
    () => todayTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    [todayTasks]
  );
  const pendingTodayTasksCount = todayTasks.length - completedTodayTasksCount;
  const tasksCompletionRate = todayTasks.length > 0
    ? Math.round((completedTodayTasksCount / todayTasks.length) * 100)
    : 0;

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === ProjectStatus.ACTIVE),
    [projects]
  );

  // Next Calendar Event
  const nextEvent = useMemo(() => {
    const now = new Date(nowTime);
    const currentTime = format(now, 'HH:mm');
    const combined = [...calendarEvents, ...googleEvents];
    const sorted = combined
      .filter((e) => e.date > today || (e.date === today && (!e.startTime || e.startTime >= currentTime)))
      .sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || '')));
    return sorted[0] || null;
  }, [calendarEvents, googleEvents, today, nowTime]);

  // 7-day performance history
  const weekHistory = useMemo(() => {
    const list = [];
    const todayObj = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = subDays(todayObj, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const mins = daySessions.reduce((acc, s) => acc + s.duration, 0);
      const hours = parseFloat((mins / 60).toFixed(1));
      const doneTasks = tasks.filter((t) => {
        if (!t.completedAt || t.status !== TaskStatus.COMPLETED) return false;
        try {
          return format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr;
        } catch {
          return false;
        }
      }).length;
      list.push({ dayLabel, dateStr, hours, doneTasks });
    }
    return list;
  }, [sessions, tasks]);

  const weekFocusTotal = useMemo(
    () => weekHistory.reduce((sum, d) => sum + d.hours, 0).toFixed(1),
    [weekHistory]
  );
  const maxDayHours = useMemo(
    () => Math.max(...weekHistory.map((d) => d.hours), 4),
    [weekHistory]
  );

  /* ------------------------------------------------------------------ *
   * Widget Views
   * ------------------------------------------------------------------ */

  const renderWidget = (item: DashboardWidget, size: WidgetSize) => {
    switch (item.kind) {
      case 'performance':
        return (
          <Shell
            title="Weekly performance"
            meta={<span className="font-mono">{weekFocusTotal}h total</span>}
          >
            <div className="flex items-baseline justify-between mb-2">
              <MetricNumber unit="hours focused this week">{weekFocusTotal}</MetricNumber>
              <span className="text-[12px] text-muted-foreground font-mono">
                {weekHistory.reduce((sum, d) => sum + d.doneTasks, 0)} tasks finished
              </span>
            </div>

            {/* Precision 7-day slot bars */}
            <div className="mt-auto flex h-14 items-end gap-2 pt-2 border-t border-border/30">
              {weekHistory.map((d, i) => {
                const heightPct = Math.max(14, Math.round((d.hours / maxDayHours) * 100));
                const isCurrent = i === weekHistory.length - 1;
                return (
                  <div key={d.dateStr} className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 text-[10px] font-mono text-foreground bg-popover px-1.5 py-0.5 rounded shadow-sm border border-border">
                      {d.hours}h · {d.doneTasks}t
                    </span>
                    <div
                      className={`w-full rounded transition-all duration-300 ${
                        isCurrent
                          ? 'bg-primary shadow-sm'
                          : d.hours > 0
                          ? 'bg-foreground/20 hover:bg-foreground/35'
                          : 'bg-foreground/5'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className={`text-[11px] font-mono ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </Shell>
        );

      case 'calendar-event':
        return (
          <Shell
            title="Upcoming schedule"
            meta={
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/calendar');
                }}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                Calendar <ArrowRight size={11} />
              </button>
            }
          >
            {nextEvent ? (
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                      {nextEvent.startTime || 'All day'}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {nextEvent.date === today ? 'Today' : nextEvent.date}
                    </span>
                  </div>
                  <h4 className="text-[13.5px] font-medium text-foreground line-clamp-2 leading-snug">
                    {nextEvent.title}
                  </h4>
                </div>

                <div className="mt-auto pt-2 border-t border-border/30 flex items-center justify-between text-[11.5px] text-muted-foreground">
                  <span className="truncate">{nextEvent.description || 'Google Calendar event'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/calendar');
                    }}
                    className="p-1 rounded hover:bg-foreground/5 text-foreground"
                    title="Open calendar"
                  >
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Calendar size={18} className="mb-1 opacity-50 text-blue-500" />
                <span className="text-[12px] font-medium text-foreground">Schedule clear</span>
                <span className="text-[11px]">No upcoming events today</span>
              </div>
            )}
          </Shell>
        );

      case 'ambient-audio':
        return (
          <Shell
            title="Focus soundscape"
            meta={
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                {activeSound ? (
                  <span className="flex items-center gap-1 text-blue-500 font-medium">
                    <Activity size={12} className="animate-pulse" /> Live
                  </span>
                ) : (
                  'Standby'
                )}
              </span>
            }
          >
            <div className="space-y-1.5 my-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound('rain');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] transition-colors border ${
                  activeSound === 'rain'
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 font-medium'
                    : 'bg-foreground/[0.03] border-border/40 text-foreground hover:bg-foreground/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CloudRain size={13} className={activeSound === 'rain' ? 'text-blue-400' : 'text-muted-foreground'} />
                  <span>Rain & Storm</span>
                </span>
                {activeSound === 'rain' ? <Square size={11} fill="currentColor" /> : <Play size={11} />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound('noise');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] transition-colors border ${
                  activeSound === 'noise'
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 font-medium'
                    : 'bg-foreground/[0.03] border-border/40 text-foreground hover:bg-foreground/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Volume2 size={13} className={activeSound === 'noise' ? 'text-blue-400' : 'text-muted-foreground'} />
                  <span>Deep Brown Noise</span>
                </span>
                {activeSound === 'noise' ? <Square size={11} fill="currentColor" /> : <Play size={11} />}
              </button>
            </div>

            <div className="mt-auto pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Offline Web Audio</span>
              {spotifyPlaylistUrl && (
                <a
                  href={spotifyPlaylistUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-emerald-500 hover:underline"
                >
                  <Music size={11} /> Spotify
                </a>
              )}
            </div>
          </Shell>
        );

      case 'scratchpad':
        return (
          <Shell
            title="Quick scratchpad"
            meta={
              scratchpadFeedback ? (
                <span className="text-blue-500 font-medium">{scratchpadFeedback}</span>
              ) : (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {scratchpadText.length} chars
                </span>
              )
            }
          >
            <div className="flex flex-col h-full gap-2">
              <textarea
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Type quick thoughts, phone numbers, or raw notes... Autosaves locally."
                className="w-full flex-1 resize-none bg-transparent font-mono text-[12.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 border-0 outline-none p-1"
                rows={3}
              />
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground">
                  Press convert to send directly to your Task Inbox
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertToTask();
                  }}
                  disabled={!scratchpadText.trim()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border/50 disabled:opacity-40"
                >
                  <Plus size={12} />
                  <span>Turn into Task</span>
                </button>
              </div>
            </div>
          </Shell>
        );

      case 'focus-time':
        return (
          <Shell
            title="Focus session"
            meta={<span className="font-mono">{todaySessions.length} logged</span>}
          >
            <MetricNumber unit="hrs today">{focusHoursToday}</MetricNumber>

            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Daily target (3h)</span>
                <span className="font-mono">{Math.round((focusMinutesToday / 180) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((focusMinutesToday / 180) * 100))}%` }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/focus');
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-[12px] font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border/60"
              >
                <Timer size={13} className="text-primary" />
                <span>Enter Focus Mode</span>
                <ChevronRight size={13} className="opacity-60 ml-auto" />
              </button>
            </div>
          </Shell>
        );

      case 'tasks-progress':
        return (
          <Shell
            title="Task execution"
            meta={<span className="font-mono">{completedTodayTasksCount}/{todayTasks.length}</span>}
          >
            <MetricNumber unit="completed">{tasksCompletionRate}%</MetricNumber>

            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Pending today</span>
                <span className="font-mono">{pendingTodayTasksCount} tasks</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${tasksCompletionRate}%` }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/tasks');
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-[12px] font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border/60"
              >
                <CheckSquare size={13} className="text-primary" />
                <span>Task Board</span>
                <ChevronRight size={13} className="opacity-60 ml-auto" />
              </button>
            </div>
          </Shell>
        );

      case 'daily-habits':
        return (
          <Shell
            title="Daily habits"
            meta={
              <span className="flex items-center gap-1 font-mono text-amber-500 text-[11px]">
                <Flame size={12} fill="currentColor" /> {longestStreak}d
              </span>
            }
          >
            <MetricNumber unit="completed">{habitsCompletedToday}/{activeHabits.length}</MetricNumber>

            <div className="mt-auto space-y-1.5">
              <div className="flex flex-col gap-1">
                {activeHabits.slice(0, 3).map((h) => {
                  const isDone = habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed);
                  return (
                    <div
                      key={h.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHabitDay(h.id, today);
                      }}
                      className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-foreground/5 cursor-pointer transition-colors text-[12px]"
                    >
                      <span className="truncate text-foreground flex items-center gap-1.5">
                        <span
                          className={`size-3.5 rounded flex items-center justify-center border text-[9px] transition-colors ${
                            isDone
                              ? 'bg-primary border-primary text-white'
                              : 'border-border/80 text-transparent hover:border-foreground/50'
                          }`}
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span className={isDone ? 'line-through text-muted-foreground' : ''}>{h.name}</span>
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">{getStreak(h.id)}d</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Shell>
        );

      case 'data-sync': {
        const hasNotion = Boolean(notionApiKey);
        const hasMicrosoft = Boolean(microsoftAccessToken);
        const activeCount = (hasNotion ? 1 : 0) + (hasMicrosoft ? 1 : 0);

        return (
          <Shell
            title="Integrations & Sync"
            meta={<span className="font-mono text-[11px] text-muted-foreground">{activeCount} connected</span>}
          >
            <MetricNumber unit="services">{activeCount > 0 ? `${activeCount} Active` : 'Offline'}</MetricNumber>

            <div className="mt-auto space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Notion database</span>
                <span className={`font-mono text-[11px] ${hasNotion ? 'text-primary' : 'text-muted-foreground'}`}>
                  {hasNotion ? 'Active' : 'Unconfigured'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Microsoft To Do</span>
                <span className={`font-mono text-[11px] ${hasMicrosoft ? 'text-primary' : 'text-muted-foreground'}`}>
                  {hasMicrosoft ? 'Active' : 'Unconfigured'}
                </span>
              </div>

              {syncFeedback && (
                <div className="text-[11px] font-mono text-primary truncate pt-0.5">
                  {syncFeedback}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickSync();
                  }}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-[12px] font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border/60 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin text-primary' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openIntegrationsModal();
                  }}
                  className="rounded-lg py-1.5 px-2 text-[12px] font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border/60"
                  title="Configure Keys"
                >
                  Keys
                </button>
              </div>
            </div>
          </Shell>
        );
      }

      case 'today-tasks':
        return (
          <Shell
            title="Today's priorities"
            meta={
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/tasks');
                }}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                Board <ArrowRight size={11} />
              </button>
            }
          >
            <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
              {todayTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground text-[12px]">
                  <CheckSquare size={18} className="mb-1 opacity-40" />
                  <span>No tasks due today. Everything clear!</span>
                </div>
              ) : (
                todayTasks.slice(0, 4).map((t) => {
                  const isDone = t.status === TaskStatus.COMPLETED;
                  return (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDone) {
                          updateTask(t.id, { status: TaskStatus.TODO, completedAt: undefined });
                        } else {
                          completeTask(t.id);
                        }
                      }}
                      className="group flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer border border-border/30 transition-all text-[12.5px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`size-4 rounded flex items-center justify-center border text-[10px] shrink-0 transition-colors ${
                            isDone
                              ? 'bg-primary border-primary text-white'
                              : 'border-border/80 text-transparent group-hover:border-foreground/50'
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span className={`truncate font-medium text-foreground ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                          {t.title}
                        </span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                          t.priority === TaskPriority.URGENT
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            : t.priority === TaskPriority.HIGH
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : 'bg-foreground/5 text-muted-foreground border border-border/50'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Shell>
        );

      case 'active-projects':
        return (
          <Shell
            title="Active projects"
            meta={
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/projects');
                }}
                className="text-[11px] text-blue-500 hover:underline flex items-center gap-1"
              >
                All ({activeProjects.length}) <ArrowRight size={11} />
              </button>
            }
          >
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
              {activeProjects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground text-[12px]">
                  <FolderKanban size={18} className="mb-1 opacity-40" />
                  <span>No active projects</span>
                </div>
              ) : (
                activeProjects.slice(0, 3).map((p) => {
                  const progress = p.progress || 0;
                  return (
                    <div
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/projects');
                      }}
                      className="p-2 rounded-lg bg-foreground/[0.02] hover:bg-foreground/5 border border-border/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[12px] font-medium text-foreground mb-1">
                        <span className="truncate">{p.title}</span>
                        <span className="font-mono text-muted-foreground text-[11px]">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Shell>
        );

      case 'weather': {
        const WeatherIcon =
          weather?.code === 0
            ? Sun
            : [1, 2, 3].includes(weather?.code ?? -1)
            ? Cloud
            : [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather?.code ?? -1)
            ? CloudRain
            : [71, 73, 75, 77, 85, 86].includes(weather?.code ?? -1)
            ? CloudSnow
            : [95, 96, 99].includes(weather?.code ?? -1)
            ? CloudLightning
            : Sun;

        return (
          <Shell
            title="Local atmosphere"
            meta={<span className="text-[11px] font-mono text-muted-foreground">Dushanbe</span>}
          >
            <div className="flex items-center justify-between my-auto">
              <MetricNumber unit="°C">{weather ? weather.temp : '--'}</MetricNumber>
              <div className="size-9 rounded-lg bg-foreground/5 border border-border/50 flex items-center justify-center text-amber-500">
                <WeatherIcon size={20} />
              </div>
            </div>

            <div className="mt-auto pt-2 border-t border-border/30 text-[12px] text-muted-foreground flex justify-between">
              <span>Condition</span>
              <span className="font-medium text-foreground">{weather ? weather.text : 'Updating...'}</span>
            </div>
          </Shell>
        );
      }

      case 'mindset':
        return (
          <Shell
            title="Daily mindset"
            meta={<span className="text-[11px] font-mono text-muted-foreground">{randomQuote.category}</span>}
          >
            <div className="flex flex-col justify-center h-full py-1">
              <blockquote className="text-[13px] font-normal leading-relaxed text-foreground italic line-clamp-3">
                "{randomQuote.text}"
              </blockquote>
              <div className="mt-2 text-[11px] font-mono text-muted-foreground text-right">
                — {randomQuote.author}
              </div>
            </div>
          </Shell>
        );

      default:
        return <div>Widget {item.id}</div>;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-5 pb-12 antialiased">
      {/* ── Top Executive Header Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20 font-medium">
              <Zap size={10} fill="currentColor" /> {format(new Date(), 'EEEE, MMMM d')}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Industrial Precision OS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            You have <strong className="text-foreground font-medium">{pendingTodayTasksCount}</strong> tasks pending and{' '}
            <strong className="text-foreground font-medium">{activeHabits.length - habitsCompletedToday}</strong> habits remaining today.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setEditable(!editable)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
              editable
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card text-foreground hover:bg-muted border-border'
            }`}
          >
            <Settings size={13} />
            <span>{editable ? 'Done Rearranging' : 'Customize Layout'}</span>
          </button>

          {editable && (
            <button
              onClick={resetLayout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
              title="Reset layout to default"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={openIntegrationsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-card text-foreground hover:bg-muted border border-border transition-colors"
          >
            <CheckSquare size={13} />
            <span>Integrations</span>
          </button>

          <button
            onClick={() => navigate('/focus')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium bg-primary hover:opacity-90 text-white transition-all shadow-sm"
          >
            <Timer size={13} fill="currentColor" />
            <span>Start Focus</span>
          </button>
        </div>
      </header>

      {/* ── Edit Mode Helper ── */}
      {editable && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[12.5px]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span>Drag tiles to rearrange your dashboard. Positions save automatically.</span>
          </div>
          <button
            onClick={() => setEditable(false)}
            className="text-[12px] font-medium underline underline-offset-2 hover:opacity-80"
          >
            Done
          </button>
        </div>
      )}

      {/* ── Precision Draggable Widget Grid ── */}
      <section aria-label="Executive Dashboard Grid" className="w-full">
        <DraggableWidgetGrid
          items={widgets}
          editable={editable}
          onChange={handleWidgetsChange}
          renderItem={(item, size) => renderWidget(item as DashboardWidget, size)}
          maxColumns={4}
          cellSize={220}
          gap={14}
          radius={18}
        />
      </section>
    </div>
  );
}
