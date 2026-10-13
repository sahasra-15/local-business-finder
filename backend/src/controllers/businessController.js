import { Business, BUSINESS_CATEGORIES } from '../models/Business.js';
import { Review } from '../models/Review.js';
import { Favorite } from '../models/Favorite.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { calculateDistance, formatDistance } from '../services/distanceService.js';
import { fetchOsmPlaces, syncPlacesToDatabase, resolveLocalityCoords } from '../services/placesService.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getBusinesses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minRating,
      priceRange,
      sort = 'nearest',
      page = 1,
      limit = 12,
      lat,
      lng,
      locality,
      radius,
      verified,
      featured,
    } = req.query;

    const andConditions = [{ status: 'approved' }];

    // 1. Search filter: search name, category, description, street, locality, city, services
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const searchRegex = new RegExp(escaped, 'i');
      andConditions.push({
        $or: [
          { name: searchRegex },
          { category: searchRegex },
          { description: searchRegex },
          { 'address.locality': searchRegex },
          { 'address.street': searchRegex },
          { 'address.city': searchRegex },
          { services: { $in: [searchRegex] } },
        ],
      });
    }

    // 2. Category filter with bidirectional aliases
    if (category && category !== 'All' && category !== 'all') {
      const CATEGORY_ALIASES = {
        'Supermarkets & Grocery Stores': ['Supermarkets & Grocery Stores', 'Grocery Stores and Supermarkets'],
        'Grocery Stores and Supermarkets': ['Supermarkets & Grocery Stores', 'Grocery Stores and Supermarkets'],
        'Restaurants, Cafes & Food Outlets': ['Restaurants, Cafes & Food Outlets', 'Restaurants and Cafes'],
        'Restaurants and Cafes': ['Restaurants, Cafes & Food Outlets', 'Restaurants and Cafes'],
        'Hospitals, Clinics & Diagnostic Labs': ['Hospitals, Clinics & Diagnostic Labs', 'Hospitals and Clinics'],
        'Hospitals and Clinics': ['Hospitals, Clinics & Diagnostic Labs', 'Hospitals and Clinics'],
        'Pharmacies & Medical Shops': ['Pharmacies & Medical Shops', 'Pharmacies'],
        'Pharmacies': ['Pharmacies & Medical Shops', 'Pharmacies'],
        'Schools, Colleges & Training Institutes': ['Schools, Colleges & Training Institutes', 'Educational Institutes and Coaching Centers'],
        'Educational Institutes and Coaching Centers': ['Schools, Colleges & Training Institutes', 'Educational Institutes and Coaching Centers'],
        'Gyms, Fitness & Yoga Studios': ['Gyms, Fitness & Yoga Studios', 'Fitness Centers and Gyms'],
        'Fitness Centers and Gyms': ['Gyms, Fitness & Yoga Studios', 'Fitness Centers and Gyms'],
        'Salons, Spas & Beauty Parlours': ['Salons, Spas & Beauty Parlours', 'Salons and Beauty Services'],
        'Salons and Beauty Services': ['Salons, Spas & Beauty Parlours', 'Salons and Beauty Services'],
        'Automobile Showrooms, Garages & Repair': ['Automobile Showrooms, Garages & Repair', 'Automobile Repair'],
        'Automobile Repair': ['Automobile Showrooms, Garages & Repair', 'Automobile Repair'],
        'Electronics, Mobile Stores & Computer Repair': ['Electronics, Mobile Stores & Computer Repair', 'Electronics and Mobile Repair'],
        'Electronics and Mobile Repair': ['Electronics, Mobile Stores & Computer Repair', 'Electronics and Mobile Repair'],
        'Clothing, Fashion & Boutiques': ['Clothing, Fashion & Boutiques', 'Clothing and Fashion'],
        'Clothing and Fashion': ['Clothing, Fashion & Boutiques', 'Clothing and Fashion'],
        'IT Companies, Tech Firms & Coworking': ['IT Companies, Tech Firms & Coworking', 'Professional Services'],
        'Professional Services': ['IT Companies, Tech Firms & Coworking', 'Professional Services'],
      };
      const matched = CATEGORY_ALIASES[category] || [category];
      andConditions.push({ category: { $in: matched } });
    }

    // 3. Locality filter: ignore citywide selections
    const isCitywideLocality =
      !locality ||
      !locality.trim() ||
      ['all', 'all locations', 'all hyderabad', 'all hyderabad localities', 'all hyderabad (all zones)', 'all zones'].includes(
        locality.trim().toLowerCase()
      );

    if (!isCitywideLocality) {
      const locEscaped = escapeRegex(locality.trim());
      const locRegex = new RegExp(locEscaped, 'i');
      andConditions.push({
        $or: [
          { 'address.locality': locRegex },
          { 'address.street': locRegex },
          { 'address.city': locRegex },
        ],
      });
    }

    // 4. Verified filter
    if (verified === 'true') {
      andConditions.push({ isVerified: true });
    }

    // 5. Min rating filter
    if (minRating && !isNaN(Number(minRating))) {
      andConditions.push({
        averageRating: { $gte: Number(minRating) },
      });
    }

    // 6. Price range filter
    if (priceRange && priceRange.trim()) {
      andConditions.push({ priceRange: priceRange.trim() });
    }

    // 7. Featured filter
    if (featured === 'true') {
      andConditions.push({ isFeatured: true });
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    // Reference coordinates for distance & radius calculations:
    let refLat = lat !== undefined && lat !== null && lat !== '' ? parseFloat(lat) : null;
    let refLng = lng !== undefined && lng !== null && lng !== '' ? parseFloat(lng) : null;

    if ((refLat === null || refLng === null || isNaN(refLat) || isNaN(refLng)) && !isCitywideLocality) {
      const resolved = resolveLocalityCoords(locality);
      if (resolved) {
        refLat = resolved.lat;
        refLng = resolved.lng;
      }
    }

    const hasRefCoords = refLat !== null && refLng !== null && !isNaN(refLat) && !isNaN(refLng);

    // Fetch matching businesses
    let matchingBusinesses = await Business.find(query).lean();

    // Attach accurate Haversine distance
    matchingBusinesses = matchingBusinesses.map((b) => {
      let dist = null;
      if (hasRefCoords && b.location?.coordinates && b.location.coordinates.length === 2) {
        const [bLng, bLat] = b.location.coordinates;
        if (!isNaN(bLat) && !isNaN(bLng)) {
          dist = calculateDistance(refLat, refLng, bLat, bLng);
        }
      }
      return {
        ...b,
        distance: dist,
        distanceFormatted: dist !== null ? formatDistance(dist) : null,
      };
    });

    // 8. Radius filter: Strictly filter within radius if requested and reference coordinates exist
    const radiusNum = radius ? parseFloat(radius) : null;
    if (radiusNum !== null && !isNaN(radiusNum) && radiusNum > 0 && hasRefCoords) {
      if (!isCitywideLocality || (lat && lng)) {
        matchingBusinesses = matchingBusinesses.filter(
          (b) => b.distance !== null && b.distance <= radiusNum
        );
      }
    }

    // 9. Deterministic sorting
    if (sort === 'nearest') {
      matchingBusinesses.sort((a, b) => {
        if (a.distance === null && b.distance === null) return a.name.localeCompare(b.name);
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.name.localeCompare(b.name);
      });
    } else if (sort === 'rating') {
      matchingBusinesses.sort((a, b) => {
        const rA = a.averageRating ?? -1;
        const rB = b.averageRating ?? -1;
        if (rB !== rA) return rB - rA;
        const revA = a.totalReviews ?? 0;
        const revB = b.totalReviews ?? 0;
        if (revB !== revA) return revB - revA;
        return a.name.localeCompare(b.name);
      });
    } else if (sort === 'reviews') {
      matchingBusinesses.sort((a, b) => {
        const revA = a.totalReviews ?? 0;
        const revB = b.totalReviews ?? 0;
        if (revB !== revA) return revB - revA;
        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      });
    } else if (sort === 'name') {
      matchingBusinesses.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    } else if (sort === 'newest') {
      matchingBusinesses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    const totalCount = matchingBusinesses.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;
    const paginatedBusinesses = matchingBusinesses.slice(skip, skip + limitNum);

    return successResponse(
      res,
      {
        businesses: paginatedBusinesses,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.max(1, Math.ceil(totalCount / limitNum)),
          totalCount,
          limit: limitNum,
        },
      },
      'Businesses retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const getNearbyBusinesses = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, category, limit = 20 } = req.query;

    if (!lat || !lng) {
      return errorResponse(res, 'Latitude (lat) and longitude (lng) are required', 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return errorResponse(
        res,
        'Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.',
        400
      );
    }

    const radiusKm = parseFloat(radius) || 10;
    const maxDistanceMeters = radiusKm * 1000;

    const matchStage = { status: 'approved' };
    if (category && category !== 'All' && category !== 'all') {
      matchStage.category = category;
    }

    // MongoDB 2dsphere aggregation using $geoNear
    const businesses = await Business.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchStage,
        },
      },
      { $limit: parseInt(limit, 10) || 20 },
    ]);

    const formatted = businesses.map((b) => {
      const distanceKm = Math.round((b.distanceMeters / 1000) * 10) / 10;
      return {
        ...b,
        distance: distanceKm,
        distanceFormatted: formatDistance(distanceKm),
      };
    });

    return successResponse(
      res,
      {
        businesses: formatted,
        center: { lat: latitude, lng: longitude },
        radiusKm,
        count: formatted.length,
      },
      'Nearby businesses retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const getBusinessById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    let business = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      business = await Business.findById(id).populate('owner', 'name email phone avatar');
    } else {
      business = await Business.findOne({ slug: id }).populate('owner', 'name email phone avatar');
    }

    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }

    const bObj = business.toObject();

    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      const [bLng, bLat] = bObj.location.coordinates;
      const dist = calculateDistance(parseFloat(lat), parseFloat(lng), bLat, bLng);
      bObj.distance = dist;
      bObj.distanceFormatted = formatDistance(dist);
    }

    // Fetch up to 4 similar businesses in same category
    const similar = await Business.find({
      category: bObj.category,
      _id: { $ne: bObj._id },
      status: 'approved',
    })
      .limit(4)
      .lean();

    bObj.similarBusinesses = similar;

    return successResponse(res, { business: bObj }, 'Business details retrieved');
  } catch (err) {
    next(err);
  }
};

