import { Review } from '../models/Review.js';
import { Business } from '../models/Business.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getReviewsByBusiness = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { sort = 'newest' } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const reviews = await Review.find({ business: businessId })
      .populate('user', 'name avatar')
      .sort(sortOption);

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
      ratingSum += r.rating;
    });

    const total = reviews.length;
    const averageRating = total > 0 ? Math.round((ratingSum / total) * 10) / 10 : 0;
    const distributionPercentages = {};
    for (let i = 1; i <= 5; i++) {
      distributionPercentages[i] = total > 0 ? Math.round((distribution[i] / total) * 100) : 0;
    }

    return successResponse(
      res,
      {
        reviews,
        distribution,
        distributionPercentages,
        totalReviews: total,
        averageRating,
      },
      'Reviews retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;

    const business = await Business.findById(businessId);
    if (!business) {
      return errorResponse(res, 'Business not found', 404);
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ user: userId, business: businessId });
    if (existing) {
      return errorResponse(
        res,
        'You have already reviewed this business. You can edit your existing review.',
        400
      );
    }

    const review = await Review.create({
      user: userId,
      business: businessId,
      rating,
      reviewText,
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    return successResponse(res, { review: populated }, 'Review submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    // Ownership check
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Forbidden: You can only edit your own reviews', 403);
    }

    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.reviewText = reviewText;

    await review.save();

    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    return successResponse(res, { review: populated }, 'Review updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    // Ownership check
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Forbidden: You can only delete your own reviews', 403);
    }

    await Review.findByIdAndDelete(id);

    return successResponse(res, null, 'Review deleted successfully');
  } catch (err) {
    next(err);
  }
};
