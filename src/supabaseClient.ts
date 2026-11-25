import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Facultatif : sans ces variables (fichier .env, voir .env.example),
// l'application utilise le jeu de données intégré (src/data/lieux.json).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
