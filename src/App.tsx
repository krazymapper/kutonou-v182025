import { useState, useEffect } from 'react'
import './App.css'
import MapView from './components/MapView';
import FiltersBar from './components/FiltersBar';
import LieuDetailModal from './components/LieuDetailModal';
import { useFavorites } from './hooks/useFavorites';
import { chargerLieux, DATASET_INFO, type LieuTouristique } from './lib/lieux';

function App() {
  const [lieux, setLieux] = useState<LieuTouristique[]>([]);
  const [origine, setOrigine] = useState<'supabase' | 'integre'>('integre');
  const [selectedVille, setSelectedVille] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLieu, setSelectedLieu] = useState<LieuTouristique | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toggleFavorite, isFavorite } = useFavorites();

  // Chargement unique au montage (l'ancienne version relançait la requête à
  // chaque rendu : ses dépendances changeaient à chaque fois).
  useEffect(() => {
    let actif = true;
    chargerLieux().then((r) => {
      if (!actif) return;
      setLieux(r.lieux);
      setOrigine(r.origine);
      setIsLoading(false);
    });
    return () => { actif = false; };
  }, []);

  const coll = new Intl.Collator('fr', { sensitivity: 'base' });
  const villes = Array.from(new Set(lieux.map(l => l.ville))).sort(coll.compare);
  const types = Array.from(new Set(lieux.map(l => l.type))).sort(coll.compare);

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
              <h1 className="text-2xl font-bold text-gray-900">Kutonu</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {origine === 'supabase' ? 'Données : base Kutonu' : `Données : Wikidata (CC0), vérifiées le ${DATASET_INFO.checkedOn}`}
              </span>
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
                <div className="text-sm font-medium text-gray-500">Communes et départements</div>
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
