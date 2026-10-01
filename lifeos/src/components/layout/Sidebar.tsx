import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStore';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut, Pin, Plug, RefreshCw } from 'lucide-react';
import { navGroups } from './navConfig';

export default function Sidebar() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const sidebarAutoHide = useSettingsStore((s) => s.sidebarAutoHide);
  const toggleSidebarAutoHide = useSettingsStore((s) => s.toggleSidebarAutoHide);
  const openIntegrationsModal = useSettingsStore((s) => s.openIntegrationsModal);
  const [hoverActive, setHoverActive] = useState(false);

  const notionApiKey = useSettingsStore((s) => s.notionApiKey);
  const microsoftAccessToken = useSettingsStore((s) => s.microsoftAccessToken);

  const tasks = useTaskStore((s) => s.tasks);
  const pendingTasksCount = useMemo(() => tasks.filter(t => t.status !== 'completed').length, [tasks]);
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const signOut = useAuthStore((s) => s.signOut);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const hasActiveIntegrations = Boolean(notionApiKey || microsoftAccessToken);

  return (
    <>
      {sidebarAutoHide && (
        <div
          className="sidebar-trigger-zone"
          onMouseEnter={() => setHoverActive(true)}
          onMouseLeave={() => setHoverActive(false)}
        >
          <div className="sidebar-trigger-strip" />
        </div>
      )}

      <aside
        onMouseEnter={() => sidebarAutoHide && setHoverActive(true)}
        onMouseLeave={() => sidebarAutoHide && setHoverActive(false)}
        className={sidebarAutoHide ? `sidebar-autohide ${hoverActive ? 'hover-active' : ''}` : ''}
        style={{
          width: collapsed ? 'var(--spacing-sidebar-collapsed)' : 'var(--spacing-sidebar)',
          height: '100vh',
          maxHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand / Logo - perfectly aligned with TopNav height */}
        <div style={{
          height: 'var(--spacing-topnav)',
          minHeight: 'var(--spacing-topnav)',
          maxHeight: 'var(--spacing-topnav)',
          boxSizing: 'border-box',
          padding: collapsed ? '0' : '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
          }}>
            L
          </div>
          {!collapsed && (
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}>
              LifeOS
            </span>
          )}
        </div>

        {/* Nav Items with scrollable overflow and compact density */}
        <nav
          className="custom-scrollbar"
          style={{
            flex: 1,
            minHeight: 0,
            padding: '8px 8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {!collapsed && (
                <div style={{
                  padding: '3px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 1,
                }}>
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '7px 0' : '6px 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: '7px',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 450,
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-bg-active)' : 'transparent',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={15} style={{ flexShrink: 0, color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                        {item.path === '/tasks' && pendingTasksCount > 0 && (
                          <span
                            className="badge"
                            style={{
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 99,
                              fontWeight: 600,
                              fontFamily: 'var(--font-mono)',
                              background: isActive ? 'rgba(92, 103, 245, 0.15)' : undefined,
                              color: isActive ? 'var(--color-accent)' : undefined,
                              borderColor: isActive ? 'rgba(92, 103, 245, 0.3)' : undefined,
                            }}
                          >
                            {pendingTasksCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* Render Sync & Data directly inside the SYSTEM group */}
              {group.title === 'SYSTEM' && (
                <button
                  onClick={openIntegrationsModal}
                  className="sidebar-link"
                  title="Notion & Microsoft To Do Sync"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '6px 0' : '5px 8px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: hasActiveIntegrations ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontWeight: hasActiveIntegrations ? 600 : 450,
                  }}
                >
                  <Plug size={15} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>Sync &amp; Data</span>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: hasActiveIntegrations ? 'var(--color-accent)' : 'var(--color-border-light)',
                        }}
                      />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Footer: User profile + Controls (sleek single row) */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: collapsed ? '8px 4px' : '0 12px',
          height: 48,
          minHeight: 48,
          maxHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          background: 'var(--color-bg-secondary)',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}>
          {!collapsed ? (
            <>
              {/* User Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  flexShrink: 0,
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 90,
                }}>
                  {isGuest ? 'Guest' : (user?.name || 'User')}
                </span>
              </div>

              {/* Actions Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={toggleSidebarAutoHide}
                  title={sidebarAutoHide ? 'Pin sidebar' : 'Auto-hide sidebar'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: sidebarAutoHide ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 5,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = sidebarAutoHide ? 'var(--color-accent)' : 'var(--color-text-muted)'; }}
                >
                  <Pin size={13} style={{ transform: sidebarAutoHide ? 'rotate(0deg)' : 'rotate(45deg)' }} />
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 5,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                  <LogOut size={13} />
                </button>

                <button
                  onClick={toggleSidebar}
                  title="Collapse sidebar"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 5,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              title="Expand sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
