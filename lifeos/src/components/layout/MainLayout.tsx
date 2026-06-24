// ============================================
// LifeOS — Main Layout Component
// ============================================

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import XpToastContainer from './XpToastContainer';
import { useSettingsStore } from '../../stores/settingsStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const location = useLocation();
  useKeyboardShortcuts();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <XpToastContainer />
      <div
        style={{
          flex: 1,
          marginLeft: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <TopNav />
        <main
          style={{
            marginTop: 'var(--spacing-topnav)',
            padding: '24px',
            minHeight: 'calc(100vh - var(--spacing-topnav))',
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
