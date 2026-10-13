import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Business } from '../src/models/Business.js';
import { Review } from '../src/models/Review.js';
import { Favorite } from '../src/models/Favorite.js';

let mongoServer;
let adminToken;
let owner1Token;
let owner2Token;
let userToken;
let owner1Id;
let owner2Id;
let userId;
let createdBusinessId;

beforeAll(async () => {
  const fs = await import('fs');
  const path = await import('path');
  const possibleBinaries = [
    path.resolve('node_modules/.cache/mongodb-memory-server/mongod-x64-win32-7.0.24.exe'),
    path.resolve(process.env.USERPROFILE || '', '.cache/mongodb-binaries/mongodb-win32-x86_64-windows-7.0.24/bin/mongod.exe'),
    path.resolve(process.env.USERPROFILE || '', '.cache/mongodb-binaries/mongod-x64-win32-7.0.24.exe'),
  ];
  const existingBinary = possibleBinaries.find((p) => fs.existsSync(p));
  const serverOpts = existingBinary ? { binary: { systemBinary: existingBinary } } : {};

  mongoServer = await MongoMemoryServer.create(serverOpts);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Setup Admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'System Admin',
      email: 'admin.test@localbiz.demo',
      password: 'Password@123',
    });
  // Promote to admin directly in db for test
  await User.findByIdAndUpdate(adminRes.body.data.user.id, { role: 'admin' });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin.test@localbiz.demo', password: 'Password@123' });
  adminToken = adminLogin.body.data.token;

  // Setup Owner 1
  const o1Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Owner One',
      email: 'owner1.test@localbiz.demo',
      password: 'Password@123',
      role: 'business_owner',
    });
  owner1Token = o1Res.body.data.token;
  owner1Id = o1Res.body.data.user.id;

  // Setup Owner 2
  const o2Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Owner Two',
      email: 'owner2.test@localbiz.demo',
      password: 'Password@123',
      role: 'business_owner',
    });
  owner2Token = o2Res.body.data.token;
  owner2Id = o2Res.body.data.user.id;

  // Setup Regular User
  const uRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Regular Customer',
      email: 'customer.test@localbiz.demo',
      password: 'Password@123',
      role: 'user',
    });
  userToken = uRes.body.data.token;
  userId = uRes.body.data.user.id;

  // Seed distinct test businesses for search/filter testing
  await Business.create([
    {
      name: 'Medchal Organic Supermarket',
      description: 'Fresh organic vegetables, fruits, and cold pressed oils in Medchal town.',
      category: 'Supermarkets & Grocery Stores',
      address: { street: 'Main NH 44', locality: 'Medchal', city: 'Hyderabad', state: 'Telangana', postalCode: '501401' },
      location: { type: 'Point', coordinates: [78.4814, 17.6297] },
      contact: { phone: '+91 91111 22221' },
      owner: owner1Id,
      status: 'approved',
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 24,
      priceRange: '$$',
    },
    {
      name: 'Kandlakoya Tech Innovations',
      description: 'Cloud and software consultancy hub inside Kandlakoya IT Park.',
      category: 'IT Companies, Tech Firms & Coworking',
      address: { street: 'Gateway IT Road', locality: 'Kandlakoya', city: 'Hyderabad', state: 'Telangana', postalCode: '501401' },
      location: { type: 'Point', coordinates: [78.4878, 17.5878] },
      contact: { phone: '+91 91111 22222' },
      owner: owner2Id,
      status: 'approved',
      isVerified: false,
      averageRating: 4.5,
      totalReviews: 12,
      priceRange: '$$$',
    },
    {
      name: 'Medchal Biryani Hub',
      description: 'Authentic Hyderabadi dum biryani and kebabs near Medchal bus station.',
      category: 'Restaurants, Cafes & Food Outlets',
      address: { street: 'Bus Stand Road', locality: 'Medchal', city: 'Hyderabad', state: 'Telangana', postalCode: '501401' },
      location: { type: 'Point', coordinates: [78.4820, 17.6300] },
      contact: { phone: '+91 91111 22223' },
      owner: owner1Id,
      status: 'approved',
      isVerified: true,
      averageRating: 3.5,
      totalReviews: 8,
      priceRange: '$',
    },
    {
      name: 'Kompally Family Clinic',
      description: 'Comprehensive family healthcare, outpatient care, and diagnostics in Kompally.',
      category: 'Hospitals, Clinics & Diagnostic Labs',
      address: { street: 'Near Cineplanet', locality: 'Kompally', city: 'Hyderabad', state: 'Telangana', postalCode: '500100' },
      location: { type: 'Point', coordinates: [78.4852, 17.5385] },
      contact: { phone: '+91 91111 22224' },
      owner: owner2Id,
      status: 'approved',
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 35,
      priceRange: '$$',
    },
    {
      name: 'Unrated Local Bakery',
      description: 'Fresh milk bread and eggless cakes in Secunderabad.',
      category: 'Restaurants, Cafes & Food Outlets',
      address: { street: 'Clock Tower Road', locality: 'Secunderabad', city: 'Hyderabad', state: 'Telangana', postalCode: '500003' },
      location: { type: 'Point', coordinates: [78.5000, 17.4410] },
      contact: { phone: '+91 91111 22225' },
      owner: owner1Id,
      status: 'approved',
      isVerified: false,
      averageRating: 0,
      totalReviews: 0,
      priceRange: '$',
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('1. Health Check & Route Handling', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/unknown-endpoint should return 404', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('2. User Authentication & Authorization', () => {
  it('should reject registration with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email',
        email: 'invalid-email-address',
        password: 'Password@123',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate',
        email: 'customer.test@localbiz.demo',
        password: 'Password@123',
      });
    expect(res.status).toBe(400);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer.test@localbiz.demo',
        password: 'WrongPassword123',
      });
    expect(res.status).toBe(401);
  });

  it('should protect /api/auth/me from unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should allow authenticated user to access /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('customer.test@localbiz.demo');
  });
});

