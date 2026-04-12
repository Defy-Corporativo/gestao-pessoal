import { createClient } from '@supabase/supabase-js';
import { logDebug } from '../utils/logger';

// Support both the standard Vite prefix and raw SUPABASE_* vars (see vite.config.js envPrefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

logDebug('Supabase env loaded', {
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
});

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    'Missing Supabase URL or Anon Key. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
  logDebug('Supabase env missing', { supabaseUrl, supabaseAnonKeyPresent: Boolean(supabaseAnonKey) });
  throw new Error(message);
}

// Use a dedicated storage key to avoid clashes with other Supabase clients in the same browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-gestao-pessoal-auth',
  },
});
logDebug('Supabase client created');
