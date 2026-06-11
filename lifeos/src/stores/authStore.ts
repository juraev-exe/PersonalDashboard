// ============================================
// LifeOS — Authentication Store
// ============================================

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { User } from '../types';
import * as storage from '../services/storage';

interface AuthState {
  user: User | null;
  session: any | null;
  isGuest: boolean;
  loading: boolean;
  initialized: boolean;
  initializeAuth: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateUserXp: (level: number, xp: number) => Promise<void>;
}

const GUEST_KEY = 'lifeos_auth_is_guest';

const defaultGuestUser: User = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@lifeos.local',
  level: 1,
  xp: 0,
  totalXp: 0,
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isGuest: storage.getValue<boolean>(GUEST_KEY, false),
  loading: true,
  initialized: false,

  initializeAuth: async () => {
    if (!isSupabaseConfigured) {
      // Offline mode fallback
      const isGuest = storage.getValue<boolean>(GUEST_KEY, false);
      if (isGuest) {
        set({ user: defaultGuestUser, session: null, isGuest: true, loading: false, initialized: true });
      } else {
        set({ user: null, session: null, isGuest: false, loading: false, initialized: true });
      }
      return;
    }

    try {
      // Check current session
      const { data: { session }, error } = await supabase!.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        // Fetch user profile from public.users table
        const { data: profile, error: profileError } = await supabase!
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist yet, let's create it
          const newProfile: User = {
            id: session.user.id,
            name: session.user.user_metadata.name || 'User',
            email: session.user.email || '',
            level: 1,
            xp: 0,
            totalXp: 0,
            createdAt: new Date().toISOString(),
          };

          const { error: insertError } = await supabase!
            .from('users')
            .insert({
              id: newProfile.id,
              name: newProfile.name,
              email: newProfile.email,
              level: newProfile.level,
              xp: newProfile.xp,
              total_xp: newProfile.totalXp,
              created_at: newProfile.createdAt,
            });

          if (!insertError) {
            set({ user: newProfile, session, isGuest: false, loading: false, initialized: true });
            return;
          }
        } else if (!profileError && profile) {
          // Profile exists, load it
          const formattedProfile: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar || undefined,
            level: profile.level,
            xp: profile.xp,
            totalXp: profile.total_xp,
            createdAt: profile.created_at,
          };
          set({ user: formattedProfile, session, isGuest: false, loading: false, initialized: true });
          return;
        }
      }

      // No session, check if we have guest flag
      const isGuest = storage.getValue<boolean>(GUEST_KEY, false);
      if (isGuest) {
        set({ user: defaultGuestUser, session: null, isGuest: true, loading: false, initialized: true });
      } else {
        set({ user: null, session: null, isGuest: false, loading: false, initialized: true });
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
      set({ user: null, session: null, isGuest: false, loading: false, initialized: true });
    }
  },

  signUp: async (email, password, name) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Run in guest mode.' };
    }

    set({ loading: true });
    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile row
        const newProfile = {
          id: data.user.id,
          name,
          email,
          level: 1,
          xp: 0,
          total_xp: 0,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase!
          .from('users')
          .insert(newProfile);

        if (insertError) throw insertError;

        const formattedProfile: User = {
          id: newProfile.id,
          name: newProfile.name,
          email: newProfile.email,
          level: newProfile.level,
          xp: newProfile.xp,
          totalXp: newProfile.total_xp,
          createdAt: newProfile.created_at,
        };

        set({ user: formattedProfile, session: data.session, isGuest: false, loading: false });
        storage.setValue(GUEST_KEY, false);
        return { error: null };
      }

      set({ loading: false });
      return { error: 'Verification email sent. Please check your inbox.' };
    } catch (e: any) {
      set({ loading: false });
      return { error: e.message || 'Error signing up.' };
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Run in guest mode.' };
    }

    set({ loading: true });
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.user) {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase!
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // If profile row somehow does not exist, auto-create it
          const newProfile = {
            id: data.session.user.id,
            name: data.session.user.user_metadata.name || 'User',
            email: data.session.user.email || '',
            level: 1,
            xp: 0,
            total_xp: 0,
            created_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase!.from('users').insert(newProfile);
          if (insertError) throw insertError;

          const formattedProfile: User = {
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            level: newProfile.level,
            xp: newProfile.xp,
            totalXp: newProfile.total_xp,
            createdAt: newProfile.created_at,
          };
          set({ user: formattedProfile, session: data.session, isGuest: false, loading: false });
        } else if (!profileError && profile) {
          const formattedProfile: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar || undefined,
            level: profile.level,
            xp: profile.xp,
            totalXp: profile.total_xp,
            createdAt: profile.created_at,
          };
          set({ user: formattedProfile, session: data.session, isGuest: false, loading: false });
        }
        storage.setValue(GUEST_KEY, false);
        return { error: null };
      }

      set({ loading: false });
      return { error: 'Login failed. Please verify credentials.' };
    } catch (e: any) {
      set({ loading: false });
      return { error: e.message || 'Error signing in.' };
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      if (isSupabaseConfigured && !get().isGuest) {
        await supabase!.auth.signOut();
      }
    } catch (e) {
      console.error('Error signing out of Supabase:', e);
    } finally {
      storage.setValue(GUEST_KEY, false);
      set({ user: null, session: null, isGuest: false, loading: false });
    }
  },

  continueAsGuest: () => {
    storage.setValue(GUEST_KEY, true);
    set({ user: defaultGuestUser, session: null, isGuest: true, loading: false });
  },

  updateUserXp: async (level, xp) => {
    const { user, isGuest } = get();
    if (!user) return;

    const updatedUser = { ...user, level, xp };

    if (!isGuest && isSupabaseConfigured) {
      try {
        await supabase!
          .from('users')
          .update({ level, xp })
          .eq('id', user.id);
      } catch (e) {
        console.error('Error updating profile in Supabase:', e);
      }
    }

    set({ user: updatedUser });
  },
}));
