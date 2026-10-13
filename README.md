# 📍 Local Business Finder — Full-Stack Location-Based Web Application

A full-stack, commercial-grade web application built with **Node.js, Express, MongoDB (Mongoose), React (Vite), Tailwind CSS, Leaflet, and OpenStreetMap**.

The platform provides extensive coverage across **Medchal, Kandlakoya (including Kandlakoya IT Park), North Hyderabad, Cyberabad / West Hyderabad, Central Hyderabad & Secunderabad, East Hyderabad, and South Hyderabad**, empowering users to discover genuine local businesses, inspect interactive maps, filter by distance radius, explore categorized services, write reviews, and save favorites.

---

## 🌟 Key Features

### 1. Extensive Hyderabad & Telangana Locality Coverage
- **🌟 Medchal & Kandlakoya Region**: Kandlakoya, Kandlakoya IT Park, Medchal Town, Medchal Checkpost, Medchal Railway Station Road, Gundlapochampally.
- **📍 North Hyderabad**: Kompally, Suchitra, Jeedimetla, Quthbullapur, Alwal, Bowenpally.
- **📍 West Hyderabad & Cyberabad**: HITEC City, Madhapur, Gachibowli, Kondapur, Kukatpally, KPHB, Miyapur, Hafeezpet, Nallagandla, Jubilee Hills, Banjara Hills.
- **📍 Central Hyderabad & Secunderabad**: Secunderabad, Paradise, Begumpet, Ameerpet, Himayatnagar, Abids, Koti, Somajiguda, Panjagutta.
- **📍 East Hyderabad**: Uppal, Habsiguda, Tarnaka, Nacharam, Mallapur, LB Nagar, Nagole, ECIL, AS Rao Nagar, Sainikpuri, Malkajgiri.
- **📍 South Hyderabad**: Dilsukhnagar, Malakpet, Mehdipatnam, Tolichowki, Attapur, Rajendranagar, Shamshabad (Airport Zone), Charminar (Old City).

### 2. Real-World Business Discovery via OpenStreetMap (OSM)
- **Live Overpass API Integration**: Real-time querying of genuine physical businesses, amenities, colleges, banks, supermarkets, and healthcare facilities with verified coordinates.
- **Transparent Verification Badging**:
  - `Verified Place (OSM)` for genuine OpenStreetMap listings.
  - `Registered Business` for local merchant accounts registered on the platform.
  - `Demo Listing` for sample entries.
- **No Fabricated Information**: Businesses without user reviews honestly state *"No reviews yet"* instead of arbitrary fake ratings. Genuine addresses, phone contacts, and direct driving directions are provided.

### 3. Location-Aware Geospatial Search
- **Browser Geolocation API**: Explicit user permission request with fallback handling.
- **MongoDB 2dsphere Indexes**: High-performance spherical queries using `$geoNear` / GeoJSON Point format.
- **Distance Calculations**: Haversine formula calculates real distance in kilometers and meters.
- **Radius Filters**: Filter businesses within 1 km, 5 km, 10 km, and 25 km.
- **Zone-Grouped Locality Dropdown**: Effortlessly jump between all 6 Hyderabad zones or search "All Hyderabad".

### 2. Interactive Leaflet & OpenStreetMap Maps
- Real-time markers synchronized with active search filters and keywords.
- Custom popup cards with thumbnail photos, categories, ratings, and Google Maps directions links.
- "Split Map View" mode on the Explore page and dedicated full-screen "Map View" page with floating filters.

### 3. Business Discovery & Filtering
- Global keyword search across business names, services, cuisines, descriptions, and localities.
- Filter by category, distance radius, minimum rating (3+, 4+, 4.5+), price range (`$`, `$$`, `$$$`, `$$$$`).
- Sorting options: **Nearest First**, **Highest Rated**, **Most Reviewed**, **Recently Added**.
- Grid and list view toggles with responsive pagination and loading skeletons.

### 4. Business Details & Community Reviews
- Dedicated URL route (`/business/:id`) for every establishment.
- High-resolution image galleries with thumbnail switcher.
- Day-by-day weekly operating hours table with real-time "Open Now" / "Closed" indicators.
- Authenticated 1–5 star reviews with rating distribution bar charts.
- Automated backend recalculation of `averageRating` and `totalReviews`.
- Duplicate review prevention (one review per user per business with edit capability).
- Add/remove favorites toggle retained across sessions.
- Shareable links and one-click Google Maps driving navigation.

