import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map, MapPin, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { businessService } from '../services/businessService';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import BusinessCard from '../components/business/BusinessCard';
import BusinessFilter from '../components/business/BusinessFilter';
import { BusinessCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import InteractiveMap from '../components/map/InteractiveMap';
import Button from '../components/common/Button';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { coordinates, localityName, requestCurrentLocation, isLocating, selectLocality, geocodeAddress } =
    useLocation();

  // Filters state initialized from URL search params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    locality: searchParams.get('locality') || '',
    radius: searchParams.get('radius') || '10',
    minRating: searchParams.get('minRating') || '',
    priceRange: searchParams.get('priceRange') || '',
    sort: searchParams.get('sort') || 'nearest',
    verified: searchParams.get('verified') || '',
  });

  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showSplitMap, setShowSplitMap] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMapBusiness, setSelectedMapBusiness] = useState(null);
  const toast = useToast();
  const activeRequestIdRef = useRef(0);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input by 250ms to prevent request flood and lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Sync state changes to searchParams
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters.locality) params.set('locality', filters.locality);
    if (filters.radius) params.set('radius', filters.radius);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.priceRange) params.set('priceRange', filters.priceRange);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.verified) params.set('verified', filters.verified);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  // Fetch businesses whenever filters or page or coordinates change
  useEffect(() => {
    const currentReqId = ++activeRequestIdRef.current;

    const fetchBusinesses = async () => {
      setLoading(true);
      setLivePlacesActive(false);
      try {
        const queryParams = {
          search: debouncedSearch,
          category: filters.category,
          locality: filters.locality,
          radius: filters.radius,
          minRating: filters.minRating,
          priceRange: filters.priceRange,
          sort: filters.sort,
          verified: filters.verified,
          page,
          limit: 12,
          lat: coordinates.lat,
          lng: coordinates.lng,
        };

        const res = await businessService.getBusinesses(queryParams);
        // Only update state if this is the newest inflight request
        if (currentReqId === activeRequestIdRef.current) {
          setBusinesses(res.data.businesses || []);
          setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
        }
      } catch (err) {
        if (currentReqId === activeRequestIdRef.current) {
          console.error('Failed to load explore businesses:', err);
          setBusinesses([]);
        }
      } finally {
        if (currentReqId === activeRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchBusinesses();
  }, [
    debouncedSearch,
    filters.category,
    filters.locality,
    filters.radius,
    filters.minRating,
    filters.priceRange,
    filters.sort,
    filters.verified,
    page,
    coordinates,
  ]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter change

    // Synchronize locality changes with LocationContext (including resets)
    if (key === 'locality') {
      selectLocality(value);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      locality: '',
      radius: '10',
      minRating: '',
      priceRange: '',
      sort: 'nearest',
      verified: '',
    });
    selectLocality('');
    setLivePlacesActive(false);
    setPage(1);
    toast.info('All filters have been reset to default.');
  };

  const handleDiscoverLivePlaces = async () => {
    setIsDiscovering(true);
    try {
      const res = await businessService.discoverLivePlaces({
        locality: filters.locality || localityName || 'Hyderabad',
        category: filters.category !== 'All' ? filters.category : undefined,
        search: filters.search ? filters.search.trim() : undefined,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        radius: filters.radius || 5,
        limit: 30,
      });

      const livePlaces = res.data?.places || [];
      setBusinesses(livePlaces);
      setLivePlacesActive(true);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: livePlaces.length,
      });

      if (livePlaces.length === 0) {
        toast.info(
          `No OpenStreetMap real places found within ${filters.radius || 5} km for "${
            filters.locality || localityName
          }". Try expanding your search radius.`
        );
      } else {
        toast.success(`Discovered ${livePlaces.length} real places from OpenStreetMap!`);
      }
    } catch (err) {
      console.error('Failed to discover live OSM places:', err);
      toast.error('OpenStreetMap service is temporarily unreachable. Please try again.');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Local Businesses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Displaying businesses near <span className="font-semibold text-slate-700">{localityName}</span>
          </p>
        </div>

        {/* Split Map Toggle Button & Privacy note */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSplitMap(!showSplitMap)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              showSplitMap
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>{showSplitMap ? 'Hide Side Map' : 'Split Map View'}</span>
          </button>
        </div>
      </div>

      {/* Location Privacy Note */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl">
        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>
          <strong>Location Privacy:</strong> GPS coordinates are used exclusively for on-demand distance calculations within your browser and are never tracked or saved to our servers.
        </span>
      </div>

      {/* Filter Component */}
      <BusinessFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUseCurrentLocation={requestCurrentLocation}
        isLocating={isLocating}
        localityName={localityName}
        onGeocodeAddress={geocodeAddress}
        onDiscoverLive={handleDiscoverLivePlaces}
        isDiscovering={isDiscovering}
        livePlacesActive={livePlacesActive}
      />

      {/* Live OSM Discovery Active Banner */}
      {livePlacesActive && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              <strong>Live OpenStreetMap Discovery:</strong> Showing {businesses.length} genuine real-world places around <strong>{localityName}</strong>.
            </span>
          </div>
          <button
            onClick={handleResetFilters}
            className="font-bold underline hover:text-emerald-950 cursor-pointer text-left sm:text-right"
          >
            Back to Directory Listings ↺
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{businesses.length}</strong> of{' '}
          <strong className="text-slate-800">{pagination.totalCount}</strong> businesses
        </span>
        {filters.category !== 'All' && (
          <span className="font-semibold text-teal-600">
            Category: {filters.category}
          </span>
        )}
      </div>

      {/* Main Content: Split Map or Full Grid */}
      <div className={`grid gap-6 ${showSplitMap ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Listings column */}
        <div className={showSplitMap ? 'lg:col-span-7' : 'w-full'}>
          {loading ? (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? showSplitMap
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <BusinessCardSkeleton key={n} />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No Businesses Found Within {filters.radius} km
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No listings matched your current filters near <span className="font-semibold text-slate-700">{localityName}</span>. You can search live OpenStreetMap real places or expand your distance radius.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="teal"
                  size="sm"
                  onClick={handleDiscoverLivePlaces}
                  disabled={isDiscovering}
                >
                  {isDiscovering ? 'Searching OSM...' : '🌐 Discover Real Places in this Area'}
                </Button>
                {parseInt(filters.radius, 10) < 25 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('radius', '25')}
                  >
                    Expand Radius to 25 km
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? showSplitMap
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {businesses.map((biz) => (
                <div
                  key={biz._id}
                  onMouseEnter={() => showSplitMap && setSelectedMapBusiness(biz)}
                  className="transition"
                >
                  <BusinessCard business={biz} viewMode={viewMode} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 pb-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-700 px-3">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Side Split Map */}
        {showSplitMap && (
          <div className="lg:col-span-5 h-[650px] sticky top-24">
            <InteractiveMap
              businesses={businesses}
              center={{ lat: coordinates.lat, lng: coordinates.lng }}
              zoom={13}
              selectedBusiness={selectedMapBusiness}
              userLocation={{ lat: coordinates.lat, lng: coordinates.lng }}
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
