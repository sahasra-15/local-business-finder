import mongoose from 'mongoose';

export const BUSINESS_CATEGORIES = [
  'Restaurants and Cafes',
  'Grocery Stores and Supermarkets',
  'Hospitals and Clinics',
  'Pharmacies',
  'Salons and Beauty Services',
  'Automobile Repair',
  'Electronics and Mobile Repair',
  'Clothing and Fashion',
  'Educational Institutes and Coaching Centers',
  'Hotels and Accommodation',
  'Home Repair and Maintenance',
  'Fitness Centers and Gyms',
  'Professional Services',
  'Other Local Businesses',
];

const dayHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [120, 'Business name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: BUSINESS_CATEGORIES,
    },
    address: {
      street: { type: String, required: true },
      locality: { type: String, required: true }, // e.g. ECIL, AS Rao Nagar
      city: { type: String, required: true, default: 'Hyderabad' },
      state: { type: String, required: true, default: 'Telangana' },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Coordinates must be valid [longitude, latitude] numbers',
        },
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
      ],
    },
    openingHours: {
      monday: { type: dayHoursSchema, default: () => ({ open: '09:00', close: '21:00', isClosed: false }) },
      tuesday: { type: dayHoursSchema, default: () => ({ open: '09:00', close: '21:00', isClosed: false }) },
      wednesday: { type: dayHoursSchema, default: () => ({ open: '09:00', close: '21:00', isClosed: false }) },
      thursday: { type: dayHoursSchema, default: () => ({ open: '09:00', close: '21:00', isClosed: false }) },
      friday: { type: dayHoursSchema, default: () => ({ open: '09:00', close: '21:00', isClosed: false }) },
      saturday: { type: dayHoursSchema, default: () => ({ open: '09:00', close: '22:00', isClosed: false }) },
      sunday: { type: dayHoursSchema, default: () => ({ open: '10:00', close: '20:00', isClosed: false }) },
    },
    services: {
      type: [String],
      default: [],
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON 2dsphere index for location proximity queries
businessSchema.index({ location: '2dsphere' });
businessSchema.index({ category: 1, status: 1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ name: 'text', description: 'text', 'address.locality': 'text' });

// Auto-generate slug before save
businessSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    const cleanName = (this.name || 'business')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${cleanName}-${randomSuffix}`;
  }
  next();
});

export const Business = mongoose.model('Business', businessSchema);
