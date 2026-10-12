import { z } from 'zod';

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  reviewText: z.string().min(5, 'Review must be at least 5 characters long').max(1000, 'Review cannot exceed 1000 characters'),
});

export const reviewUpdateSchema = reviewCreateSchema.partial();