### 5. Role-Based Access Control (RBAC)
- **Customer / User**: Browse, search, rate businesses, write reviews, and manage saved favorites.
- **Business Owner**: Register new business listings, update opening hours/services/images/coordinates, and delete listings. Enforces strict backend ownership checks.
- **System Administrator**: Platform-wide metrics dashboard, listing status moderation (`approved`, `pending`, `rejected`), user oversight, and review moderation.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router 7 | Responsive, high-performance user interface |
| **Icons & Maps** | Lucide React, Leaflet 1.9, React-Leaflet 5, OpenStreetMap | Visual icons and interactive mapping |
| **API Client** | Axios | Normalized HTTP requests with JWT interceptor |
| **Backend** | Node.js (v20+), Express 5 | RESTful API architecture |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs | Secure stateless authentication & password hashing |
| **Database** | MongoDB with Mongoose 8 (2dsphere index) | GeoJSON document storage with geospatial indexing |
| **Embedded DB** | `mongodb-memory-server` | Zero-config instant development/testing fallback |
| **Validation** | Zod | Strict schema validation on request payload & params |
| **Security** | Helmet, express-rate-limit, CORS | HTTP security headers and rate limiting |
| **Testing** | Vitest, Supertest | Automated test runner and HTTP assertions |

---

## 📁 Project Structure

```text
LocalBuisnessFinder/
├── backend/
│   ├── scripts/
│   │   └── seed.js                   # Seed script for Hyderabad demonstration data
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection with in-memory fallback
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile
│   │   │   ├── businessController.js # Geospatial search, CRUD, categories
│   │   │   ├── reviewController.js   # Rating calculation, reviews CRUD
│   │   │   ├── favoriteController.js # User saved businesses
│   │   │   └── adminController.js    # Statistics, status moderation
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT protection & optional auth
│   │   │   ├── role.js               # Role-based authorization guard
│   │   │   ├── validate.js           # Zod schema validation
│   │   │   ├── rateLimiter.js        # IP rate limiting
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt
│   │   │   ├── Business.js           # Business schema with 2dsphere index
│   │   │   ├── Review.js             # Review schema with rating aggregation
│   │   │   └── Favorite.js           # Saved businesses schema
│   │   ├── routes/                   # Express REST endpoints
│   │   ├── services/                 # Distance & geocoding services
│   │   ├── utils/                    # JWT, responses, seed data
│   │   ├── validators/               # Zod input schemas
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point
│   ├── tests/
│   │   └── api.test.js               # Automated Vitest test suite (25 tests)
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── business/             # BusinessCard, BusinessFilter
│   │   │   ├── common/               # Navbar, Footer, Button, Modal, RatingStars, Skeleton
│   │   │   ├── map/                  # InteractiveMap (Leaflet + OpenStreetMap)
│   │   │   └── review/               # ReviewCard, ReviewModal, RatingDistribution
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User auth state & role helpers
│   │   │   ├── LocationContext.jsx   # Geolocation API & Hyderabad areas
│   │   │   └── ToastContext.jsx      # Interactive toast alerts
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Hero search, categories, featured, map preview
│   │   │   ├── ExplorePage.jsx       # Search, split-map view, radius filters
│   │   │   ├── BusinessDetailPage.jsx# Gallery, hours, reviews, map, similar spots
│   │   │   ├── MapViewPage.jsx       # Full-screen interactive map
│   │   │   ├── CategoriesPage.jsx    # Category directory with listing counts
│   │   │   ├── FavoritesPage.jsx     # User saved businesses
│   │   │   ├── LoginPage.jsx         # 1-click demo logins
│   │   │   ├── RegisterPage.jsx      # Customer or Owner signup
│   │   │   ├── UserProfilePage.jsx   # Profile editing
│   │   │   ├── owner/                # Merchant listing console & editor
│   │   │   ├── admin/                # Admin statistics & approval workflow
│   │   │   ├── AboutPage.jsx         # Platform information
│   │   │   ├── ContactPage.jsx       # Inquiry form & contacts
│   │   │   └── NotFoundPage.jsx      # Custom 404 page
│   │   ├── services/                 # Axios API wrappers
│   │   ├── utils/                    # Constants & formatters
│   │   ├── App.jsx                   # Route definition & layout
│   │   ├── main.jsx                  # React DOM mount
│   │   └── index.css                 # Tailwind CSS & Leaflet styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)
- (Optional) MongoDB local service or MongoDB Atlas cloud connection string. *(If MongoDB is not installed, the application automatically uses an embedded in-memory MongoDB fallback with zero configuration required!)*

---

### Installation

1. Open your terminal in the project root:
   ```bash
   cd LocalBuisnessFinder
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

---

### Database Configuration

Check `backend/.env`. A default `.env` is already created:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/local_business_finder
USE_IN_MEMORY_DB_FALLBACK=true
JWT_SECRET=super_secret_local_business_finder_jwt_key_2026_dev_only
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

#### Option A: Zero-Config In-Memory Database (Default)
Leave `USE_IN_MEMORY_DB_FALLBACK=true`. The server will automatically initialize an embedded MongoDB instance and auto-seed sample records when started!

#### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/local_business_finder?retryWrites=true&w=majority
   ```
3. Update `backend/.env` with your URI.

#### Option C: Local MongoDB
Ensure `mongod` service is running on port 27017.

---

### Running the Seed Script

To seed or reset the database with demonstration records in Hyderabad:
```bash
npm run seed --prefix backend
```

---

### Starting the Application

Open two terminal tabs in VS Code:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm run dev
```
The server will start at `http://localhost:5000`. You will see:
```text
🚀 Local Business Finder API Server running on port 5000
🔗 Health Check: http://localhost:5000/api/health
```

