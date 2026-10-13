import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Heart,
  Share2,
  Navigation,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { reviewService } from '../services/reviewService';
import { favoriteService } from '../services/favoriteService';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDistance, isBusinessOpenNow } from '../utils/formatters';
import RatingStars from '../components/common/RatingStars';
import RatingDistribution from '../components/review/RatingDistribution';
import ReviewCard from '../components/review/ReviewCard';
import ReviewModal from '../components/review/ReviewModal';
import InteractiveMap from '../components/map/InteractiveMap';
import BusinessCard from '../components/business/BusinessCard';
import Button from '../components/common/Button';
import { addRecentlyViewed, getRecentlyViewed } from '../utils/recentViews';
import { getBusinessDisplayImage, getCategoryFallbackImage, CATEGORY_IMAGE_POOLS } from '../utils/categoryImages';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const { coordinates } = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ distribution: {}, totalReviews: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewSort, setReviewSort] = useState('newest');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      setLoading(true);
      try {
        const [bizRes, reviewRes] = await Promise.all([
          businessService.getBusinessById(id, { lat: coordinates.lat, lng: coordinates.lng }),
          reviewService.getByBusiness(id, { sort: reviewSort }),
        ]);

        const bizData = bizRes.data.business;
        setBusiness(bizData);
        setReviews(reviewRes.data.reviews || []);
        setRatingStats({
          distribution: reviewRes.data.distribution || {},
          totalReviews: reviewRes.data.totalReviews || 0,
        });

        // Track recently viewed businesses
        addRecentlyViewed(bizData);
        setRecentlyViewed(getRecentlyViewed().filter((b) => b._id !== bizData._id));

        // Check favorite status if authenticated
        if (isAuthenticated) {
          try {
            const favRes = await favoriteService.check(bizData._id);
            setIsFavorite(favRes.data.isFavorite);
          } catch (e) {
            // Ignore favorite check error
          }
        }
      } catch (err) {
        console.error('Error fetching business detail:', err);
        toast.error('Unable to load business details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [id, coordinates, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save to your favorites.');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.remove(business._id);
        setIsFavorite(false);
        toast.info(`Removed ${business.name} from saved favorites`);
      } else {
        await favoriteService.add(business._id);
        setIsFavorite(true);
        toast.success(`Added ${business.name} to favorites!`);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating favorite');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Business link copied to clipboard!');
    } else {
      toast.info('Share URL: ' + window.location.href);
    }
  };

  const handleOpenReviewModal = (existing = null) => {
    if (!isAuthenticated) {
      toast.info('Please log in to write a review.');
      return;
    }
    setEditingReview(existing);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (data) => {
    setSubmittingReview(true);
    try {
      if (editingReview) {
        await reviewService.update(editingReview._id, data);
        toast.success('Your review was updated successfully!');
      } else {
        await reviewService.create(business._id, data);
        toast.success('Your review was posted successfully!');
      }

      // Refresh reviews and business stats
      const [reviewRes, bizRes] = await Promise.all([
        reviewService.getByBusiness(business._id),
        businessService.getBusinessById(business._id),
      ]);
      setReviews(reviewRes.data.reviews || []);
      setRatingStats({
        distribution: reviewRes.data.distribution || {},
        totalReviews: reviewRes.data.totalReviews || 0,
      });
      setBusiness((prev) => ({
        ...prev,
        averageRating: bizRes.data.business.averageRating,
        totalReviews: bizRes.data.business.totalReviews,
      }));

      setReviewModalOpen(false);
      setEditingReview(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSortReviews = async (newSort) => {
    setReviewSort(newSort);
    try {
      const res = await reviewService.getByBusiness(business._id, { sort: newSort });
      setReviews(res.data.reviews || []);
    } catch (err) {
      toast.error('Failed to sort reviews');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.delete(reviewId);
      toast.success('Review deleted.');

      const [reviewRes, bizRes] = await Promise.all([
        reviewService.getByBusiness(business._id),
        businessService.getBusinessById(business._id),
      ]);
      setReviews(reviewRes.data.reviews || []);
      setRatingStats({
        distribution: reviewRes.data.distribution || {},
        totalReviews: reviewRes.data.totalReviews || 0,
      });
      setBusiness((prev) => ({
        ...prev,
        averageRating: bizRes.data.business.averageRating,
        totalReviews: bizRes.data.business.totalReviews,
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return <BusinessDetailSkeleton />;
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Business Not Found</h2>
        <p className="text-slate-500 mt-2">The requested business does not exist or has been removed.</p>
        <Link to="/explore" className="inline-block mt-4">
          <Button variant="primary">Return to Explore</Button>
        </Link>
      </div>
    );
  }

  const [lng, lat] = business.location?.coordinates || [78.567, 17.478];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const openStatus = isBusinessOpenNow(business.openingHours);

  const primaryImage = getBusinessDisplayImage(business);
  const catKey = business.category;
  const pool = CATEGORY_IMAGE_POOLS[catKey] || CATEGORY_IMAGE_POOLS['Other Local Businesses'] || [];
  const galleryExtra = pool.filter((img) => img !== primaryImage).slice(0, 3);
  const images =
    business.images &&
    business.images.length > 1 &&
    !business.images[0].includes('photo-1517248135467')
      ? business.images
      : [primaryImage, ...galleryExtra];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/explore" className="hover:text-slate-900 transition">
          Explore
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/explore?category=${encodeURIComponent(business.category)}`}
          className="hover:text-slate-900 transition"
        >
          {business.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 truncate">{business.name}</span>
      </nav>

      {/* Hero Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
              {business.category}
            </span>
            {business.priceRange && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {business.priceRange} Price
              </span>
            )}
            {openStatus && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  openStatus.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {openStatus.text}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {business.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <RatingStars
              rating={business.averageRating || 0}
              totalReviews={business.totalReviews || 0}
              size="md"
            />
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 font-medium">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>
                {business.address?.locality}, {business.address?.city}
              </span>
            </div>
            {business.distance !== undefined && business.distance !== null && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 font-semibold text-teal-600">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{formatDistance(business.distance)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleFavorite}
            className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 text-xs font-bold ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-md">
          <img
            src={images[activeImageIndex]}
            alt={business.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getCategoryFallbackImage(business.category, business.name);
            }}
            className="w-full h-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-18 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                  activeImageIndex === idx ? 'border-teal-500 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img
                  src={img}
                  alt="Thumbnail"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getCategoryFallbackImage(business.category, `${business.name}-${idx}`);
                  }}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Description, Services, Opening Hours, Reviews */}
        <div className="lg:col-span-8 space-y-10">
          {/* About Section */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">About the Business</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {business.description}
            </p>

            {/* Services & Amenities */}
            {business.services && business.services.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Services & Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((svc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{svc}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours Table */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>Operating Hours</span>
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {daysOfWeek.map((day) => {
                const dayData = business.openingHours?.[day] || {
                  open: '09:00',
                  close: '21:00',
                  isClosed: false,
                };
                const isToday =
                  new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase() === day;

                return (
                  <div
                    key={day}
                    className={`py-2.5 flex items-center justify-between text-xs capitalize ${
                      isToday ? 'font-bold text-teal-700 bg-teal-50/50 -mx-3 px-3 rounded-lg' : 'text-slate-700'
                    }`}
                  >
                    <span className="w-28">{day} {isToday && '(Today)'}</span>
                    <span>
                      {dayData.isClosed ? (
                        <span className="text-rose-500 font-bold">Closed</span>
                      ) : (
                        <span>
                          {dayData.open} – {dayData.close}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews & Ratings Section */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Ratings & Customer Reviews</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified customer experiences and community ratings.
                </p>
              </div>

              <Button
                variant="teal"
                size="sm"
                icon={MessageSquare}
                onClick={() => handleOpenReviewModal()}
              >
                Write a Review
              </Button>
            </div>

            {/* Rating Summary & Distribution */}
            {ratingStats.totalReviews === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Customer Reviews Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This business does not have customer ratings yet. Be the first to share your experience with your neighborhood!
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal()}
                  className="inline-block mt-1 text-xs font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="md:col-span-5 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                  <span className="text-5xl font-black text-slate-900">
                    {business.averageRating ? Number(business.averageRating).toFixed(1) : '0.0'}
                  </span>
                  <div className="my-2">
                    <RatingStars rating={business.averageRating || 0} size="md" showNumber={false} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Based on {ratingStats.totalReviews} review{ratingStats.totalReviews === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="md:col-span-7">
                  <RatingDistribution
                    distribution={ratingStats.distribution}
                    totalReviews={ratingStats.totalReviews}
                  />
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4 pt-2">
              {reviews.length > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">
                    Community Feedback ({reviews.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Sort reviews:</span>
                    <select
                      value={reviewSort}
                      onChange={(e) => handleSortReviews(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              )}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <p>No reviews posted yet for this business.</p>
                  <button
                    onClick={() => handleOpenReviewModal()}
                    className="text-teal-600 font-bold hover:underline mt-1 text-xs cursor-pointer"
                  >
                    Be the first to share your experience!
                  </button>
                </div>
              ) : (
                reviews.map((r) => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    onEdit={() => handleOpenReviewModal(r)}
                    onDelete={handleDeleteReview}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Location Map, Contact Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Map Preview Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Location & Map</span>
            </h3>

            <div className="h-56 rounded-2xl overflow-hidden border border-slate-200">
              <InteractiveMap
                businesses={[business]}
                center={{ lat, lng }}
                zoom={15}
                height="100%"
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-900">
                {business.address?.street}
              </p>
              <p>
                {business.address?.locality}, {business.address?.city} - {business.address?.postalCode}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </p>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Contact Information</h3>

            <div className="space-y-3 text-xs">
              {business.contact?.phone && (
                <a
                  href={`tel:${business.contact.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition"
                >
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">{business.contact.phone}</span>
                </a>
              )}

              {business.contact?.email && (
                <a
                  href={`mailto:${business.contact.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition truncate"
                >
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{business.contact.email}</span>
                </a>
              )}

              {business.contact?.website && (
                <a
                  href={business.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-teal-700 transition"
                >
                  <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate font-semibold">Visit Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Businesses Nearby Section */}
      {business.similarBusinesses && business.similarBusinesses.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Similar {business.category} Nearby
            </h2>
            <Link
              to={`/explore?category=${encodeURIComponent(business.category)}`}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {business.similarBusinesses.map((simBiz) => (
              <BusinessCard key={simBiz._id} business={simBiz} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Businesses Section */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-0.5">
                Browsing History
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Recently Viewed Businesses
              </h2>
            </div>
            <Link to="/explore" className="text-xs font-bold text-teal-600 hover:underline">
              Explore More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((rBiz) => (
              <BusinessCard key={rBiz._id} business={rBiz} />
            ))}
          </div>
        </section>
      )}

      {/* Review Modal Dialog */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        initialData={editingReview}
        businessName={business.name}
        submitting={submittingReview}
      />
    </div>
  );
}
