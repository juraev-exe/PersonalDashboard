import { supabase } from './supabase';

/**
 * Trigger Google OAuth with Calendar + Sheets scopes.
 * Redirects back to /settings so the token is captured on return.
 */
export const connectGoogleCalendar = async () => {
  if (!supabase) return { error: 'Supabase client not initialized' };

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: [
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/spreadsheets',
        ].join(' '),
        redirectTo: `${window.location.origin}/settings`,
        queryParams: {
          // Always show account picker so user can choose/switch account
          prompt: 'consent',
          access_type: 'offline',
        },
      },
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error connecting Google Calendar:', error.message);
    return { error: error.message };
  }
};

/**
 * Sign out from Supabase (clears the Google session too).
 */
export const disconnectGoogle = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

