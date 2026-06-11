import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard shortcuts hook
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Check shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        // Handled by TopNav search, but we could trigger a global state here if needed
        return;
      }
      
      // 'P' for Pomodoro
      if (e.key.toLowerCase() === 'p') {
        navigate('/pomodoro');
      }

      // 'T' for Tasks
      if (e.key.toLowerCase() === 't') {
        navigate('/tasks');
      }

      // 'D' for Dashboard
      if (e.key.toLowerCase() === 'd') {
        navigate('/');
      }

      // 'J' for Journal
      if (e.key.toLowerCase() === 'j') {
        navigate('/journal');
      }

      // 'N' for Notes
      if (e.key.toLowerCase() === 'n') {
        navigate('/notes');
      }
      
      // 'S' for Settings
      if (e.key.toLowerCase() === 's') {
        navigate('/settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};
