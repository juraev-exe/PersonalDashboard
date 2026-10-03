import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import OfflineIndicator from './components/layout/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import { useInitData } from './hooks/useInitData';
import { useEventReminders } from './hooks/useEventReminders';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { supabase } from './services/supabase';
import AuthPage from './pages/AuthPage';
import './index.css';


// Lazy-loaded pages — each gets its own chunk for faster initial load
const PomodoroPage = React.lazy(() => import('./pages/PomodoroPage'));
const TasksPage = React.lazy(() => import('./pages/TasksPage'));
const HabitsPage = React.lazy(() => import('./pages/HabitsPage'));
const PrayersPage = React.lazy(() => import('./pages/PrayersPage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const NotesPage = React.lazy(() => import('./pages/NotesPage'));
const JournalPage = React.lazy(() => import('./pages/JournalPage'));
const FocusPage = React.lazy(() => import('./pages/FocusPage'));
const GoalsPage = React.lazy(() => import('./pages/GoalsPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const FinancePage = React.lazy(() => import('./pages/FinancePage'));
const DetoxPage = React.lazy(() => import('./pages/DetoxPage'));
const WidgetGridDemoPage = React.lazy(() => import('./components/ui/demo'));

// Minimal loading fallback for lazy pages
function PageSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 12,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        border: '2.5px solid var(--color-border-light)',
        borderTopColor: 'var(--color-accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const setGoogleSession = useSettingsStore((s) => s.setGoogleSession);

  // Initialize data stores after auth is ready
  useInitData();

  // Fire local reminders for upcoming calendar events
  useEventReminders();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ── Capture Google provider_token after OAuth redirect ─────────────────────
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (
          session?.provider_token &&
          session.user?.app_metadata?.provider === 'google'
        ) {
          const email = session.user.email ?? '';
          setGoogleSession(session.provider_token, email);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setGoogleSession]);
  // ──────────────────────────────────────────────────────────────────────────


  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        gap: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid #151b23',
          borderTopColor: '#3fb950',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: '#6e7681', fontFamily: 'system-ui, sans-serif' }}>Loading LifeOS...</span>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <OfflineIndicator />
      <Routes>
        {user ? (
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pomodoro" element={<Suspense fallback={<PageSpinner />}><PomodoroPage /></Suspense>} />
            <Route path="/focus" element={<Suspense fallback={<PageSpinner />}><FocusPage /></Suspense>} />
            <Route path="/tasks" element={<Suspense fallback={<PageSpinner />}><TasksPage /></Suspense>} />
            <Route path="/habits" element={<Suspense fallback={<PageSpinner />}><HabitsPage /></Suspense>} />
            <Route path="/prayers" element={<Suspense fallback={<PageSpinner />}><PrayersPage /></Suspense>} />
            <Route path="/projects" element={<Suspense fallback={<PageSpinner />}><ProjectsPage /></Suspense>} />
            <Route path="/calendar" element={<Suspense fallback={<PageSpinner />}><CalendarPage /></Suspense>} />
            <Route path="/notes" element={<Suspense fallback={<PageSpinner />}><NotesPage /></Suspense>} />
            <Route path="/journal" element={<Suspense fallback={<PageSpinner />}><JournalPage /></Suspense>} />
            <Route path="/goals" element={<Suspense fallback={<PageSpinner />}><GoalsPage /></Suspense>} />
            <Route path="/analytics" element={<Suspense fallback={<PageSpinner />}><AnalyticsPage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageSpinner />}><SettingsPage /></Suspense>} />
            <Route path="/finance" element={<Suspense fallback={<PageSpinner />}><FinancePage /></Suspense>} />
            <Route path="/detox" element={<Suspense fallback={<PageSpinner />}><DetoxPage /></Suspense>} />
            <Route path="/widget-demo" element={<Suspense fallback={<PageSpinner />}><WidgetGridDemoPage /></Suspense>} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
        ) : (
          <Route path="*" element={<AuthPage />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