export const createBusiness = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const businessData = {
      ...req.body,
      owner: ownerId,
      status: isAdmin ? 'approved' : 'approved', // Auto-approved for development/demo ease, or pending
    };

    const business = await Business.create(businessData);

    return successResponse(res, { business }, 'Business created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }

    // Ownership check: must be owner or admin
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Forbidden: You do not have permission to edit this business listing', 403);
    }

    // Don't allow changing owner unless admin
    if (req.body.owner && req.user.role !== 'admin') {
      delete req.body.owner;
    }

    const updated = await Business.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, { business: updated }, 'Business updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }

    // Ownership check
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Forbidden: You do not have permission to delete this business listing', 403);
    }

    await Business.findByIdAndDelete(id);
    // Cascade delete reviews & favorites
    await Review.deleteMany({ business: id });
    await Favorite.deleteMany({ business: id });

    return successResponse(res, null, 'Business and associated records deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const getMyBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { businesses }, 'Your business listings retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    // Get count per category
    const counts = await Business.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const categoryList = BUSINESS_CATEGORIES.map((cat) => ({
      name: cat,
      count: countMap[cat] || 0,
    }));

    return successResponse(res, { categories: categoryList }, 'Categories retrieved');
  } catch (err) {
    next(err);
  }
};

