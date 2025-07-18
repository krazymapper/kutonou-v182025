import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Charger les favoris depuis localStorage au démarrage
    const storedFavorites = localStorage.getItem('kutonu-favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = (lieuId: string) => {
    const newFavorites = favorites.includes(lieuId)
      ? favorites.filter(id => id !== lieuId)
      : [...favorites, lieuId];
    
    setFavorites(newFavorites);
    localStorage.setItem('kutonu-favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (lieuId: string) => favorites.includes(lieuId);

  const getFavorites = () => favorites;

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavorites,
  };
} 