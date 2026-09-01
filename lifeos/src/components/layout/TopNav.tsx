// ============================================
// LifeOS — Top Navigation Component
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { Search, Bell, Sun, Moon as MoonIcon, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useMediaQuery';

export default function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const isMobile = useIsMobile();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Click outside to close user menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header
        style={{
          height: 'var(--spacing-topnav)',
          position: 'fixed',
          top: 0,
          right: 0,
          left: isMobile ? 0 : collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: isMobile ? '0 12px' : '0 24px',
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
          transition: 'left 0.2s ease',
        }}
      >
        {/* Left/Center: Search — minWidth 0 so it can shrink past its content on narrow screens */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 400 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '10px 12px' : '6px 12px',
              minHeight: isMobile ? 44 : undefined,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 13,
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
              justifyContent: 'space-between',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} />
              Search...
            </span>
            {!isMobile && (
              <kbd style={{
                padding: '2px 6px',
                background: 'var(--color-bg-primary)',
                borderRadius: 4,
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}>
                Ctrl K
              </kbd>
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <MoonIcon size={16} />}
          </button>
          
          <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
            <Bell size={16} />
            <span style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-accent)',
            }} />
          </button>

          {/* User Avatar + Dropdown */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px 4px 4px',
                background: userMenuOpen ? 'var(--color-bg-hover)' : 'transparent',
                border: '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
              onMouseLeave={(e) => { if (!userMenuOpen) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent-glow)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                ) : (
                  <User size={14} color="var(--color-accent)" />
                )}
              </div>
              <ChevronDown size={12} style={{ color: 'var(--color-text-muted)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 240,
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {/* User Info */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {isGuest ? 'Guest Mode' : (user?.email || '')}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '6px' }}>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                    >
                      <Settings size={14} />
                      Settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '6px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-rose)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 81, 73, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="modal-overlay"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="modal-content"
              style={{ maxWidth: 600, marginTop: '-10vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search tasks, notes, projects..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--color-text-primary)',
                      fontSize: 15,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </div>
              </div>
              <div style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                Start typing to search across all modules...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

