import { useState, useEffect } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import MapView from './components/MapView';
import FiltersBar from './components/FiltersBar';
import LieuDetailModal from './components/LieuDetailModal';
import { supabase } from './supabaseClient';
import { useFavorites } from './hooks/useFavorites';
import { useOfflineData } from './hooks/useOfflineData';

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

function App() {
  const [lieux, setLieux] = useState<LieuTouristique[]>([]);
  const [selectedVille, setSelectedVille] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLieu, setSelectedLieu] = useState<LieuTouristique | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { offlineData, isOnline, saveOfflineData } = useOfflineData();

  useEffect(() => {
    const fetchLieux = async () => {
      setIsLoading(true);
      
      // Si on est offline et qu'on a des données en cache, les utiliser
      if (!isOnline && offlineData.length > 0) {
        setLieux(offlineData);
        setIsLoading(false);
        return;
      }

      // Si on est online, récupérer depuis Supabase
      if (isOnline) {
        const { data, error } = await supabase.from('lieux_touristiques').select('*');
        if (!error && data) {
          setLieux(data);
          saveOfflineData(data); // Sauvegarder pour l'offline
        }
      }
      
      setIsLoading(false);
    };
    
    fetchLieux();
  }, [isOnline, offlineData, saveOfflineData]);

  const villes = Array.from(new Set(lieux.map(l => l.ville))).sort();
  const types = Array.from(new Set(lieux.map(l => l.type))).sort();

  const lieuxFiltres = lieux.filter(lieu =>
    (selectedVille === '' || lieu.ville === selectedVille) &&
    (selectedType === '' || lieu.type === selectedType)
  );

  const handleLieuClick = (lieu: LieuTouristique) => {
    setSelectedLieu(lieu);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLieu(null);
  };

  const handleToggleFavorite = (lieuId: string) => {
    toggleFavorite(lieuId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src={viteLogo} className="h-8 w-8" alt="Logo" />
              <h1 className="text-2xl font-bold text-gray-900">Kutonu</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Mode hors ligne
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <FiltersBar
              villes={villes}
              types={types}
              selectedVille={selectedVille}
              selectedType={selectedType}
              onVilleChange={setSelectedVille}
              onTypeChange={setSelectedType}
            />
            
            <div className="bg-white rounded-lg shadow">
              <MapView lieux={lieuxFiltres} onLieuClick={handleLieuClick} />
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Lieux affichés</div>
                <div className="text-2xl font-bold text-gray-900">{lieuxFiltres.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Total des lieux</div>
                <div className="text-2xl font-bold text-gray-900">{lieux.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Villes</div>
                <div className="text-2xl font-bold text-gray-900">{villes.length}</div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal de détail */}
      <LieuDetailModal
        lieu={selectedLieu}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
      />
    </div>
  );
}

export default App
