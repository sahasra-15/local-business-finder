import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Navigation, ExternalLink, Clock } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { formatDistance, isBusinessOpenNow } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { favoriteService } from '../../services/favoriteService';

export default function BusinessCard({ business, initialIsFavorite = false, onFavoriteToggle = null }) {
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

  const imageSrc =
    business.images && business.images.length > 0
      ? business.images[0]
      : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Thumbnail and badges */}
      <div className="relative h-50 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
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
      <div className="p-5 flex-1 flex flex-col justify-between">
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

          {/* Business Title & Verification Badge */}
          <div className="flex items-start justify-between gap-1.5 pt-0.5">
            <Link
              to={`/business/${business._id}`}
              className="block text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 flex-1"
            >
              {business.name}
            </Link>
          </div>

          {/* Data Source Indicator */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {business.source === 'osm' || business.isVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Place (OSM)
              </span>
            ) : business.source === 'registered' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                Registered Business
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                Demo Listing
              </span>
            )}
          </div>

          {/* Locality & Address */}
          <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {business.address?.street}, {business.address?.locality}
            </span>
          </p>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
            {business.description}
          </p>
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
          >
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
