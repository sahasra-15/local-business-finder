import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Compass,
  Store,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CATEGORIES, HYDERABAD_LOCALITIES } from '../utils/constants';
import { businessService } from '../services/businessService';
import { useLocation } from '../context/LocationContext';
import BusinessCard from '../components/business/BusinessCard';
import { BusinessCardSkeleton } from '../components/common/Skeleton';
import InteractiveMap from '../components/map/InteractiveMap';
import Button from '../components/common/Button';
import { getRecentlyViewed } from '../utils/recentViews';

export default function HomePage() {
  const navigate = useNavigate();
  const { coordinates, localityName, requestCurrentLocation, isLocating, selectLocality } =
    useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [topRatedBusinesses, setTopRatedBusinesses] = useState([]);
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mapBusinesses, setMapBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, topRatedRes, recentRes] = await Promise.all([
          businessService.getBusinesses({
            featured: 'true',
            limit: 4,
            lat: coordinates.lat,
            lng: coordinates.lng,
          }),
          businessService.getBusinesses({
            sort: 'rating',
            limit: 4,
            lat: coordinates.lat,
            lng: coordinates.lng,
          }),
          businessService.getBusinesses({
            sort: 'newest',
            limit: 4,
            lat: coordinates.lat,
            lng: coordinates.lng,
          }),
        ]);

        const featuredList = featuredRes.data.businesses || [];
        const topRatedList = topRatedRes.data.businesses || [];
        const recentList = recentRes.data.businesses || [];

        setFeaturedBusinesses(featuredList);
        setTopRatedBusinesses(topRatedList);
        setRecentBusinesses(recentList);
        setRecentlyViewed(getRecentlyViewed());

        // Map businesses: combine without duplicates
        const mapCombined = [
          ...featuredList,
          ...topRatedList.filter((b) => !featuredList.some((f) => f._id === b._id)),
        ];
        setMapBusinesses(mapCombined);
      } catch (err) {
        console.error('Failed to load homepage businesses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [coordinates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    params.set('lat', coordinates.lat);
    params.set('lng', coordinates.lng);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Discover Top-Rated Local Gems Across All Zones & Cities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover the Best Businesses <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-200">
              Around Your Neighborhood
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Find authentic dining spots, supermarkets, multi-specialty clinics, diagnostic labs,
            IT offices, schools, and trusted local services across Kandlakoya, Medchal, Kompally,
            HITEC City, Gachibowli, Secunderabad, and all Hyderabad localities.
          </p>

          {/* Large Hero Search Box */}
          <div className="pt-4 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col md:flex-row gap-2.5 text-slate-800"
            >
              {/* Keyword Search */}
              <div className="flex-1 relative flex items-center px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl border border-slate-200 md:border-0">
                <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Business name, cuisine, IT firm, clinic, service..."
                  className="w-full text-sm font-medium bg-transparent focus:outline-none placeholder-slate-400 text-slate-800"
                />
              </div>

              <div className="hidden md:block w-px bg-slate-200 my-1" />

              {/* Category Selector */}
              <div className="w-full md:w-56 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl border border-slate-200 md:border-0 flex items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-700 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:block w-px bg-slate-200 my-1" />

              {/* Location button */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl border border-slate-200 md:border-0">
                <Navigation className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-600 truncate max-w-[130px]">
                  {localityName}
                </span>
                <button
                  type="button"
                  onClick={requestCurrentLocation}
                  disabled={isLocating}
                  title="Detect my GPS coordinates"
                  className="ml-auto text-[11px] font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
                >
                  {isLocating ? 'Locating...' : 'GPS'}
                </button>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="teal" size="md" className="rounded-xl px-7">
                <span>Search</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </div>

          {/* Quick Locality Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Popular hubs:</span>
            {[
              'Kandlakoya',
              'Medchal Town',
              'Kompally',
              'Suchitra',
              'HITEC City',
              'Gachibowli',
              'Kukatpally',
              'Secunderabad',
              'Uppal',
              'Mehdipatnam',
            ].map((locName) => (
              <button
                key={locName}
                type="button"
                onClick={() => {
                  selectLocality(locName);
                  navigate(`/explore?locality=${encodeURIComponent(locName)}`);
                }}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition cursor-pointer font-medium"
              >
                📍 {locName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1">
              Browse Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Business Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 transition"
          >
            <span>View All {CATEGORIES.length} Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {CATEGORIES.slice(0, 7).map((cat) => (
            <Link
              key={cat.name}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2.5"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <Store className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600 line-clamp-2 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Local Businesses
            </h2>
          </div>
          <Link
            to="/explore?featured=true"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
          >
            <span>Explore Featured</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <BusinessCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBusinesses.map((biz) => (
              <BusinessCard key={biz._id} business={biz} />
            ))}
          </div>
        )}
      </section>

      {/* INTERACTIVE MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white overflow-hidden relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geospatial Radar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Explore Businesses on the Interactive Map
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Pinpoint establishments near {localityName}. Click markers to view hours, ratings,
                and direct navigation routes.
              </p>
            </div>
            <Link to="/map">
              <Button variant="teal" size="md">
                <span>Open Full Map View</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="h-[420px] rounded-2xl overflow-hidden shadow-inner border border-slate-800">
            <InteractiveMap
              businesses={mapBusinesses}
              center={{ lat: coordinates.lat, lng: coordinates.lng }}
              zoom={13}
              userLocation={{ lat: coordinates.lat, lng: coordinates.lng }}
              height="100%"
            />
          </div>
        </div>
      </section>

      {/* TOP RATED BUSINESSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Community Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top-Rated in Hyderabad
            </h2>
          </div>
          <Link
            to="/explore?sort=rating"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
          >
            <span>View All Highest Rated</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <BusinessCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedBusinesses.map((biz) => (
              <BusinessCard key={biz._id} business={biz} />
            ))}
          </div>
        )}
      </section>

      {/* RECENTLY VIEWED BUSINESSES */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Pick Up Where You Left Off</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recently Viewed Businesses
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              <span>Explore More</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((biz) => (
              <BusinessCard key={biz._id} business={biz} />
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How Local Business Finder Works
          </h2>
          <p className="text-sm text-slate-500">
            Connecting neighborhood residents with trusted local service providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Set Your Location</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use browser GPS or pick your Hyderabad locality (ECIL, AS Rao Nagar, Sainikpuri,
              Tarnaka, Nagaram) to discover nearby spots.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Filter & Discover</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Refine results by distance radius, customer ratings, price range, or category. Inspect
              hours and read genuine reviews.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Connect & Navigate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Call the business directly, get GPS driving directions, write authentic ratings, and save
              your favorites.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FOR BUSINESS OWNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-14 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-md">
              <Store className="w-3.5 h-3.5" />
              <span>Empowering Hyderabad Merchants</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Own a Business in Hyderabad? <br />
              Grow Your Local Customer Base.
            </h2>
            <p className="text-sm text-teal-100/90 leading-relaxed">
              Register your listing in minutes. Showcase your address, operating hours, service menu,
              photos, and connect directly with local customers searching in your vicinity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link to="/register">
              <Button variant="primary" size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                <span>List Your Business For Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
