'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, Search, MapPin } from 'lucide-react';
import { PropertyCard } from '@/components/unistay/PropertyCard';
import { FilterSidebar } from '@/components/unistay/FilterSidebar';
import { Breadcrumbs } from '@/components/unistay/ui/breadcrumbs';
import { Combobox } from '@/components/unistay/ui/combobox';
import { useFirestoreListings } from '@/lib/unistay/useFirestoreListings';
import type { ExternalProperty, FilterValues, Property } from '@/lib/unistay/types';

const DEFAULT_FILTERS: FilterValues = {
  search: '',
  type: '',
  city: '',
  minPrice: 0,
  maxPrice: 3000,
  bedrooms: 'all',
  features: [],
  dateFrom: '',
  dateTo: '',
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Available soonest' },
];

const POPULAR_CITIES = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'];

type SourceTab = 'all' | 'casa' | 'housinganywhere';

// Each word in query must appear (as substring or char-sequence) in target
function fuzzyIncludes(query: string, target: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/);
  const t = target.toLowerCase();
  return words.every((word) => {
    if (!word) return true;
    if (t.includes(word)) return true;
    let qi = 0;
    for (const ch of t) {
      if (ch === word[qi]) qi++;
      if (qi === word.length) return true;
    }
    return false;
  });
}

function applyFilters(properties: Property[], filters: FilterValues): Property[] {
  return properties.filter((p) => {
    if (filters.search) {
      const target = `${p.title} ${p.city} ${p.address ?? ''}`;
      if (!fuzzyIncludes(filters.search, target)) return false;
    }
    if (filters.type && p.type !== filters.type) return false;
    if (filters.city) {
      const fc = filters.city.toLowerCase();
      const pc = p.city.toLowerCase();
      if (!pc.includes(fc) && !fc.includes(pc)) return false;
    }
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (filters.bedrooms && filters.bedrooms !== 'all') {
      const n = parseInt(filters.bedrooms);
      if (n === 3 ? p.bedrooms < 3 : p.bedrooms !== n) return false;
    }
    if (filters.features.length > 0) {
      if (!filters.features.every((f) => p.features.includes(f))) return false;
    }
    return true;
  });
}

function sortProperties(properties: Property[], sortBy: string): Property[] {
  return [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'newest':
        return new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime();
      default: {
        const aFeatured = a.source === 'casa' && (a as { featured?: boolean }).featured ? 1 : 0;
        const bFeatured = b.source === 'casa' && (b as { featured?: boolean }).featured ? 1 : 0;
        return bFeatured - aFeatured;
      }
    }
  });
}

