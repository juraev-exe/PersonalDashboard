import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import OfflineIndicator from './components/layout/OfflineIndicator';
import DashboardPage from './pages/DashboardPage';
import { useInitData } from './hooks/useInitData';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { supabase } from './services/supabase';
import AuthPage from './pages/AuthPage';
import './index.css';


// Import pages
import PomodoroPage from './pages/PomodoroPage';
import TasksPage from './pages/TasksPage';
import HabitsPage from './pages/HabitsPage';
import PrayersPage from './pages/PrayersPage';
import ProjectsPage from './pages/ProjectsPage';
import CalendarPage from './pages/CalendarPage';
import NotesPage from './pages/NotesPage';
import JournalPage from './pages/JournalPage';
import FocusPage from './pages/FocusPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import FinancePage from './pages/FinancePage';
import DetoxPage from './pages/DetoxPage';

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
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/prayers" element={<PrayersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/detox" element={<DetoxPage />} />
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
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