#### Terminal 2 — Start Frontend Application:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🔑 Demonstration User Accounts

Pre-configured accounts for instant 1-click testing on the Login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **System Admin** | `admin@localbiz.demo` | `Password@123` | Full administrative oversight, listing approvals, user and review management |
| **Business Owner** | `owner1@localbiz.demo` | `Password@123` | Register, edit, and delete their own business listings |
| **Regular User** | `user1@localbiz.demo` | `Password@123` | Browse, rate, post reviews, and manage saved favorites |

*(Note: On the login page, click any of the "Instant Demo Logins" buttons to automatically autofill credentials!)*

---

## 🧪 Automated Testing

Automated end-to-end API tests are written using **Vitest** and **Supertest** with an isolated in-memory MongoDB environment.

To run the test suite:
```bash
cd backend
npm test
```

### Verified Test Cases (29 Automated Tests Passed Across 9 Suites):
- ✅ Health check endpoint & 404 route handling
- ✅ User registration with validation & duplicate email prevention
- ✅ User login with invalid password handling
- ✅ Protected route rejection without JWT token
- ✅ Authenticated access to `/api/auth/me`
- ✅ Role-based authorization guards (Customer vs Owner vs Admin)
- ✅ Prevention of unauthorized business listing creation
- ✅ Business listing creation by verified owner
- ✅ Strict ownership protection (Owner A cannot modify Owner B's listing)
- ✅ Geospatial coordinate validation (rejection of out-of-bounds coordinates)
- ✅ Nearby proximity search with spherical distance calculation
- ✅ Full-text keyword search and category filtering
- ✅ Review creation and 1–5 star validation
- ✅ Prevention of duplicate reviews by the same user
- ✅ Automated recalculation of average rating on business model
- ✅ Favorites management (add, check, list, delete)
- ✅ Review sorting by highest and lowest ratings
- ✅ Admin duplicate business heuristics and detection
- ✅ Admin review deletion and automated rating recalculation

---

## 🌐 Production Cloud Deployment Guide

See [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) for full instructions on deploying:
1. **Persistent Database:** MongoDB Atlas (Free M0 Cluster)
2. **Backend API:** Render / Railway (Free Web Service)
3. **Frontend SPA:** Vercel / Netlify (Free Edge CDN)
4. **All-in-One Alternative:** Full-stack deployment under a single domain via Render Monorepo

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile
- `PUT /api/auth/me` — Update user profile details

### Businesses
- `GET /api/businesses` — Get filtered listings (`search`, `category`, `locality`, `minRating`, `priceRange`, `sort`, `page`, `limit`, `lat`, `lng`)
- `GET /api/businesses/nearby` — Geospatial proximity search (`lat`, `lng`, `radius`, `category`, `limit`)
- `GET /api/businesses/categories` — Get categories with business counts
- `GET /api/businesses/:id` — Get business by ID or slug with similar listings
- `POST /api/businesses` — Create business listing (Owner / Admin only)
- `PUT /api/businesses/:id` — Update listing (Owner of listing or Admin only)
- `DELETE /api/businesses/:id` — Delete listing (Owner of listing or Admin only)
- `GET /api/businesses/my-listings` — Get listings owned by the logged-in merchant

### Reviews
- `GET /api/reviews/business/:businessId` — Get reviews and rating distribution for a business
- `POST /api/reviews/business/:businessId` — Submit review (`rating`, `reviewText`) (Customer only)
- `PUT /api/reviews/:id` — Update own review
- `DELETE /api/reviews/:id` — Delete own review (or Admin)

### Favorites
- `GET /api/favorites` — Get user saved favorites
- `POST /api/favorites/:businessId` — Save business to favorites
- `DELETE /api/favorites/:businessId` — Remove from favorites
- `GET /api/favorites/check/:businessId` — Check if a business is in user favorites

### Admin
- `GET /api/admin/stats` — Platform metrics (Total users, businesses, reviews, pending)
- `GET /api/admin/businesses` — View all listings with status filters
- `PATCH /api/admin/businesses/:id/status` — Approve, reject, or deactivate listing status
- `GET /api/admin/users` — List registered users
- `GET /api/admin/reviews` — Moderate and delete reviews

---

## 🔒 Security Best Practices
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (cost factor 10).
- **JWT Protection**: Tokens verified with expiration checks and user existence validation.
- **HTTP Security**: `helmet` headers protect against clickjacking, XSS, and MIME sniffing.
- **Rate Limiting**: `express-rate-limit` mitigates brute-force attacks on auth endpoints.
- **Input Validation**: Request bodies sanitized and validated using `zod` schemas.
- **Data Isolation**: Users and owners can only modify their own resources.
