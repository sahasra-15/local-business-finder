import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { runSeed } from './utils/seedData.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    try {
      await runSeed(false);
    } catch (seedErr) {
      console.warn('[Server] Auto-seed warning:', seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Local Business Finder API Server running on port ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📡 Client URL:   ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`=================================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
