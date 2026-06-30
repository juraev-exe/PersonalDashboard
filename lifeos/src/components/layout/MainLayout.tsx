// ============================================
// LifeOS — Main Layout Component
// ============================================

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import XpToastContainer from './XpToastContainer';
import { useSettingsStore } from '../../stores/settingsStore';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const location = useLocation();
  useKeyboardShortcuts();

  const hideNavigation = location.pathname === '/focus' && isRunning;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!hideNavigation && <Sidebar />}
      <XpToastContainer />
      <div
        style={{
          flex: 1,
          marginLeft: hideNavigation ? 0 : (collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!hideNavigation && <TopNav />}
        <main
          style={{
            marginTop: hideNavigation ? 0 : 'var(--spacing-topnav)',
            padding: hideNavigation ? 0 : '24px',
            minHeight: hideNavigation ? '100vh' : 'calc(100vh - var(--spacing-topnav))',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
