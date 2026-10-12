import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows OSM map raster tiles to load cleanly
  })
);

// Flexible CORS configuration supporting local dev, Vercel, Netlify, and custom domains
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, health check monitors)
      if (!origin) return callback(null, true);

      // Match configured CLIENT_URL(s)
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow any local development port
      if (origin.startsWith('http://localhost:')) return callback(null, true);

      // Allow all Vercel and Netlify production & preview deployments
      if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app') || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      callback(null, true); // Permissive fallback for student project deployment testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Top-level Health check endpoint (for Render, Railway, AWS, and uptime pings)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Local Business Finder API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Global API rate limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// Serve frontend static assets if built (for all-in-one Render/Railway deployment)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
