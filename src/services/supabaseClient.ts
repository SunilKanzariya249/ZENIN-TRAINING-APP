import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl =
  ((import.meta.env?.VITE_SUPABASE_URL as string) ||
   (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL as string) ||
   '').trim();
const envAnonKey =
  ((import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
   (import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
   '').trim();

let clientInstance: SupabaseClient | null = null;

export function initSupabase(url?: string, anonKey?: string): SupabaseClient | null {
  const targetUrl = (url || envUrl || '').trim();
  const targetKey = (anonKey || envAnonKey || '').trim();

  // Validate that a real URL and Anon Key are supplied (not placeholder strings)
  if (
    targetUrl &&
    targetKey &&
    targetUrl.startsWith('https://') &&
    !targetUrl.includes('your-project') &&
    !targetKey.includes('your-anon-public-key')
  ) {
    try {
      clientInstance = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
      return clientInstance;
    } catch (err) {
      console.warn('ZENIN: Failed to initialize Supabase client:', err);
      clientInstance = null;
      return null;
    }
  }

  clientInstance = null;
  return null;
}

// Initial client boot
initSupabase();

export function getSupabase(): SupabaseClient | null {
  if (!clientInstance) {
    initSupabase();
  }
  return clientInstance;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
