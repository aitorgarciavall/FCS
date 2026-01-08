import { createClient } from '@supabase/supabase-js';

// Aquestes variables es llegeixen del fitxer .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Atenció: Falten les variables d\'entorn de Supabase a .env.local');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

