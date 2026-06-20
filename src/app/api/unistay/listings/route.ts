import type { ExternalProperty, PropertyType } from '@/lib/unistay/types';
import { NextRequest } from 'next/server';
import { d1Run } from '@/lib/unistay/d1';
import { randomUUID } from 'crypto';

const FEED_URL = 'https://housinganywhere.com/feeds/CASASolutions/CASASolutions.json';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Raw feed cached in memory — reloaded once per hour
let feedCache: { data: { listings: unknown[] }; fetchedAt: number } | null = null;

async function getHAFeed(): Promise<{ listings: unknown[] }> {
  if (feedCache && Date.now() - feedCache.fetchedAt < CACHE_TTL) return feedCache.data;
  const res = await fetch(FEED_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Feed returned ${res.status}`);
  const data = await res.json() as { listings: unknown[] };
  feedCache = { data, fetchedAt: Date.now() };
  return data;
}

// Normalize city names from the feed to match our filter values
const CITY_MAP: Record<string, string> = {
  'Frankfurt am Main': 'Frankfurt',
  'Köln': 'Cologne',
  'Nürnberg': 'Nuremberg',
  'München': 'Munich',
};

function normalizeCity(city: string): string {
  return CITY_MAP[city] ?? city;
}

type HAFacilities = Record<string, { value: string }>;

function mapType(kindLabel: string, bedrooms: number): PropertyType {
  if (kindLabel === 'shared room') return 'shared';
  if (kindLabel === 'private room') return 'room';
  if (bedrooms === 0) return 'studio';
  return 'apartment';
}

function mapFeatures(fac: HAFacilities): string[] {
  const f: string[] = [];
  if (fac.wifi?.value === 'yes') f.push('wifi');
  if (fac.bedroomFurnished?.value === 'yes' || fac.roomFurniture?.value === 'yes') f.push('furnished');
  if (
    fac.electricityCostIncluded?.value === 'yes' &&
    fac.gasCostIncluded?.value === 'yes' &&
    fac.waterCostIncluded?.value === 'yes'
  ) f.push('bills');
  if (fac.parking?.value === 'yes') f.push('parking');
  if (fac.balconyTerrace?.value === 'private' || fac.balconyTerrace?.value === 'shared') f.push('balcony');
  return f;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transform(l: any): ExternalProperty | null {
  const price = parseFloat(l.costsFormatted?.price ?? '0');
  if (price <= 0) return null;

  const fac: HAFacilities = l.facilities ?? {};
  const size = Math.round(parseFloat(fac.totalSize?.value ?? '0'));
  const bedrooms = parseInt(fac.bedrooms?.value ?? '1') || 1;
  const avail = l.available?.[0]?.from ?? '';
  const img =
    l.images?.[0]?.sizes?.['1024x768']?.link ??
    l.images?.[0]?.originalLink ??
    '';

  // Try several field names the HA feed may use for coordinates
  const lat: number | undefined =
    typeof l.location?.geoPoint?.lat  === 'number' ? l.location.geoPoint.lat  :
    typeof l.location?.lat            === 'number' ? l.location.lat            :
    typeof l.lat                      === 'number' ? l.lat                     : undefined;
  const lng: number | undefined =
    typeof l.location?.geoPoint?.lng  === 'number' ? l.location.geoPoint.lng  :
    typeof l.location?.lng            === 'number' ? l.location.lng            :
    typeof l.lng                      === 'number' ? l.lng                     :
    typeof l.location?.geoPoint?.lon  === 'number' ? l.location.geoPoint.lon  : undefined;

  return {
    source: 'housinganywhere',
    id: `ha-${l.id}`,
    title: l.title,
    type: mapType(l.kindLabel, bedrooms),
    city: normalizeCity(l.location.city),
    address: [l.location.street, l.location.neighborhood].filter(Boolean).join(', '),
    price: Math.round(price),
    bedrooms,
    size,
    availableFrom: avail,
    image: img,
    features: mapFeatures(fac),
    externalUrl: l.originalLink,
    lat,
    lng,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, type, city, address, price, bedrooms, size,
    availableFrom, description, images, features,
    lat, lng, coldRent, utilityEstimate, submittedBy,
  } = body;

  if (!title || !city || !price || !submittedBy) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await d1Run(
    `INSERT INTO listings (id, source, title, type, city, address, price, bedrooms, size,
       available_from, description, featured, lat, lng, cold_rent, utility_estimate,
       status, submitted_by, submitted_at, created_at)
     VALUES (?, 'casa', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'pending_review', ?, ?, ?)`,
    [id, title, type ?? 'studio', city, address ?? '', price,
     bedrooms ?? 1, size ?? 0, availableFrom ?? '',
     description ?? '', lat ?? null, lng ?? null,
     coldRent ?? null, utilityEstimate ?? null,
     submittedBy, now, now],
  );

  if (Array.isArray(images)) {
    for (const url of images as string[]) {
      await d1Run('INSERT INTO listing_images (listing_id, image_url) VALUES (?, ?)', [id, url]);
    }
  }

  if (Array.isArray(features)) {
    for (const f of features as string[]) {
      await d1Run('INSERT INTO listing_features (listing_id, feature) VALUES (?, ?)', [id, f]);
    }
  }

  return Response.json({ ok: true, id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city') ?? '';
  const type = searchParams.get('type') ?? '';
  const minPrice = parseInt(searchParams.get('minPrice') ?? '0');
  const maxPrice = parseInt(searchParams.get('maxPrice') ?? '99999');
  const bedrooms = searchParams.get('bedrooms') ?? 'all';

  let feed: { listings: unknown[] };
  try {
    feed = await getHAFeed();
  } catch {
    return Response.json({ error: 'Failed to fetch listings' }, { status: 502 });
  }

  // Filter on raw fields first (cheap), then transform only the matching subset
  const cityQ = city.toLowerCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (feed.listings as any[]).filter((l) => {
    if (cityQ) {
      const lCity = normalizeCity(l.location?.city ?? '').toLowerCase();
      if (!lCity.includes(cityQ) && !cityQ.includes(lCity)) return false;
    }
    return true;
  });

  const listings = raw
    .map(transform)
    .filter((p): p is ExternalProperty => p !== null)
    .filter((p) => !type || p.type === type)
    .filter((p) => p.price >= minPrice && p.price <= maxPrice)
    .filter((p) => bedrooms === 'all' || p.bedrooms === parseInt(bedrooms))
    .slice(0, 200);

  return Response.json(listings, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
