import { useState, useMemo, useEffect } from 'react';
import { HOSPITALS, SPECIALIZATIONS } from '../data/hospitals';
import { MapPin, Phone, Star, Bed, Zap, Filter, Search, Map, List } from 'lucide-react';

const RATING_COLOR = (r) =>
  r >= 4.8 ? 'text-green-600 dark:text-green-400' :
    r >= 4.5 ? 'text-primary-600 dark:text-primary-400' :
      'text-amber-600 dark:text-amber-400';

function HospitalCard({ h }) {
  return (
    <div className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
            {h.image}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
              {h.name}
            </h3>
            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mt-1">
              {h.specialization}
            </span>
          </div>
        </div>
        {h.emergency && (
          <span className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
            <Zap className="w-3 h-3" /> 24/7
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className={`flex items-center justify-center gap-0.5 font-bold text-base ${RATING_COLOR(h.rating)}`}>
            <Star className="w-3.5 h-3.5 fill-current" /> {h.rating}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Rating</p>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <p className="font-bold text-slate-800 dark:text-white text-base">{h.distance}</p>
          <p className="text-xs text-slate-400 mt-0.5">Distance</p>
        </div>
        <div className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center justify-center gap-0.5 font-bold text-slate-800 dark:text-white text-base">
            <Bed className="w-3.5 h-3.5 text-primary-400" /> {h.beds}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Beds</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
        <p className="flex items-start gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-400" /> {h.address}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4 flex-shrink-0 text-accent-400" /> {h.phone}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <a
          href={`tel:${h.phone.replace(/\s/g, '')}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 active:scale-95 transition-all"
        >
          <Phone className="w-4 h-4" /> Call Now
        </a>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
          <MapPin className="w-4 h-4" /> Directions
        </button>
      </div>
    </div>
  );
}

export default function Hospitals() {
  const [selected, setSelected] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const [hospitalsLive, setHospitalsLive] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Fetch live hospitals from Overpass (centered on Pune by default).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let controller = new AbortController();
    const fetchLive = async () => {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const lat = 18.5204;
        const lng = 73.8567;
        const radius = 9000;
        const query = `\n[out:json][timeout:25];\n(\n  node(around:${radius},${lat},${lng})["amenity"~"hospital|clinic|pharmacy"];\n);\nout body;\n`;

        const resp = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal
        });
        if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
        const json = await resp.json();
        const els = json.elements || [];

        const mapped = els
          .filter(e => e.lat && e.lon)
          .map((e) => {
            const tags = e.tags || {};
            return {
              id: `osm-${e.type}-${e.id}`,
              name: tags.name || tags.operator || 'Unnamed Facility',
              specialization: tags.speciality || tags.healthcare || 'General',
              rating: 4.6,
              distance: 'N/A',
              address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || tags['addr:full'] || '',
              phone: tags.phone || tags['contact:phone'] || 'N/A',
              beds: tags.beds || 0,
              emergency: false,
              image: '🏥',
              lat: e.lat,
              lng: e.lon
            };
          });

        setHospitalsLive(mapped);
      } catch (err) {
        console.error(err);
        setLiveError(err.message || 'Fetch failed');
        setHospitalsLive([]);
      } finally {
        setLiveLoading(false);
      }
    };

    // Debounce search a bit
    const t = setTimeout(fetchLive, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [search]);

  const filtered = useMemo(() => {
    return hospitalsLive.filter(h => {
      const matchSpec = selected === 'All' || h.specialization === selected;
      const matchSearch = !search.trim() || [h.name, h.address, h.specialization]
        .some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
      return matchSpec && matchSearch;
    });
  }, [selected, search, hospitalsLive]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
            Hospital Directory
          </span>
          <h1 className="section-title mb-4">
            Find <span className="text-gradient">Specialist Hospitals</span>
          </h1>
          <p className="section-subtitle">
            Discover top-rated hospitals near you, filtered by medical specialization.
          </p>
        </div>

        {/* ── View Toggle ── */}
        <div className="flex justify-center gap-3 mb-8 animate-slide-up">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${viewMode === 'list'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <List className="w-4 h-4" /> List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${viewMode === 'map'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <Map className="w-4 h-4" /> Map View
          </button>
        </div>

        {/* ── Map View ── */}
        {viewMode === 'map' && (
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-700" style={{ height: '600px' }}>
            <iframe
              src="/map-module/index.html"
              className="w-full h-full border-0"
              title="MEDIVISION Hospital Finder Map"
              allow="geolocation"
              style={{ borderRadius: '16px' }}
            />
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === 'list' && (
          <>
            {/* ── Filters ── */}
            <div className="card p-4 mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="hospital-search"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search hospitals, specialization, location…"
                    className="input-field pl-10"
                  />
                </div>

                {/* Specialization filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map(s => (
                      <button
                        key={s}
                        id={`filter-${s.toLowerCase().replace(/\s/g, '-')}`}
                        onClick={() => setSelected(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${selected === s
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Results count ── */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {liveLoading ? (
                'Loading live hospitals...'
              ) : liveError ? (
                `Error loading live data: ${liveError}`
              ) : (
                <>Showing <span className="font-semibold text-slate-800 dark:text-white">{filtered.length}</span> live hospitals</>
              )}
              {selected !== 'All' && <> in <span className="text-primary-600 dark:text-primary-400 font-semibold">{selected}</span></>}
            </p>

            {/* ── Hospital Grid ── */}
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((h, i) => (
                  <div key={h.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <HospitalCard h={h} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hospitals found</p>
                <p className="text-slate-500">Try adjusting your search or filter.</p>
                <button
                  onClick={() => { setSelected('All'); setSearch(''); }}
                  className="mt-4 btn-secondary text-sm py-2 px-4"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
