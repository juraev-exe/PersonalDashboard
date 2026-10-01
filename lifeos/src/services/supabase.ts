// ============================================
// LifeOS — Supabase Client initialization
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getInitialUrl = (): string => {
  const local = localStorage.getItem('lifeos_supabase_url');
  if (local) return local.trim();
  try {
    const raw = localStorage.getItem('settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseUrl) return parsed.supabaseUrl.trim();
    }
  } catch {}
  return (import.meta.env.VITE_SUPABASE_URL || '').trim();
};

const getInitialKey = (): string => {
  const local = localStorage.getItem('lifeos_supabase_anon_key');
  if (local) return local.trim();
  try {
    const raw = localStorage.getItem('settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseAnonKey) return parsed.supabaseAnonKey.trim();
    }
  } catch {}
  return (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
};

let currentUrl = getInitialUrl();
let currentKey = getInitialKey();

export let isSupabaseConfigured = Boolean(currentUrl && currentKey);

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(currentUrl, currentKey)
  : null;

/**
 * Dynamically reconfigure or disconnect Supabase at runtime.
 */
export function configureSupabase(url: string, anonKey: string): SupabaseClient | null {
  currentUrl = url.trim();
  currentKey = anonKey.trim();

  if (currentUrl && currentKey) {
    localStorage.setItem('lifeos_supabase_url', currentUrl);
    localStorage.setItem('lifeos_supabase_anon_key', currentKey);
    supabase = createClient(currentUrl, currentKey);
    isSupabaseConfigured = true;
  } else {
    localStorage.removeItem('lifeos_supabase_url');
    localStorage.removeItem('lifeos_supabase_anon_key');
    supabase = null;
    isSupabaseConfigured = false;
  }

  return supabase;
}

/**
 * Test a Supabase connection and verify whether database tables exist.
 */
export async function testSupabaseConnection(
  url?: string,
  anonKey?: string
): Promise<{ success: boolean; message: string; tablesExist: boolean }> {
  const testUrl = (url || currentUrl).trim();
  const testKey = (anonKey || currentKey).trim();

  if (!testUrl || !testKey) {
    return {
      success: false,
      message: 'Please provide both Supabase Project URL and Anon Public Key.',
      tablesExist: false,
    };
  }

  try {
    const client = createClient(testUrl, testKey);
    const { error } = await client.from('tasks').select('id').limit(1);

    if (error) {
      // Table doesn't exist yet, but credentials and network are valid!
      if (
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation "public.tasks"')
      ) {
        return {
          success: true,
          message: 'Connection successful! (Next step: run the SQL migration script in Supabase SQL editor to create your tables).',
          tablesExist: false,
        };
      }
      return {
        success: false,
        message: error.message || 'Supabase returned an error during connection test.',
        tablesExist: false,
      };
    }

    return {
      success: true,
      message: 'Connected to Supabase successfully! All core tables verified.',
      tablesExist: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not connect to Supabase project.',
      tablesExist: false,
    };
  }
}

