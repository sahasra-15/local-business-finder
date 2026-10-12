import { z } from 'zod';
import { BUSINESS_CATEGORIES } from '../models/Business.js';

const dayHours = z.object({
  open: z.string().default('09:00'),
  close: z.string().default('21:00'),
  isClosed: z.boolean().default(false),
});

export const businessCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(BUSINESS_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid business category selected' }),
  }),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    locality: z.string().min(1, 'Locality is required (e.g. ECIL, Tarnaka)'),
    city: z.string().min(1, 'City is required').default('Hyderabad'),
    state: z.string().min(1, 'State is required').default('Telangana'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('India'),
  }),
  location: z.object({
    coordinates: z
      .array(z.number())
      .length(2, 'Location coordinates must be [longitude, latitude]')
      .refine(
        ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
        'Coordinates must be valid longitude (-180 to 180) and latitude (-90 to 90)'
      ),
  }),
  contact: z.object({
    phone: z.string().min(5, 'Valid contact phone number is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  }),
  images: z.array(z.string().url('Invalid image URL')).optional().default([]),
  openingHours: z
    .object({
      monday: dayHours.optional(),
      tuesday: dayHours.optional(),
      wednesday: dayHours.optional(),
      thursday: dayHours.optional(),
      friday: dayHours.optional(),
      saturday: dayHours.optional(),
      sunday: dayHours.optional(),
    })
    .optional(),
  services: z.array(z.string()).optional().default([]),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional().default('$$'),
});

export const businessUpdateSchema = businessCreateSchema.partial();
