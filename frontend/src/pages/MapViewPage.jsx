import { useState, useEffect, useRef } from 'react';
import { Search, Navigation, Layers, X, ArrowRight, Star } from 'lucide-react';
import { businessService } from '../services/businessService';
import { useLocation } from '../context/LocationContext';
import { PRIMARY_CATEGORIES, CITIES_AND_REGIONS } from '../utils/constants';
import InteractiveMap from '../components/map/InteractiveMap';
import BusinessCard from '../components/business/BusinessCard';

export default function MapViewPage() {
  const { coordinates, localityName, requestCurrentLocation, isLocating, selectLocality } =
    useLocation();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const activeReqRef = useRef(0);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const reqId = ++activeReqRef.current;
    const fetchMapBusinesses = async () => {
      setLoading(true);
      try {
        const res = await businessService.getBusinesses({
          search: debouncedSearch,
          category: category === 'All' ? undefined : category,
          limit: 50,
          lat: coordinates.lat,
          lng: coordinates.lng,
        });
        if (reqId === activeReqRef.current) {
          setBusinesses(res.data.businesses || []);
        }
      } catch (err) {
        if (reqId === activeReqRef.current) {
          console.error('Error fetching map businesses:', err);
          setBusinesses([]);
        }
      } finally {
        if (reqId === activeReqRef.current) {
          setLoading(false);
        }
      }
    };

    fetchMapBusinesses();
  }, [debouncedSearch, category, coordinates]);

  return (
    <div className="relative h-[calc(100vh-4.5rem)] w-full overflow-hidden flex flex-col">
      {/* Floating Search & Filter Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2.5 items-center">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter map by name, dish, or service..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category Select */}
          <div className="w-full sm:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {PRIMARY_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Locality Quick Jump */}
          <div className="w-full sm:w-48">
            <select
              onChange={(e) => e.target.value && selectLocality(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Jump to City / Locality
              </option>
              {CITIES_AND_REGIONS.map((region) => (
                <optgroup key={region.city} label={`📍 ${region.city}`}>
                  {region.localities.map((loc) => (
                    <option key={`${region.city}-${loc.name}`} value={loc.name}>
                      {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* GPS Button */}
          <button
            onClick={requestCurrentLocation}
            disabled={isLocating}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isLocating ? 'Locating...' : 'My GPS'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Map Canvas */}
      <div className="flex-1 w-full h-full">
        <InteractiveMap
          businesses={businesses}
          center={{ lat: coordinates.lat, lng: coordinates.lng }}
          zoom={14}
          selectedBusiness={selectedBusiness}
          onMarkerClick={(biz) => setSelectedBusiness(biz)}
          userLocation={{ lat: coordinates.lat, lng: coordinates.lng }}
          height="100%"
        />
      </div>

      {/* Floating Selected Business Card Drawer (Bottom Left) */}
      {selectedBusiness && (
        <div className="absolute bottom-6 left-6 z-20 w-80 sm:w-96 animate-slide-up">
          <div className="relative">
            <button
              onClick={() => setSelectedBusiness(null)}
              className="absolute -top-3 -right-3 z-30 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-600 transition"
              aria-label="Close card"
            >
              <X className="w-4 h-4" />
            </button>
            <BusinessCard business={selectedBusiness} />
          </div>
        </div>
      )}

      {/* Active Pin Count Badge (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-slate-700">
        📍 {businesses.length} spots plotted
      </div>
    </div>
  );
}
