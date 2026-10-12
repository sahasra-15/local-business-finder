import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../src/config/db.js';
import { runSeed } from '../src/utils/seedData.js';

const seed = async () => {
  try {
    console.log('[Seed Script] Connecting to database...');
    await connectDB();
    await runSeed(true); // force reset & re-seed
    console.log('--------------------------------------------------');
    console.log('✅ Demonstration seed completed successfully!');
    console.log('🔑 Demo User Logins:');
    console.log('   Admin:         admin@localbiz.demo       / Password@123');
    console.log('   Owner:         owner1@localbiz.demo      / Password@123');
    console.log('   Regular User:  user1@localbiz.demo       / Password@123');
    console.log('--------------------------------------------------');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    await disconnectDB();
    process.exit(1);
  }
};

seed();
