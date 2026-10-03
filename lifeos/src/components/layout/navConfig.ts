// ============================================
// LifeOS — Shared Navigation Config
// ============================================
// Single source of truth for Sidebar (desktop) and BottomNav (mobile).

import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Repeat,
  Moon,
  Target,
  CalendarDays,
  PenTool,
  FolderKanban,
  StickyNote,
  BarChart3,
  Settings,
  DollarSign,
  ShieldAlert,
  Layers,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<LucideProps>;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'CORE',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/habits', label: 'Habits', icon: Repeat },
      { path: '/focus', label: 'Focus & Timer', icon: Timer },
      { path: '/projects', label: 'Projects', icon: FolderKanban },
      { path: '/notes', label: 'Notes', icon: StickyNote },
    ],
  },
  {
    title: 'PLANNING & LIFE',
    items: [
      { path: '/calendar', label: 'Calendar', icon: CalendarDays },
      { path: '/prayers', label: 'Prayers', icon: Moon },
      { path: '/goals', label: 'Goals', icon: Target },
      { path: '/journal', label: 'Journal', icon: PenTool },
      { path: '/finance', label: 'Finance', icon: DollarSign },
      { path: '/detox', label: 'Digital Detox', icon: ShieldAlert },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** The four destinations pinned to the mobile bottom bar; everything else lives behind "More". */
export const primaryMobileNav: NavItem[] = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/habits', label: 'Habits', icon: Repeat },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
];

/** Icon for the "More" tab that opens the full navigation sheet. */
export const moreNavIcon = Layers;

const primaryPaths = new Set(primaryMobileNav.map((i) => i.path));

/** Everything not already pinned to the bottom bar, flattened for the "More" sheet. */
export const secondaryNavGroups: NavGroup[] = navGroups
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => !primaryPaths.has(item.path)),
  }))
  .filter((group) => group.items.length > 0);
