import { Business } from '../models/Business.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalBusinesses, approvedBusinesses, pendingBusinesses, totalReviews] =
      await Promise.all([
        User.countDocuments(),
        Business.countDocuments(),
        Business.countDocuments({ status: 'approved' }),
        Business.countDocuments({ status: 'pending' }),
        Review.countDocuments(),
      ]);

    const ownerCount = await User.countDocuments({ role: 'business_owner' });

    return successResponse(
      res,
      {
        totalUsers,
        totalBusinesses,
        approvedBusinesses,
        pendingBusinesses,
        totalReviews,
        ownerCount,
      },
      'Platform statistics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const getAdminBusinesses = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { 'address.locality': { $regex: search.trim(), $options: 'i' } },
        { 'address.city': { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const totalCount = await Business.countDocuments(query);
    const businesses = await Business.find(query)
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return successResponse(
      res,
      {
        businesses,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
        },
      },
      'Admin businesses retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const updateBusinessStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const updateFields = {};
    if (status && ['approved', 'pending', 'rejected'].includes(status)) {
      updateFields.status = status;
    }
    if (typeof isFeatured === 'boolean') {
      updateFields.isFeatured = isFeatured;
    }

    const business = await Business.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }

    return successResponse(res, { business }, `Business status updated to ${business.status}`);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const totalCount = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return successResponse(
      res,
      {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
        },
      },
      'Users retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const totalCount = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('business', 'name slug category')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return successResponse(
      res,
      {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
        },
      },
      'Reviews retrieved for admin'
    );
  } catch (err) {
    next(err);
  }
};

export const deleteAdminReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }
    return successResponse(
      res,
      null,
      'Review deleted successfully and business ratings recalculated'
    );
  } catch (err) {
    next(err);
  }
};

export const getDuplicateBusinesses = async (req, res, next) => {
  try {
    const all = await Business.find()
      .select('name address contact location category status createdAt')
      .lean();

    const duplicates = [];
    const seenPhones = new Map();
    const seenNames = new Map();

    const normalizePhone = (p) => (p || '').replace(/\D/g, '').slice(-10);
    const normalizeName = (n) => (n || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const b of all) {
      // 1. Phone match
      const phoneDigits = normalizePhone(b.contact?.phone);
      if (phoneDigits && phoneDigits.length >= 7) {
        if (seenPhones.has(phoneDigits)) {
          duplicates.push({
            reason: 'Identical Contact Phone Number',
            field: b.contact?.phone,
            businessA: seenPhones.get(phoneDigits),
            businessB: b,
            confidence: 'High',
          });
        } else {
          seenPhones.set(phoneDigits, b);
        }
      }

      // 2. Name + locality match
      const cleanName = normalizeName(b.name);
      const locality = (b.address?.locality || '').toLowerCase().trim();
      const nameKey = `${cleanName}_${locality}`;
      if (cleanName && locality) {
        if (seenNames.has(nameKey)) {
          duplicates.push({
            reason: 'Matching Business Name in Same Locality',
            field: `${b.name} (${b.address?.locality})`,
            businessA: seenNames.get(nameKey),
            businessB: b,
            confidence: 'Medium',
          });
        } else {
          seenNames.set(nameKey, b);
        }
      }
    }

    return successResponse(
      res,
      {
        duplicates,
        totalDuplicatesFound: duplicates.length,
      },
      'Duplicate analysis complete'
    );
  } catch (err) {
    next(err);
  }
};
