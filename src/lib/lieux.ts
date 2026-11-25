import dataset from '../data/lieux.json';
import { supabase } from '../supabaseClient';

export interface LieuTouristique {
  id: string;
  nom: string;
  description: string;
  ville: string;
  type: string;
  latitude: number;
  longitude: number;
  photo_url?: string | null;
  wikipedia_url?: string | null;
  source_url?: string | null;
}

export const DATASET_INFO = { source: dataset.source, checkedOn: dataset.checked_on };
export const LIEUX_INTEGRES: LieuTouristique[] = dataset.lieux;

/**
 * Charge les lieux : Supabase si configuré et joignable, sinon le jeu intégré
 * (inclus dans le bundle, donc disponible hors ligne).
 */
export async function chargerLieux(): Promise<{ lieux: LieuTouristique[]; origine: 'supabase' | 'integre' }> {
  if (supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase.from('lieux_touristiques').select('*');
      if (!error && data && data.length > 0) return { lieux: data as LieuTouristique[], origine: 'supabase' };
    } catch {
      /* repli sur le jeu intégré */
    }
  }
  return { lieux: LIEUX_INTEGRES, origine: 'integre' };
}
