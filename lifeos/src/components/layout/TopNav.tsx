// ============================================
// LifeOS — Top Navigation Component
// ============================================

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Search, Bell, Sun, Moon as MoonIcon, User } from 'lucide-react';

export default function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header
        style={{
          height: 'var(--spacing-topnav)',
          position: 'fixed',
          top: 0,
          right: 0,
          left: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
          transition: 'left 0.2s ease',
        }}
      >
        {/* Left/Center: Search */}
        <div style={{ flex: 1, maxWidth: 400 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 13,
              width: '100%',
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

          <div style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-active)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <User size={14} color="var(--color-text-primary)" />
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div
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
          </div>
        </div>
      )}
    </>
  );
}
