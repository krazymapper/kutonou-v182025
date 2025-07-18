import { useState, useEffect } from 'react';

interface LieuTouristique {
  id: string;
  nom: string;
  description: string;
  ville: string;
  type: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
}

interface OfflineData {
  lieux: LieuTouristique[];
  lastUpdated: string;
}

export function useOfflineData() {
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Charger les données offline au démarrage
    const storedData = localStorage.getItem('kutonu-offline-data');
    if (storedData) {
      try {
        setOfflineData(JSON.parse(storedData));
      } catch (error) {
        console.error('Erreur lors du chargement des données offline:', error);
      }
    }

    // Écouter les changements de connectivité
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = (lieux: LieuTouristique[]) => {
    const data: OfflineData = {
      lieux,
      lastUpdated: new Date().toISOString(),
    };
    
    setOfflineData(data);
    localStorage.setItem('kutonu-offline-data', JSON.stringify(data));
  };

  const getOfflineData = () => offlineData?.lieux || [];

  const isDataStale = () => {
    if (!offlineData) return true;
    
    const lastUpdated = new Date(offlineData.lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    // Considérer les données comme obsolètes après 24h
    return hoursDiff > 24;
  };

  return {
    offlineData: getOfflineData(),
    isOnline,
    saveOfflineData,
    isDataStale,
  };
} 