function countActiveFilters(filters: FilterValues): number {
  let count = 0;
  if (filters.type) count++;
  if (filters.city) count++;
  if (filters.minPrice > 0 || filters.maxPrice < 3000) count++;
  if (filters.bedrooms && filters.bedrooms !== 'all') count++;
  if (filters.features.length) count += filters.features.length;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  return count;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [sourceTab, setSourceTab] = useState<SourceTab>('all');
  const [haListings, setHaListings] = useState<ExternalProperty[]>([]);
  const [haLoading, setHaLoading] = useState(false);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { listings: firestoreListings, loading: listingsLoading } = useFirestoreListings();

  const [filters, setFilters] = useState<FilterValues>(() => ({
    ...DEFAULT_FILTERS,
    type:     searchParams.get('type') ?? '',
    city:     searchParams.get('city') ?? '',
    search:   searchParams.get('q') ?? '',
    minPrice: Number(searchParams.get('minPrice') ?? 0),
    maxPrice: Number(searchParams.get('maxPrice') ?? 3000),
    bedrooms: searchParams.get('bedrooms') ?? 'all',
    features: searchParams.get('features')?.split(',').filter(Boolean) ?? [],
    dateFrom: searchParams.get('from') ?? '',
    dateTo:   searchParams.get('to') ?? '',
  }));

  const hasSearch = !!(filters.city || filters.search);

  useEffect(() => {
    fetch('/api/unistay/cities')
      .then((r) => r.json())
      .then((data: string[]) => setCities(data.map((c) => ({ value: c, label: c })))) // eslint-disable-line react-hooks/set-state-in-effect
      .catch(() => {});
  }, []);

  const fetchHA = useCallback((f: FilterValues) => {
    if (!f.city && !f.search) {
      setHaListings([]);
      setHaLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setHaLoading(true);
      try {
        const params = new URLSearchParams();
        if (f.city) params.set('city', f.city);
        if (f.type) params.set('type', f.type);
        if (f.minPrice > 0) params.set('minPrice', String(f.minPrice));
        if (f.maxPrice < 3000) params.set('maxPrice', String(f.maxPrice));
        if (f.bedrooms && f.bedrooms !== 'all') params.set('bedrooms', f.bedrooms);
        const res = await fetch(`/api/unistay/listings?${params}`);
        if (res.ok) setHaListings(await res.json());
      } finally {
        setHaLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (hasSearch) fetchHA(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const syncUrl = useCallback((f: FilterValues) => {
    const params = new URLSearchParams();
    if (f.type) params.set('type', f.type);
    if (f.city) params.set('city', f.city);
    if (f.search) params.set('q', f.search);
    if (f.minPrice > 0) params.set('minPrice', String(f.minPrice));
    if (f.maxPrice < 3000) params.set('maxPrice', String(f.maxPrice));
    if (f.bedrooms && f.bedrooms !== 'all') params.set('bedrooms', f.bedrooms);
    if (f.features.length) params.set('features', f.features.join(','));
    if (f.dateFrom) params.set('from', f.dateFrom);
    if (f.dateTo) params.set('to', f.dateTo);
    router.replace(`/unistay/search?${params.toString()}`, { scroll: false });
  }, [router]);

  function handleFilterChange(f: FilterValues) {
    setFilters(f);
    syncUrl(f);
    fetchHA(f);
  }

  function handleClear() {
    setFilters(DEFAULT_FILTERS);
    setHaListings([]);
    router.replace('/unistay/search', { scroll: false });
  }

  function handleSearchInput(value: string) {
    const next = { ...filters, search: value };
    setFilters(next);
    syncUrl(next);
    fetchHA(next);
  }

  function handleCityQuickSelect(city: string) {
    const next = { ...filters, city };
    setFilters(next);
    syncUrl(next);
    fetchHA(next);
  }

  const casaPool: Property[] = firestoreListings;
  const allPool: Property[] = [...casaPool, ...haListings];

  const sourcePool =
    sourceTab === 'casa'          ? casaPool :
    sourceTab === 'housinganywhere' ? haListings :
    allPool;

  const filtered  = applyFilters(sourcePool, filters);
  const sorted    = sortProperties(filtered, sortBy);
  const activeCount = countActiveFilters(filters);
  const casaCount    = applyFilters(casaPool,    filters).length;
  const externalCount = applyFilters(haListings, filters).length;
  const totalCount   = casaCount + externalCount;

  const nav = (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors shrink-0"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        Back
      </button>
      <Breadcrumbs
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'UniStay', href: '/unistay/browse' },
          { label: 'Search results' },
        ]}
        className=""
      />
    </div>
  );

  /* ── Empty state ── */
  if (!hasSearch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-8 pb-6">{nav}</div>

        <div className="flex items-center justify-center px-4 pb-20" style={{ minHeight: 'calc(100vh - 180px)' }}>
          <div className="w-full max-w-md text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Find your student home</h1>
            <p className="text-gray-500 text-sm mb-8">
              Search thousands of properties across Germany. Start by picking a city or entering a keyword.
            </p>

            {/* Search card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 space-y-4 text-left mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 block">City</label>
                <Combobox
                  options={cities}
                  value={filters.city}
                  onChange={(v) => handleCityQuickSelect(v)}
                  placeholder="Select or search city..."
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 block">Keyword search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="e.g. furnished studio Berlin..."
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filters.search) handleSearchInput(filters.search);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Popular cities */}
            <div>
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Popular cities</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCityQuickSelect(c)}
                    className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Results state ── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {nav}

        {/* Global text search bar */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search by title, keyword, or neighbourhood…"
            className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-11 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Source Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit">
          {(
            [
              { key: 'all',            label: `All (${totalCount})` },
              { key: 'casa',           label: `Casa Managed (${casaCount})` },
              { key: 'housinganywhere', label: `HousingAnywhere (${externalCount})` },
            ] as { key: SourceTab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSourceTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sourceTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClear}
                activeCount={activeCount}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-blue-400"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters {activeCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>

              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{sorted.length}</span>{' '}
                {sorted.length === 1 ? 'property' : 'properties'}
              </p>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {listingsLoading || haLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">No properties match your search</p>
                <p className="text-gray-400 text-sm mb-4">Try different keywords, a different city, or adjust your filters</p>
                <button onClick={handleClear} className="text-blue-600 text-sm hover:underline">
                  Clear and start over
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sorted.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-lg">Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={(f) => { handleFilterChange(f); }}
              onClear={() => { handleClear(); setSidebarOpen(false); }}
              activeCount={activeCount}
            />
            <div className="pt-4 mt-4 border-t">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Show {sorted.length} {sorted.length === 1 ? 'property' : 'properties'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
