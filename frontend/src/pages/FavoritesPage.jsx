import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import BusinessCard from '../components/business/BusinessCard';
import { BusinessCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { getRecentlyViewed } from '../utils/recentViews';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await favoriteService.getFavorites();
        setFavorites(res.data.favorites || []);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavs();
  }, [isAuthenticated]);

  const handleFavoriteToggle = (businessId, isNowFavorite) => {
    if (!isNowFavorite) {
      setFavorites((prev) => prev.filter((f) => f.business?._id !== businessId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign in to View Favorites</h2>
        <p className="text-sm text-slate-500">
          Save restaurants, stores, and services to access them quickly across any device.
        </p>
        <Link to="/login" className="inline-block pt-2">
          <Button variant="primary">Log In to Your Account</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
          <Heart className="w-4 h-4 fill-rose-500" />
          <span>Saved Places</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Favorite Businesses
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quickly access your saved local destinations and service providers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <BusinessCardSkeleton key={n} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Saved Businesses Yet"
          description="When you discover places you like, click the heart icon on any business card to save them here."
          actionLabel="Explore Businesses"
          onAction={() => (window.location.href = '/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <BusinessCard
              key={fav._id}
              business={fav.business}
              initialIsFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}

      {/* Recently Viewed Section */}
      {(() => {
        const recents = getRecentlyViewed();
        if (!recents || recents.length === 0) return null;
        return (
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-0.5">
                  Local History
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Recently Viewed Businesses
                </h2>
              </div>
              <Link to="/explore" className="text-xs font-bold text-teal-600 hover:underline">
                Explore All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recents.slice(0, 4).map((b) => (
                <BusinessCard key={b._id} business={b} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
