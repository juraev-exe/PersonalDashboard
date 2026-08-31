// ============================================
// LifeOS — Main Layout Component
// ============================================

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopNav from './TopNav';
import XpToastContainer from './XpToastContainer';
import { useSettingsStore } from '../../stores/settingsStore';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const sidebarAutoHide = useSettingsStore((s) => s.sidebarAutoHide);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const isMobile = useIsMobile();
  const location = useLocation();
  useKeyboardShortcuts();

  const hideNavigation = location.pathname === '/focus' && isRunning;
  const showBottomNav = isMobile && !hideNavigation;

  // On mobile the sidebar is replaced by the bottom bar, so the content never shifts right.
  const marginLeft =
    isMobile || hideNavigation || sidebarAutoHide
      ? 0
      : collapsed
        ? 'var(--spacing-sidebar-collapsed)'
        : 'var(--spacing-sidebar)';

  const mainPadding = hideNavigation ? 0 : isMobile ? '16px' : '24px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!hideNavigation && !isMobile && <Sidebar />}
      <XpToastContainer />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!hideNavigation && <TopNav />}
        <main
          style={{
            marginTop: hideNavigation ? 0 : 'var(--spacing-topnav)',
            padding: mainPadding,
            // Keep the last rows of content clear of the fixed bottom bar.
            paddingBottom: showBottomNav
              ? 'calc(var(--spacing-bottomnav) + env(safe-area-inset-bottom, 0px) + 16px)'
              : mainPadding,
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
      {showBottomNav && <BottomNav />}
    </div>
  );
}