describe('3. Admin Authorization Controls', () => {
  it('should forbid regular user from accessing admin stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow admin user to access admin stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(4);
  });
});

describe('4. Business Creation, Ownership & Management', () => {
  it('should prevent regular user from creating a business listing', async () => {
    const res = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Bistro',
        description: 'Trying to create without business_owner role',
        category: 'Restaurants and Cafes',
        address: {
          street: 'Test St',
          locality: 'ECIL',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500062',
        },
        location: { coordinates: [78.567, 17.478] },
        contact: { phone: '+91 90000 00000' },
      });
    expect(res.status).toBe(403);
  });

  it('should allow business owner to create listing', async () => {
    const res = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${owner1Token}`)
      .send({
        name: 'Hyderabad Tiffin Center',
        description: 'Authentic idlis and dosas served hot every morning',
        category: 'Restaurants and Cafes',
        address: {
          street: 'Main Road',
          locality: 'ECIL',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500062',
        },
        location: { coordinates: [78.567, 17.478] },
        contact: { phone: '+91 90000 11111' },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.business.name).toBe('Hyderabad Tiffin Center');
    createdBusinessId = res.body.data.business._id;
  });

  it('should prevent owner 2 from updating owner 1 listing', async () => {
    const res = await request(app)
      .put(`/api/businesses/${createdBusinessId}`)
      .set('Authorization', `Bearer ${owner2Token}`)
      .send({ name: 'Hacked Business Name' });
    expect(res.status).toBe(403);
  });

  it('should allow owner 1 to update their own listing', async () => {
    const res = await request(app)
      .put(`/api/businesses/${createdBusinessId}`)
      .set('Authorization', `Bearer ${owner1Token}`)
      .send({ description: 'Updated authentic breakfast menu and coffee.' });
    expect(res.status).toBe(200);
    expect(res.body.data.business.description).toBe('Updated authentic breakfast menu and coffee.');
  });
});

describe('5. Search, Filters & Geospatial Queries', () => {
  it('should search businesses by query string (partial & case-insensitive)', async () => {
    const res = await request(app).get('/api/businesses?search=organic');
    expect(res.status).toBe(200);
    expect(res.body.data.businesses.length).toBeGreaterThan(0);
    expect(res.body.data.businesses.some((b) => b.name === 'Medchal Organic Supermarket')).toBe(true);
  });

  it('should return empty list when no businesses match search query (no fake fallbacks)', async () => {
    const res = await request(app).get('/api/businesses?search=NonExistentZzzzQuery12345');
    expect(res.status).toBe(200);
    expect(res.body.data.businesses).toHaveLength(0);
    expect(res.body.data.pagination.totalCount).toBe(0);
  });

  it('should filter businesses by category and aliases', async () => {
    // Primary category name
    const resPrimary = await request(app).get('/api/businesses?category=Supermarkets%20%26%20Grocery%20Stores');
    expect(resPrimary.status).toBe(200);
    expect(resPrimary.body.data.businesses.some((b) => b.name === 'Medchal Organic Supermarket')).toBe(true);

    // Alias category name
    const resAlias = await request(app).get('/api/businesses?category=Grocery%20Stores%20and%20Supermarkets');
    expect(resAlias.status).toBe(200);
    expect(resAlias.body.data.businesses.some((b) => b.name === 'Medchal Organic Supermarket')).toBe(true);
  });

  it('should filter businesses strictly by locality', async () => {
    const res = await request(app).get('/api/businesses?locality=Medchal');
    expect(res.status).toBe(200);
    expect(res.body.data.businesses.length).toBeGreaterThanOrEqual(2);
    // Every business returned must be in Medchal
    expect(res.body.data.businesses.every((b) => b.address?.locality === 'Medchal')).toBe(true);
  });

  it('should filter businesses by Kandlakoya locality', async () => {
    const res = await request(app).get('/api/businesses?locality=Kandlakoya');
    expect(res.status).toBe(200);
    expect(res.body.data.businesses.some((b) => b.name === 'Kandlakoya Tech Innovations')).toBe(true);
    expect(res.body.data.businesses.every((b) => b.address?.locality === 'Kandlakoya')).toBe(true);
  });

  it('should combine category and locality filters correctly', async () => {
    const res = await request(app).get('/api/businesses?locality=Medchal&category=Restaurants,%20Cafes%20%26%20Food%20Outlets');
    expect(res.status).toBe(200);
    expect(res.body.data.businesses.some((b) => b.name === 'Medchal Biryani Hub')).toBe(true);
    expect(res.body.data.businesses.every((b) => b.address?.locality === 'Medchal')).toBe(true);
  });

  it('should filter by verified status only', async () => {
    const resVerified = await request(app).get('/api/businesses?verified=true');
    expect(resVerified.status).toBe(200);
    expect(resVerified.body.data.businesses.every((b) => b.isVerified === true)).toBe(true);
    expect(resVerified.body.data.businesses.some((b) => b.name === 'Kandlakoya Tech Innovations')).toBe(false);
  });

  it('should filter by minRating and priceRange', async () => {
    const resRating = await request(app).get('/api/businesses?minRating=4');
    expect(resRating.status).toBe(200);
    expect(resRating.body.data.businesses.every((b) => b.averageRating >= 4)).toBe(true);
    expect(resRating.body.data.businesses.some((b) => b.name === 'Medchal Biryani Hub')).toBe(false);

    const resPrice = await request(app).get('/api/businesses?priceRange=%24%24%24');
    expect(resPrice.status).toBe(200);
    expect(resPrice.body.data.businesses.every((b) => b.priceRange === '$$$')).toBe(true);
  });

  it('should filter by coordinates and radius strictly', async () => {
    // Medchal coordinates: 17.6297, 78.4814 with radius of 2km
    const res = await request(app).get('/api/businesses?lat=17.6297&lng=78.4814&radius=2');
    expect(res.status).toBe(200);
    expect(res.body.data.businesses.some((b) => b.name === 'Medchal Organic Supermarket')).toBe(true);
    expect(res.body.data.businesses.some((b) => b.name === 'Kompally Family Clinic')).toBe(false);
    expect(res.body.data.businesses.some((b) => b.name === 'Unrated Local Bakery')).toBe(false);
  });

  it('should sort businesses by rating, name, and reviews', async () => {
    const resRating = await request(app).get('/api/businesses?sort=rating');
    expect(resRating.status).toBe(200);
    const ratings = resRating.body.data.businesses.map((b) => b.averageRating || 0);
    for (let i = 0; i < ratings.length - 1; i++) {
      expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
    }

    const resName = await request(app).get('/api/businesses?sort=name');
    expect(resName.status).toBe(200);
    const names = resName.body.data.businesses.map((b) => b.name.toLowerCase());
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  it('should reject invalid coordinates in nearby search', async () => {
    const res = await request(app).get('/api/businesses/nearby?lat=999&lng=999');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return nearby businesses when valid coordinates provided', async () => {
    const res = await request(app).get('/api/businesses/nearby?lat=17.6297&lng=78.4814&radius=10');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.businesses)).toBe(true);
    expect(res.body.data.businesses.length).toBeGreaterThan(0);
  });

  it('should return live-discover / live-places response with openstreetmap source', async () => {
    const res = await request(app).get('/api/businesses/live-places?lat=17.6297&lng=78.4814&radius=2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.source).toContain('OpenStreetMap');
    expect(Array.isArray(res.body.data.places)).toBe(true);
  });
});

describe('6. Reviews and Ratings System', () => {
  it('should reject invalid rating numbers', async () => {
    const res = await request(app)
      .post(`/api/reviews/business/${createdBusinessId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 10, reviewText: 'Too many stars!' });
    expect(res.status).toBe(400);
  });

  it('should allow user to submit a valid review', async () => {
    const res = await request(app)
      .post(`/api/reviews/business/${createdBusinessId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, reviewText: 'Exceptional food and very speedy service!' });
    expect(res.status).toBe(201);
    expect(res.body.data.review.rating).toBe(5);
  });

  it('should prevent duplicate reviews from same user for same business', async () => {
    const res = await request(app)
      .post(`/api/reviews/business/${createdBusinessId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4, reviewText: 'Trying to review twice.' });
    expect(res.status).toBe(400);
  });

  it('should recalculate business average rating', async () => {
    const biz = await Business.findById(createdBusinessId);
    expect(biz.averageRating).toBe(5);
    expect(biz.totalReviews).toBe(1);
  });
});

