import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Navigation, ExternalLink, Clock } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { formatDistance, isBusinessOpenNow } from '../../utils/formatters';
import { getBusinessDisplayImage, getCategoryFallbackImage } from '../../utils/categoryImages';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { favoriteService } from '../../services/favoriteService';

export default function BusinessCard({ business, initialIsFavorite = false, onFavoriteToggle = null, viewMode = 'grid' }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const openStatus = isBusinessOpenNow(business.openingHours);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to save businesses to your favorites.');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.remove(business._id);
        setIsFavorite(false);
        toast.info(`Removed ${business.name} from saved favorites`);
        if (onFavoriteToggle) onFavoriteToggle(business._id, false);
      } else {
        await favoriteService.add(business._id);
        setIsFavorite(true);
        toast.success(`Saved ${business.name} to favorites!`);
        if (onFavoriteToggle) onFavoriteToggle(business._id, true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const [lng, lat] = business.location?.coordinates || [78.567, 17.478];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const imageSrc = getBusinessDisplayImage(business);

  const isList = viewMode === 'list';

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isList ? 'flex flex-col sm:flex-row' : 'flex flex-col h-full'
      }`}
    >
      {/* Thumbnail and badges */}
      <div
        className={`relative overflow-hidden bg-slate-100 shrink-0 ${
          isList ? 'h-52 sm:h-auto sm:w-72' : 'h-50 w-full'
        }`}
      >
        <img
          src={imageSrc}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getCategoryFallbackImage(business.category, business.name);
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Category Pill Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 shadow-xs">
            {business.category}
          </span>
          {business.priceRange && (
            <span className="px-2 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-teal-300 shadow-xs">
              {business.priceRange}
            </span>
          )}
        </div>

        {/* Favorite Heart Top Right */}
        <button
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 shadow-sm transition-all z-10 cursor-pointer"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Distance Badge Bottom Left */}
        {business.distance !== undefined && business.distance !== null && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-semibold">
            <Navigation className="w-3 h-3" />
            <span>{formatDistance(business.distance)}</span>
          </div>
        )}

        {/* Operating status Bottom Right */}
        {openStatus && (
          <div
            className={`absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md ${
              openStatus.isOpen
                ? 'bg-emerald-600/90 text-white'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{openStatus.isOpen ? 'Open Now' : 'Closed'}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 flex-1 flex flex-col justify-between ${isList ? 'sm:p-6' : ''}`}>
        <div className="space-y-2">
          {/* Rating & Locality */}
          <div className="flex items-center justify-between">
            <RatingStars
              rating={business.averageRating || 0}
              totalReviews={business.totalReviews || 0}
              size="sm"
            />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {business.address?.locality || 'Hyderabad'}
            </span>
          </div>

          {/* Business Title */}
          <div className="flex items-start justify-between gap-1.5 pt-0.5">
            <Link
              to={`/business/${business._id}`}
              className="block text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 flex-1"
            >
              {business.name}
            </Link>
          </div>

          {/* Data Source & Truthful Verification Indicator */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {business.isVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                ✓ Verified Listing
              </span>
            ) : business.source === 'osm' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                🌐 OpenStreetMap
              </span>
            ) : business.source === 'registered' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                Registered Business
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                Community Listing
              </span>
            )}
          </div>

          {/* Locality & Street Address */}
          <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {business.address?.street ? `${business.address.street}, ` : ''}{business.address?.locality || 'Hyderabad'}
            </span>
          </p>

          {/* Description */}
          <p className={`text-xs text-slate-600 leading-relaxed pt-1 ${isList ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {business.description}
          </p>

          {/* Services Chips (shown prominently in list view) */}
          {isList && business.services && business.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {business.services.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  {s}
                </span>
              ))}
              {business.services.length > 4 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{business.services.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-teal-600 transition"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span>Get Directions</span>
          </a>

          <Link
            to={`/business/${business._id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
          >
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
