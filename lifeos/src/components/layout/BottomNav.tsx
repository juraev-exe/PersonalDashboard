// ============================================
// LifeOS — Mobile Bottom Navigation
// ============================================

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  primaryMobileNav,
  secondaryNavGroups,
  moreNavIcon as MoreIcon,
  type NavItem,
} from './navConfig';

const isActivePath = (pathname: string, path: string) =>
  path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

/** Minimum touch target per the mobile spec. */
const TOUCH_TARGET = 48;

export default function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the sheet whenever navigation happens.
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Close the sheet on Escape / hardware back-style dismissal.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const secondaryActive = secondaryNavGroups.some((g) =>
    g.items.some((i) => isActivePath(location.pathname, i.path))
  );

  const renderTab = (item: NavItem, active: boolean, onClick: () => void, key: string) => {
    const Icon = item.icon;
    return (
      <button
        key={key}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        aria-label={item.label}
        style={{
          flex: 1,
          minWidth: TOUCH_TARGET,
          minHeight: TOUCH_TARGET,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '6px 2px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          position: 'relative',
          WebkitTapHighlightColor: 'transparent',
          transition: 'color 0.15s',
        }}
      >
        {active && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              width: 22,
              height: 2,
              borderRadius: 99,
              background: 'var(--color-accent)',
              boxShadow: 'var(--shadow-glow)',
            }}
          />
        )}
        <Icon size={20} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.2 }}>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* ── Bottom sheet with the remaining destinations ─────────────────── */}
      {/* Two AnimatePresence blocks rather than one wrapping a Fragment:
          AnimatePresence only tracks keyed element children, and a Fragment
          child leaves its contents stuck at their `initial` values. */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="bottomnav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSheetOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
              zIndex: 48,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
            <motion.div
              key="bottomnav-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-label="All sections"
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 49,
                maxHeight: '75vh',
                overflowY: 'auto',
                background: 'var(--color-bg-secondary)',
                borderTop: '1px solid var(--color-border)',
                borderTopLeftRadius: 'var(--radius-lg)',
                borderTopRightRadius: 'var(--radius-lg)',
                paddingBottom: 'calc(var(--spacing-bottomnav) + env(safe-area-inset-bottom, 0px) + 12px)',
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--color-bg-secondary)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  All sections
                </span>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close menu"
                  style={{
                    minWidth: TOUCH_TARGET,
                    minHeight: TOUCH_TARGET,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              {secondaryNavGroups.map((group) => (
                <div key={group.title} style={{ padding: '10px 12px 2px' }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: 'var(--color-text-muted)',
                      padding: '0 8px 6px',
                    }}
                  >
                    {group.title}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActivePath(location.pathname, item.path);
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          aria-current={active ? 'page' : undefined}
                          style={{
                            minHeight: TOUCH_TARGET,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            background: active ? 'var(--color-bg-active)' : 'var(--color-bg-hover)',
                            border: `1px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                            borderRadius: 'var(--radius-md)',
                            color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            fontSize: 13,
                            fontWeight: 500,
                            textAlign: 'left',
                            cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          <Icon size={16} />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fixed bottom bar ─────────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          height: 'calc(var(--spacing-bottomnav) + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          display: 'flex',
          alignItems: 'stretch',
          background: 'var(--color-bg-primary)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {primaryMobileNav.map((item) =>
          renderTab(
            item,
            isActivePath(location.pathname, item.path),
            () => navigate(item.path),
            item.path
          )
        )}
        {renderTab(
          { path: '__more', label: 'More', icon: MoreIcon },
          sheetOpen || secondaryActive,
          () => setSheetOpen((v) => !v),
          '__more'
        )}
      </nav>
    </>
  );
}