describe('7. Favorites System', () => {
  it('should allow user to add business to favorites', async () => {
    const res = await request(app)
      .post(`/api/favorites/${createdBusinessId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(201);
    expect(res.body.data.isFavorite).toBe(true);
  });

  it('should verify business is in favorites', async () => {
    const res = await request(app)
      .get(`/api/favorites/check/${createdBusinessId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isFavorite).toBe(true);
  });

  it('should retrieve list of user favorites', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.favorites.length).toBe(1);
  });

  it('should remove business from favorites', async () => {
    const res = await request(app)
      .delete(`/api/favorites/${createdBusinessId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isFavorite).toBe(false);
  });
});

describe('8. Review Sorting & Dynamic Calculations', () => {
  it('should retrieve reviews sorted by highest rating', async () => {
    const res = await request(app).get(`/api/reviews/business/${createdBusinessId}?sort=highest`);
    expect(res.status).toBe(200);
    expect(res.body.data.reviews.length).toBeGreaterThan(0);
    expect(res.body.data.averageRating).toBe(5);
  });

  it('should retrieve reviews sorted by lowest rating', async () => {
    const res = await request(app).get(`/api/reviews/business/${createdBusinessId}?sort=lowest`);
    expect(res.status).toBe(200);
    expect(res.body.data.reviews.length).toBeGreaterThan(0);
  });
});

describe('9. Admin Moderation & Duplicate Detection', () => {
  it('should retrieve duplicate business analysis for admin', async () => {
    const res = await request(app)
      .get('/api/admin/duplicates')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('duplicates');
    expect(res.body.data).toHaveProperty('totalDuplicatesFound');
  });

  it('should allow admin to delete inappropriate review and recalculate rating', async () => {
    const userReviews = await Review.find({ business: createdBusinessId });
    expect(userReviews.length).toBeGreaterThan(0);
    const revId = userReviews[0]._id;

    const res = await request(app)
      .delete(`/api/admin/reviews/${revId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const biz = await Business.findById(createdBusinessId);
    expect(biz.totalReviews).toBe(0);
    expect(biz.averageRating).toBe(0);
  });
});
