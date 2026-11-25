import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


interface LieuDetailModalProps {
  lieu: LieuTouristique | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (lieuId: string) => void;
  isFavorite: (lieuId: string) => boolean;
}

// Fix default icon issue in Leaflet + React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { LieuTouristique } from '../lib/lieux';

const icon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

export default function LieuDetailModal({ lieu, isOpen, onClose, onToggleFavorite, isFavorite }: LieuDetailModalProps) {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fix for marker icon not showing
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl,
        shadowUrl: iconShadow,
      });
      setIsMapReady(true);
    }
  }, [isOpen]);

  if (!isOpen || !lieu) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{lieu.nom}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleFavorite(lieu.id)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite(lieu.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {lieu.photo_url && (
                <img
                  src={lieu.photo_url}
                  alt={lieu.nom}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {lieu.ville}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    {lieu.type}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{lieu.description || 'Pas de description sur Wikidata.'}</p>
                <p className="mt-3 text-sm text-gray-500 space-x-3">
                  {lieu.wikipedia_url && (
                    <a className="text-blue-700 underline" href={lieu.wikipedia_url} target="_blank" rel="noopener noreferrer">Article Wikipédia</a>
                  )}
                  {lieu.source_url && (
                    <a className="text-blue-700 underline" href={lieu.source_url} target="_blank" rel="noopener noreferrer">Source (Wikidata)</a>
                  )}
                </p>
              </div>
            </div>

            <div className="h-64 lg:h-auto">
              {isMapReady && (
                <MapContainer
                  center={[lieu.latitude, lieu.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lieu.latitude, lieu.longitude]} icon={icon}>
                    <Popup>
                      <strong>{lieu.nom}</strong>
                    </Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 