import { Search, Navigation, Filter, RotateCcw, LayoutGrid, List, MapPin, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRIMARY_CATEGORIES, CITIES_AND_REGIONS, ALL_LOCALITIES, HYDERABAD_ZONES } from '../../utils/constants';
import Button from '../common/Button';
import { useState } from 'react';

export default function BusinessFilter({
  filters,
  onFilterChange,
  onReset,
  viewMode,
  onViewModeChange,
  onUseCurrentLocation,
  isLocating,
  localityName,
  onGeocodeAddress,
  onDiscoverLive,
  isDiscovering,
  livePlacesActive,
}) {
  const [customSearch, setCustomSearch] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomLocalitySubmit = async (e) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    if (onGeocodeAddress) {
      const coords = await onGeocodeAddress(customSearch.trim());
      if (coords) {
        onFilterChange('locality', customSearch.trim());
        setShowCustomInput(false);
        setCustomSearch('');
      }
    } else {
      onFilterChange('locality', customSearch.trim());
      setShowCustomInput(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Search Input and Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search businesses, biryani, clinics, salon, gym..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-3">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
          >
            <option value="All">All Categories</option>
            {PRIMARY_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Locality Selector / Custom Geocode & GPS button */}
        <div className="md:col-span-4 flex items-center gap-2">
          {showCustomInput ? (
            <form onSubmit={handleCustomLocalitySubmit} className="flex-1 flex gap-1">
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="Type city, area, pincode..."
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-teal-400 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLocating}
                className="px-2.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition cursor-pointer shrink-0"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </form>
          ) : (
            <select
              value={filters.locality}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setShowCustomInput(true);
                } else {
                  onFilterChange('locality', e.target.value);
                }
              }}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer font-medium"
            >
              <option value="">🌐 All Hyderabad (All Zones)</option>
              <option value="__custom__">🔍 Type Custom Area / Pincode...</option>
              {HYDERABAD_ZONES.map((zone) => (
                <optgroup key={zone.name} label={zone.name}>
                  {zone.localities.map((loc) => (
                    <option key={`hyd-${loc.name}`} value={loc.name}>
                      {loc.name} {loc.zone ? `(${loc.zone})` : ''} - {loc.pincode}
                    </option>
                  ))}
                </optgroup>
              ))}
              {CITIES_AND_REGIONS.filter((r) => !r.city.includes('Hyderabad')).map((region) => (
                <optgroup key={region.city} label={`📍 ${region.city}`}>
                  {region.localities.map((loc) => (
                    <option key={`${region.city}-${loc.name}`} value={loc.name}>
                      {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            title="Request current GPS location to find businesses near you (never stored or tracked)"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl transition cursor-pointer shrink-0 font-bold text-xs"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Near Me'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Live OpenStreetMap Discovery Action Button */}
          {onDiscoverLive && (
            <button
              type="button"
              onClick={onDiscoverLive}
              disabled={isDiscovering}
              title="Search genuine OpenStreetMap live places for the chosen location"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                livePlacesActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isDiscovering ? 'Searching OSM...' : livePlacesActive ? 'Showing Live OSM Places' : 'Discover Real Places (OSM)'}</span>
            </button>
          )}

          {/* Verified Only Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange('verified', filters.verified === 'true' ? '' : 'true')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              filters.verified === 'true'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Only</span>
          </button>

          {/* Radius Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Radius:</span>
            <select
              value={filters.radius}
              onChange={(e) => onFilterChange('radius', e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="1">Within 1 km</option>
              <option value="3">Within 3 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
            </select>
          </div>

          {/* Min Rating Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Min Rating:</span>
            <select
              value={filters.minRating}
              onChange={(e) => onFilterChange('minRating', e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="">Any Rating</option>
              <option value="3">3.0+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Price:</span>
            <select
              value={filters.priceRange}
              onChange={(e) => onFilterChange('priceRange', e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="">Any Price</option>
              <option value="$">$ (Budget)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Upscale)</option>
              <option value="$$$$">$$$$ (Luxury)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="nearest">Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A–Z</option>
              <option value="reviews">Most Reviewed</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition font-medium cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* View Mode Toggle (Grid vs List vs Map Split) */}
        {onViewModeChange && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
