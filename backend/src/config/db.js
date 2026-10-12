import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/local_business_finder';
  const allowFallback = !isProduction && process.env.USE_IN_MEMORY_DB_FALLBACK !== 'false';

  try {
    // Attempt standard connection with 10s timeout in production for Atlas TLS, 3s in local
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProduction ? 10000 : 3000,
    });
    console.log(`[Database] Successfully connected to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (err) {
    console.warn(`[Database] Unable to connect to primary MongoDB at ${uri}: ${err.message}`);

    if (allowFallback) {
      console.log('[Database] Starting embedded MongoMemoryServer for development/demo fallback...');
      try {
        const fs = await import('fs');
        const path = await import('path');

        const possibleBinaries = [
          path.resolve('node_modules/.cache/mongodb-memory-server/mongod-x64-win32-7.0.24.exe'),
          path.resolve(process.env.USERPROFILE || '', '.cache/mongodb-binaries/mongodb-win32-x86_64-windows-7.0.24/bin/mongod.exe'),
          path.resolve(process.env.USERPROFILE || '', '.cache/mongodb-binaries/mongod-x64-win32-7.0.24.exe'),
        ];
        const existingBinary = possibleBinaries.find((p) => fs.existsSync(p));

        const serverOpts = existingBinary
          ? { binary: { systemBinary: existingBinary } }
          : {};

        if (existingBinary) {
          console.log(`[Database] Using local MongoDB binary: ${existingBinary}`);
        }

        mongoMemoryServer = await MongoMemoryServer.create(serverOpts);
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`[Database] Connected to embedded in-memory MongoDB (${memoryUri}).`);
        console.log('[Database] NOTE: Data stored in-memory will reset when the server restarts.');
        console.log('[Database] NOTE: Configure MONGODB_URI in backend/.env to connect to MongoDB Atlas or local mongod.');
      } catch (memErr) {
        console.error('[Database] Failed to start embedded in-memory database:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[Database] Fatal: Unable to connect to persistent MongoDB in production mode.');
      console.error('[Database] Target URI:', uri.replace(/\/\/.*@/, '//<credentials>@'));
      console.error('[Database] Details:', err.message);
      console.error('[Database] Action required: Verify your MONGODB_URI connection string in your hosting environment variables (e.g. Render Dashboard -> Environment) and ensure Network Access allows 0.0.0.0/0 in MongoDB Atlas.');
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected.');
  });
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected successfully.');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};
