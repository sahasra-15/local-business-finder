import mongoose from 'mongoose';
import { Business } from './Business.js';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Review must belong to a business'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    reviewText: {
      type: String,
      required: [true, 'Please provide your review thoughts'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews by the same user for the same business
reviewSchema.index({ user: 1, business: 1 }, { unique: true });

// Static method to recalculate average rating & review count
reviewSchema.statics.calculateAverageRating = async function (businessId) {
  const stats = await this.aggregate([
    { $match: { business: businessId } },
    {
      $group: {
        _id: '$business',
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Business.findByIdAndUpdate(businessId, {
      totalReviews: stats[0].totalReviews,
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
    });
  } else {
    await Business.findByIdAndUpdate(businessId, {
      totalReviews: 0,
      averageRating: 0,
    });
  }
};

// Update rating after saving review
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.business);
});

// Update rating after removing review
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.business);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
