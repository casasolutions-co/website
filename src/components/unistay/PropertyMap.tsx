'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/lib/unistay/types';

const CITY_COORDS: Record<string, [number, number]> = {
  Berlin:     [52.520, 13.405],
  Munich:     [48.137, 11.576],
  Hamburg:    [53.551, 10.000],
  Frankfurt:  [50.110,  8.682],
  Cologne:    [50.938,  6.960],
  Stuttgart:  [48.775,  9.182],
  Düsseldorf: [51.227,  6.774],
  Dusseldorf: [51.227,  6.774],
  Leipzig:    [51.340, 12.374],
  Dresden:    [51.050, 13.738],
  Nuremberg:  [49.452, 11.077],
  Mannheim:   [49.487,  8.466],
  Dortmund:   [51.514,  7.465],
  Bremen:     [53.075,  8.807],
  Hannover:   [52.374,  9.738],
  Karlsruhe:  [49.006,  8.403],
  Augsburg:   [48.370, 10.898],
  Freiburg:   [47.999,  7.842],
  Heidelberg: [49.398,  8.672],
  Bielefeld:  [52.021,  8.532],
  Münster:    [51.962,  7.626],
  Bonn:       [50.735,  7.100],
  Wiesbaden:  [50.082,  8.240],
  Mainz:      [49.999,  8.274],
  Kiel:       [54.323, 10.133],
  Aachen:     [50.776,  6.084],
  Rostock:    [54.092, 12.099],
  Erfurt:     [50.978, 11.029],
  Kassel:     [51.312,  9.479],
};

function makePinIcon(count: number, selected: boolean) {
  const size = Math.min(52, 34 + Math.floor(Math.log(count + 1)) * 4);
  const bg = selected ? '#2563eb' : '#0f172a';
  const ring = selected ? '#bfdbfe' : 'white';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};color:white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${size < 40 ? 11 : 13}px;font-weight:700;
      border:3px solid ${ring};
      box-shadow:0 2px 10px rgba(0,0,0,0.3);
      cursor:pointer;
      transition:transform 0.15s;
    ">${count < 1000 ? count : '999+'}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Inner component — re-centers map when selected city changes
function MapController({ city }: { city: string }) {
  const map = useMap();
  useEffect(() => {
    const coords = city && CITY_COORDS[city] ? CITY_COORDS[city] : [51.165, 10.451] as [number, number];
    const zoom = city ? 11 : 6;
    map.flyTo(coords, zoom, { animate: true, duration: 0.8 });
  }, [city, map]);
  return null;
}

interface PropertyMapProps {
  properties: Property[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

export default function PropertyMap({ properties, selectedCity, onCitySelect }: PropertyMapProps) {
  const cityGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of properties) {
      if (p.city) counts[p.city] = (counts[p.city] ?? 0) + 1;
    }
    return Object.entries(counts).filter(([city]) => city in CITY_COORDS);
  }, [properties]);

  const initialCenter: [number, number] =
    selectedCity && CITY_COORDS[selectedCity]
      ? CITY_COORDS[selectedCity]
      : [51.165, 10.451];

  return (
    <MapContainer
      center={initialCenter}
      zoom={selectedCity ? 11 : 6}
      className="w-full h-full rounded-xl"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController city={selectedCity} />

      {cityGroups.length === 0 && (
        // No listings in known cities — just show the map with no pins
        <></>
      )}

      {cityGroups.map(([city, count]) => (
        <Marker
          key={city}
          position={CITY_COORDS[city]}
          icon={makePinIcon(count, city === selectedCity)}
          eventHandlers={{ click: () => onCitySelect(city) }}
        >
          <Popup>
            <div style={{ textAlign: 'center', padding: '4px 2px' }}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{city}</p>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>
                {count} {count === 1 ? 'property' : 'properties'}
              </p>
              <button
                onClick={() => onCitySelect(city)}
                style={{
                  background: '#2563eb', color: 'white', border: 'none',
                  padding: '5px 14px', borderRadius: 20, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                View listings
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
