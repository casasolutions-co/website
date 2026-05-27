const FEED_URL = 'https://housinganywhere.com/feeds/CASASolutions/CASASolutions.json';

const CITY_MAP: Record<string, string> = {
  'Frankfurt am Main': 'Frankfurt',
  'Köln': 'Cologne',
  'Nürnberg': 'Nuremberg',
  'München': 'Munich',
};

function normalizeCity(city: string): string {
  return CITY_MAP[city] ?? city;
}

export async function GET() {
  let feedData: { listings: { location: { city: string } }[] };
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Feed returned ${res.status}`);
    feedData = await res.json();
  } catch {
    return Response.json({ error: 'Failed to fetch feed' }, { status: 502 });
  }

  const citySet = new Set<string>();
  for (const l of feedData.listings) {
    if (l.location?.city) citySet.add(normalizeCity(l.location.city));
  }

  const cities = Array.from(citySet).sort((a, b) => a.localeCompare(b));

  return Response.json(cities, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
