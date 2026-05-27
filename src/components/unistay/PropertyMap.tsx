'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/lib/unistay/types';

/* ── City fallback coordinates ──────────────────────────────────────────── */
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

/* ── Deterministic jitter so same-city pins don't all overlap ─────────── */
function cityJitter(id: string): [number, number] {
  let h = 5381;
  for (const c of id) h = ((h << 5) + h + c.charCodeAt(0)) & 0xffffffff;
  return [((h & 0xffff) / 65535 - 0.5) * 0.015, (((h >> 16) & 0xffff) / 65535 - 0.5) * 0.022];
}

/* ── Nominatim geocoder (module-level cache + queue, 1 req/s) ─────────── */
const GEO_CACHE = new Map<string, [number, number] | null>();
const GEO_QUEUE: Array<{
  key: string;
  query: string;
  resolve: (r: [number, number] | null) => void;
}> = [];
let GEO_ACTIVE = false;

async function drainQueue() {
  if (GEO_ACTIVE || GEO_QUEUE.length === 0) return;
  GEO_ACTIVE = true;
  while (GEO_QUEUE.length > 0) {
    const item = GEO_QUEUE.shift()!;
    if (GEO_CACHE.has(item.key)) {
      item.resolve(GEO_CACHE.get(item.key) ?? null);
      continue;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(item.query)}&format=json&limit=1&countrycodes=de`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CasaSolutions/1.0 (student-housing-search)' },
      });
      const data: Array<{ lat: string; lon: string }> = await res.json();
      const coords = data[0] ? ([parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number]) : null;
      GEO_CACHE.set(item.key, coords);
      item.resolve(coords);
    } catch {
      GEO_CACHE.set(item.key, null);
      item.resolve(null);
    }
    // Nominatim rate limit: 1 request / second
    await new Promise((r) => setTimeout(r, 1100));
  }
  GEO_ACTIVE = false;
}

function geocode(address: string, city: string): Promise<[number, number] | null> {
  const query = [address, city, 'Germany'].filter(Boolean).join(', ');
  const key = query.toLowerCase();
  if (GEO_CACHE.has(key)) return Promise.resolve(GEO_CACHE.get(key) ?? null);
  return new Promise((resolve) => {
    GEO_QUEUE.push({ key, query, resolve });
    drainQueue();
  });
}

/* ── Pin icon ─────────────────────────────────────────────────────────── */
function makePricePin(price: number, selected: boolean, geocoded: boolean) {
  const label = price >= 1000 ? `€${(price / 1000).toFixed(1)}k` : `€${price}`;
  const bg     = selected  ? '#2563eb' : '#0f172a';
  const border = selected  ? '#93c5fd' : 'white';
  const opacity = geocoded ? '1' : '0.7';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};color:white;opacity:${opacity};
      border:2px solid ${border};border-radius:999px;
      padding:3px 8px;font-size:11px;font-weight:700;
      white-space:nowrap;cursor:pointer;
      box-shadow:0 2px 8px rgba(0,0,0,0.28);
      transform:${selected ? 'scale(1.18)' : 'scale(1)'};
      transition:transform 0.12s;
    ">${label}</div>`,
    iconSize: [60, 26],
    iconAnchor: [30, 13],
  });
}

/* ── Auto-fit map to visible pins ─────────────────────────────────────── */
type Coords = [number, number];

function BoundsController({ pins }: { pins: Coords[] }) {
  const map = useMap();
  const key = pins.map((p) => p.join(',')).join('|');
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) { map.setView(pins[0], 15); return; }
    const bounds = L.latLngBounds(pins);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

/* ── Main component ─────────────────────────────────────────────────────── */
interface PropertyMapProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function PropertyMap({ properties, selectedId, onSelect }: PropertyMapProps) {
  // Geocoded coords arrive asynchronously — stored per property id
  const [geocodedCoords, setGeocodedCoords] = useState<Record<string, Coords>>({});

  // Kick off geocoding for properties without known coordinates (cap at 25)
  useEffect(() => {
    let cancelled = false;
    const toGeocode = properties
      .filter((p) => !p.lat && !p.lng && p.address && p.address.trim().length > 2)
      .slice(0, 25);

    for (const p of toGeocode) {
      geocode(p.address, p.city).then((coords) => {
        if (!cancelled && coords) {
          setGeocodedCoords((prev) => ({ ...prev, [p.id]: coords })); // eslint-disable-line react-hooks/set-state-in-effect
        }
      });
    }
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.map((p) => p.id).join(',')]);

  // Build final pin list: exact coord > geocoded > city+jitter
  const pins = useMemo(() => {
    const result: Array<{ p: Property; coords: Coords; geocoded: boolean }> = [];
    for (const p of properties) {
      let coords: Coords | null = null;
      let geocoded = false;

      if (p.lat && p.lng) {
        coords = [p.lat, p.lng];
        geocoded = true;
      } else if (geocodedCoords[p.id]) {
        coords = geocodedCoords[p.id];
        geocoded = true;
      } else {
        const base = CITY_COORDS[p.city];
        if (base) {
          const [dLat, dLng] = cityJitter(p.id);
          coords = [base[0] + dLat, base[1] + dLng];
        }
      }

      if (coords) result.push({ p, coords, geocoded });
      if (result.length >= 150) break;
    }
    return result;
  }, [properties, geocodedCoords]);

  return (
    <MapContainer
      center={[51.165, 10.451]}
      zoom={6}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsController pins={pins.map((pin) => pin.coords)} />

      {pins.map(({ p, coords, geocoded }) => (
        <Marker
          key={p.id}
          position={coords}
          icon={makePricePin(p.price, p.id === selectedId, geocoded)}
          eventHandlers={{ click: () => onSelect?.(p.id) }}
          zIndexOffset={p.id === selectedId ? 1000 : 0}
        >
          <Popup>
            <div style={{ minWidth: 160, fontFamily: 'inherit' }}>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{p.title}</p>
              <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 6 }}>
                {p.address ? `${p.address}, ` : ''}{p.city}
              </p>
              <p style={{ fontWeight: 700, color: '#2563eb', fontSize: 15, marginBottom: 8 }}>
                €{p.price}
                <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 11 }}>/mo</span>
              </p>
              {p.source === 'housinganywhere' ? (
                <a href={(p as { externalUrl: string }).externalUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:'block', background:'#2563eb', color:'white', textDecoration:'none', textAlign:'center', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                  View on HousingAnywhere
                </a>
              ) : (
                <a href={`/unistay/properties/${p.id}`}
                  style={{ display:'block', background:'#2563eb', color:'white', textDecoration:'none', textAlign:'center', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                  View listing
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