export const discoverLivePlaces = async (req, res, next) => {
  try {
    const { locality, lat, lng, radius = 5, category, search, limit = 30 } = req.query;

    let targetLat = lat ? parseFloat(lat) : null;
    let targetLng = lng ? parseFloat(lng) : null;
    let targetLocality = locality || 'Hyderabad';

    // If locality provided without lat/lng, resolve via coordinates dictionary
    if ((targetLat === null || targetLng === null || isNaN(targetLat) || isNaN(targetLng)) && locality) {
      const resolved = resolveLocalityCoords(locality);
      if (resolved) {
        targetLat = resolved.lat;
        targetLng = resolved.lng;
        targetLocality = resolved.name;
      } else {
        targetLat = 17.4480;
        targetLng = 78.3800;
      }
    } else if (targetLat === null || targetLng === null || isNaN(targetLat) || isNaN(targetLng)) {
      targetLat = 17.4480;
      targetLng = 78.3800;
    }

    const radiusMeters = (parseFloat(radius) || 5) * 1000;
    const places = await fetchOsmPlaces({
      lat: targetLat,
      lng: targetLng,
      radiusMeters,
      category: category && category !== 'All' ? category : null,
      search: search && search.trim() ? search.trim() : null,
      limit: parseInt(limit, 10) || 30,
      localityName: targetLocality,
    });

    const safePlaces = Array.isArray(places) ? places : [];

    return successResponse(
      res,
      {
        places: safePlaces,
        count: safePlaces.length,
        center: { lat: targetLat, lng: targetLng, locality: targetLocality },
        source: 'OpenStreetMap Overpass API (Live Real-World Data)',
      },
      safePlaces.length > 0
        ? `Discovered ${safePlaces.length} real places in ${targetLocality}`
        : `No real-world places found in ${targetLocality} for the selected criteria`
    );
  } catch (err) {
    next(err);
  }
};

export const importDiscoveredPlaces = async (req, res, next) => {
  try {
    const { places } = req.body;
    if (!Array.isArray(places) || places.length === 0) {
      return errorResponse(res, 'Array of places to import is required', 400);
    }

    const result = await syncPlacesToDatabase(places, req.user._id);
    return successResponse(
      res,
      result,
      `Successfully synced ${result.inserted} new places to directory (${result.updated} updated)`
    );
  } catch (err) {
    next(err);
  }
};
