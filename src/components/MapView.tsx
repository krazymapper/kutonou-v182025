import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default icon issue in Leaflet + React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { LieuTouristique } from '../lib/lieux';

const icon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});


interface MapViewProps {
  lieux: LieuTouristique[];
  onLieuClick: (lieu: LieuTouristique) => void;
}

export default function MapView({ lieux, onLieuClick }: MapViewProps) {
  useEffect(() => {
    // Fix for marker icon not showing
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl,
      shadowUrl: iconShadow,
    });
  }, []);

  return (
    <MapContainer bounds={[[6.15, 0.75], [12.45, 3.85]]} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lieux.map((lieu) => (
        <Marker 
          key={lieu.id} 
          position={[lieu.latitude, lieu.longitude]} 
          icon={icon}
          eventHandlers={{
            click: () => onLieuClick(lieu),
          }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong>{lieu.nom}</strong>
              <br />
              {lieu.photo_url && (
                <img src={lieu.photo_url} alt={lieu.nom} style={{ width: '100%', maxHeight: 100, objectFit: 'cover', margin: '8px 0' }} />
              )}
              <span style={{ fontSize: 12 }}>{lieu.ville} &mdash; {lieu.type}</span>
              <br />
              <span style={{ fontSize: 12 }}>{lieu.description}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 