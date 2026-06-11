// ============================================
// LifeOS — Sidebar Component
// ============================================

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Repeat,
  Moon,
  Target,
  CalendarDays,
  GraduationCap,
  PenTool,
  FolderKanban,
  Code2,
  StickyNote,
  Bookmark,
  Gamepad2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navGroups = [
  {
    title: 'PRODUCTIVITY',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/habits', label: 'Habits', icon: Repeat },
      { path: '/prayers', label: 'Prayers', icon: Moon },
      { path: '/focus', label: 'Focus Mode', icon: Target },
    ]
  },
  {
    title: 'LEARNING',
    items: [
      { path: '/journal', label: 'Journal', icon: PenTool },
      { path: '/goals', label: 'Goals', icon: Target },
      { path: '/weekly', label: 'Weekly Review', icon: CalendarDays },
    ]
  },
  {
    title: 'PROJECTS',
    items: [
      { path: '/projects', label: 'Projects', icon: FolderKanban },
    ]
  },
  {
    title: 'PERSONAL',
    items: [
      { path: '/calendar', label: 'Calendar', icon: CalendarDays },
      { path: '/notes', label: 'Notes', icon: StickyNote },
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/settings', label: 'Settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const level = useGamificationStore((s) => s.level);
  const xpProgress = useGamificationStore((s) => s.getXPProgress());
  const location = useLocation();

  return (
    <aside
      style={{
        width: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        background: 'var(--color-bg-primary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 800,
          color: '#ffffff',
          flexShrink: 0,
        }}>
          L
        </div>
        {!collapsed && (
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            LifeOS
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ 
        flex: 1, 
        padding: '0 12px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 16,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {navGroups.map((group, groupIdx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + groupIdx * 0.05 }}
            key={groupIdx} 
            style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {!collapsed && (
              <div style={{ 
                padding: '4px 8px', 
                fontSize: 10, 
                fontWeight: 600, 
                color: 'var(--color-text-muted)',
                letterSpacing: '0.05em',
                marginBottom: 4
              }}>
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <NavLink
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: collapsed ? '8px 0' : '6px 8px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-bg-active)' : 'transparent',
                      transition: 'all 0.1s ease',
                    }}
                    title={collapsed ? item.label : undefined}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-bg-hover)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </nav>

      {/* Level / XP */}
      <div style={{
        padding: collapsed ? '16px 8px' : '16px',
        borderTop: '1px solid var(--color-border)',
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={12} color="var(--color-accent)" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>Level {level}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{Math.round(xpProgress)}% to next</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}>
              {level}
            </div>
          </div>
        )}
        <div className="progress-bar" style={{ height: 3 }}>
          <div className="progress-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        style={{
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          border: 'none',
          transition: 'color 0.1s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
