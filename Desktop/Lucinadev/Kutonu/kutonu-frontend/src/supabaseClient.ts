import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co'; // Remplace par ton URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Remplace par ta clé publique

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 