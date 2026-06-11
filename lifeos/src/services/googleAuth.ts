import { supabase } from './supabase';

export const signInWithGoogle = async () => {
  if (!supabase) return { error: 'Supabase client not initialized' };

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error signing in with Google:', error.message);
    return { error: error.message };
  }
};
