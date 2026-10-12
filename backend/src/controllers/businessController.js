import { Business, BUSINESS_CATEGORIES } from '../models/Business.js';
import { Review } from '../models/Review.js';
import { Favorite } from '../models/Favorite.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { calculateDistance, formatDistance } from '../services/distanceService.js';

export const getBusinesses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minRating,
      priceRange,
      sort = 'newest',
      page = 1,
      limit = 12,
      lat,
      lng,
      locality,
      featured,
    } = req.query;

    const query = { status: 'approved' };

    // Search filter across name, description, and locality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { 'address.locality': searchRegex },
        { 'address.city': searchRegex },
        { services: { $in: [searchRegex] } },
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    // Locality or City filter
    if (locality && locality.trim() && locality !== 'All' && locality !== 'All Locations') {
      const locRegex = new RegExp(locality.trim(), 'i');
      const localityCondition = {
        $or: [
          { 'address.locality': locRegex },
          { 'address.city': locRegex },
          { 'address.state': locRegex },
        ],
      };

      if (query.$or) {
        query.$and = [{ $or: query.$or }, localityCondition];
        delete query.$or;
      } else {
        query.$or = localityCondition.$or;
      }
    }

    // Rating filter
    if (minRating && !isNaN(Number(minRating))) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Price range filter
    if (priceRange) {
      query.priceRange = priceRange;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting definition
    let sortOptions = { createdAt: -1 };
    if (sort === 'rating') {
      sortOptions = { averageRating: -1, totalReviews: -1 };
    } else if (sort === 'reviews') {
      sortOptions = { totalReviews: -1, averageRating: -1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Business.countDocuments(query);
    let businesses = await Business.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Attach distances if coordinates provided
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
      businesses = businesses.map((b) => {
        const [bLng, bLat] = b.location.coordinates;
        const dist = calculateDistance(userLat, userLng, bLat, bLng);
        return {
          ...b,
          distance: dist,
          distanceFormatted: formatDistance(dist),
        };
      });

      if (sort === 'nearest') {
        businesses.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
      }
    }

    return successResponse(
      res,
      {
        businesses,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
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
