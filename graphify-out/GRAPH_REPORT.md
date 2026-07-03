# Graph Report - PersonalDashboard  (2026-07-03)

## Corpus Check
- 66 files · ~1,211,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 445 nodes · 1141 edges · 26 communities (25 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51b9bc54`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `useSettingsStore` - 27 edges
2. `useAuthStore` - 23 edges
3. `compilerOptions` - 19 edges
4. `usePomodoroStore` - 18 edges
5. `useInitData()` - 17 edges
6. `isSupabaseConfigured` - 15 edges
7. `useTaskStore` - 15 edges
8. `useGamificationStore` - 12 edges
9. `useHabitStore` - 12 edges
10. `Trash2` - 11 edges

## Surprising Connections (you probably didn't know these)
- `HabitsPage()` --calls--> `useHabitStore`  [EXTRACTED]
  lifeos/src/pages/HabitsPage.tsx → lifeos/src/stores/habitStore.ts
- `AuthPage()` --calls--> `useAuthStore`  [EXTRACTED]
  lifeos/src/pages/AuthPage.tsx → lifeos/src/stores/authStore.ts
- `PrayersPage()` --calls--> `usePrayerStore`  [EXTRACTED]
  lifeos/src/pages/PrayersPage.tsx → lifeos/src/stores/prayerStore.ts
- `TasksPage()` --calls--> `useTaskStore`  [EXTRACTED]
  lifeos/src/pages/TasksPage.tsx → lifeos/src/stores/taskStore.ts
- `MainLayout()` --calls--> `usePomodoroStore`  [EXTRACTED]
  lifeos/src/components/layout/MainLayout.tsx → lifeos/src/stores/pomodoroStore.ts

## Import Cycles
- None detected.

## Communities (26 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (28): pomodoroPresets, Download, FileSpreadsheet, Plug, Upload, container, item, connectGoogleCalendar() (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (11): CalendarDays, CheckSquare, Code2, Gamepad2, GraduationCap, LayoutDashboard, PenTool, Repeat (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (30): dependencies, date-fns, framer-motion, popmotion, react, react-dom, react-router-dom, recharts (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (63): achievementDefinitions, createSampleCalendarEvents(), createSampleHabitLogs(), createSampleNotes(), createSamplePomodoros(), createSamplePrayerLogs(), createSampleProjects(), createSampleTasks() (+55 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (30): useInitData(), usePomodoro(), Sidebar(), AnalyticsPage(), container, item, DashboardPage(), FocusPage() (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations, jsx, lib, module, moduleDetection (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (12): Bell, Check, ChevronDown, LogOut, Moon, Search, Settings, Star (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (26): ArrowUpDown, Bookmark, CheckCircle, ChevronRight, DollarSign, List, Plus, RefreshCw (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (12): 1. State Management (Zustand), 2. Services Layer, 3. Gamification System, 🏗️ Core Architecture, 📊 Data Models, Database Schema (Supabase), 📁 Directory Structure, Key Entities (Frontend Types) (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (11): Architecture Overview, Authentication & Authorization, Dashboard Integration Plan, Data Flow, Deployment Strategy, Goals, Integration Points, Monitoring & Logging (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (6): Zap, ToastItem(), XpToastContainer(), useXpToastStore, XpToast, XpToastState

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): Environment Variables (.env), Option 1: Copy-Paste via SQL Editor (Easiest), Option 2: Setup via Supabase CLI (Recommended for Development), Prerequisites, Row Level Security (RLS) & Policies, Setup Options, Supabase Database & Migrations Setup

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): devDependencies, @vercel/node, name, private, scripts, build

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): buildCommand, installCommand, outputDirectory, rewrites, $schema

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (7): Activity, ArrowRight, Globe, Info, Lock, Mail, AuthPage()

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (28): getRandomQuote(), Quote, quotes, useKeyboardShortcuts(), BookText, Cloud, CloudLightning, CloudRain (+20 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (18): Edit3, Flame, History, iconPath(), LucideProps, Maximize2, MessageSquare, Minimize2 (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): Calendar, Code, ExternalLink, FolderKanban, GitBranch, Layers

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (21): AppleWhole, Award, Bed, Bicycle, Brain, Carrot, Droplet, Dumbbell (+13 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (12): Archive, BookOpen, ChevronLeft, Clock, FileText, Frown, Meh, Pin (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (9): BarChart3, ShieldAlert, Smartphone, DetoxPage(), PRESET_COLORS, SCREENTIME_CATEGORIES, BadHabit, ScreentimeLog (+1 more)

## Knowledge Gaps
- **116 isolated node(s):** `Interactive3DOrbProps`, `navGroups`, `container`, `item`, `PRESET_ICONS` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSettingsStore` connect `Community 20` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 21`, `Community 26`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `Community 4` to `Community 19`, `Community 1`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `usePomodoroStore` connect `Community 4` to `Community 0`, `Community 3`, `Community 20`, `Community 21`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `Interactive3DOrbProps`, `navGroups`, `container` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10338680926916222 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0547945205479452 - nodes in this community are weakly interconnected._