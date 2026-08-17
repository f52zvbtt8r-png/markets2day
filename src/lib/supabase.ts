import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Expo Router's web output renders an initial pass in Node (no `window`), where
// AsyncStorage's web implementation would throw. Only touch it once we're actually
// running in a browser or on native — everywhere else `window` is undefined and
// Supabase falls back to its in-memory storage for that pass.
const storage = typeof window === 'undefined' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // Web needs to read the session out of the magic-link redirect URL; native has
    // no URL to read one from.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
