import { Favorite } from '../models/Favorite.js';
import { Business } from '../models/Business.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('business')
      .sort({ createdAt: -1 });

    // Filter out any where business may have been deleted
    const validFavorites = favorites.filter((f) => f.business != null);

    return successResponse(
      res,
      {
        favorites: validFavorites,
        count: validFavorites.length,
      },
      'User favorites retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id;

    const business = await Business.findById(businessId);
    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }

    const existing = await Favorite.findOne({ user: userId, business: businessId });
    if (existing) {
      return successResponse(res, { favorite: existing, isFavorite: true }, 'Already in favorites');
    }

    const favorite = await Favorite.create({ user: userId, business: businessId });

    return successResponse(res, { favorite, isFavorite: true }, 'Added to favorites', 201);
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id;

    await Favorite.findOneAndDelete({ user: userId, business: businessId });

    return successResponse(res, { isFavorite: false }, 'Removed from favorites');
  } catch (err) {
    next(err);
  }
};

export const checkIsFavorite = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOne({ user: userId, business: businessId });

    return successResponse(res, { isFavorite: !!favorite }, 'Favorite status checked');
  } catch (err) {
    next(err);
  }
};
