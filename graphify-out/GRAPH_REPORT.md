# Graph Report - PersonalDashboard  (2026-07-01)

## Corpus Check
- 65 files · ~1,210,349 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 442 nodes · 1136 edges · 28 communities (27 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dcdcfba6`
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
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 32|Community 32]]

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
- `SettingsPage()` --calls--> `useSettingsStore`  [EXTRACTED]
  lifeos/src/pages/SettingsPage.tsx → lifeos/src/stores/settingsStore.ts
- `AuthPage()` --calls--> `useAuthStore`  [EXTRACTED]
  lifeos/src/pages/AuthPage.tsx → lifeos/src/stores/authStore.ts
- `TasksPage()` --calls--> `useTaskStore`  [EXTRACTED]
  lifeos/src/pages/TasksPage.tsx → lifeos/src/stores/taskStore.ts
- `SpotifyWidget()` --calls--> `useSettingsStore`  [EXTRACTED]
  lifeos/src/components/layout/SpotifyWidget.tsx → lifeos/src/stores/settingsStore.ts
- `useInitData()` --calls--> `useCalendarStore`  [EXTRACTED]
  lifeos/src/hooks/useInitData.ts → lifeos/src/stores/calendarStore.ts

## Import Cycles
- None detected.

## Communities (28 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (30): pomodoroPresets, Code, Download, FileSpreadsheet, GitBranch, Plug, Upload, container (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (17): Bell, CalendarDays, ChevronDown, Code2, Gamepad2, GraduationCap, LayoutDashboard, LogOut (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (30): dependencies, date-fns, framer-motion, popmotion, react, react-dom, react-router-dom, recharts (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (61): achievementDefinitions, createSampleCalendarEvents(), createSampleHabitLogs(), createSampleNotes(), createSamplePomodoros(), createSamplePrayerLogs(), createSampleProjects(), createSampleTasks() (+53 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (37): useInitData(), useKeyboardShortcuts(), usePomodoro(), MainLayout(), Sidebar(), TopNav(), AnalyticsPage(), DashboardPage() (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations, jsx, lib, module, moduleDetection (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (10): Calendar, Check, CheckSquare, Flame, Info, Star, TrendingUp, container (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (12): Bookmark, CalendarPage(), ProjectsPage(), mapCalendarEventFromDB(), mapCalendarEventToDB(), createEvent(), getHeaders(), getUpcomingEvents() (+4 more)

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
Cohesion: 0.22
Nodes (7): ArrowRight, Globe, Lock, Mail, User, AuthPage(), connectGoogleCalendar()

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (17): getRandomQuote(), Quote, quotes, BookText, Cloud, CloudLightning, CloudRain, CloudSnow (+9 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (9): Archive, BookOpen, Clock, FileText, History, MessageSquare, Pin, SkipForward (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (9): ChevronRight, Edit3, ExternalLink, FolderKanban, Layers, Plus, Target, Trash2 (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.10
Nodes (32): Activity, AppleWhole, Award, Bed, Bicycle, Brain, Carrot, Droplet (+24 more)

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (7): ArrowUpDown, DollarSign, TrendingDown, COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, Transaction

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): ChevronLeft, Frown, Meh, Save, Smile, moods

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (12): BarChart3, CheckCircle, ShieldAlert, Smartphone, DetoxPage(), PRESET_COLORS, SCREENTIME_CATEGORIES, BadHabit (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.83
Nodes (3): createNotionPage(), getHeaders(), searchNotion()

## Knowledge Gaps
- **115 isolated node(s):** `PackIconName`, `LucideProps`, `navGroups`, `SkeletonProps`, `SkeletonCardProps` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSettingsStore` connect `Community 4` to `Community 0`, `Community 1`, `Community 32`, `Community 3`, `Community 6`, `Community 7`, `Community 20`, `Community 21`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `Community 4` to `Community 1`, `Community 3`, `Community 6`, `Community 7`, `Community 19`, `Community 27`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `usePomodoroStore` connect `Community 4` to `Community 0`, `Community 3`, `Community 6`, `Community 20`, `Community 21`, `Community 23`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `PackIconName`, `LucideProps`, `navGroups` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10160427807486631 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11695906432748537 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._