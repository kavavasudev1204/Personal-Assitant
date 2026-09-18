const mongoose = require('mongoose');
const dns = require('dns');

// Configure custom fallback DNS servers (8.8.8.8, 1.1.1.1) to prevent ECONNREFUSED
// when resolving MongoDB Atlas SRV (_mongodb._tcp) records on Windows local networks.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore if custom DNS resolution is restricted in host environment
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    const msg = '[Database Error] MONGODB_URI is not defined in environment variables.';
    console.error(msg);
    if (process.env.NODE_ENV === 'production' || process.env.USE_MEMORY_DB !== 'true') {
      throw new Error(msg);
    }
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    // Mask URI credentials for safe logging
    const maskedUri = mongoUri ? mongoUri.replace(/\/\/(.*?)@/, '//***:***@') : 'Undefined';
    console.log(`[Database] Target URI: ${maskedUri}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Standard MongoDB connection failed: ${error.message}`);

    const isProduction = process.env.NODE_ENV === 'production';
    const useMemoryDb = process.env.USE_MEMORY_DB === 'true';

    // Never fall back to in-memory DB in production or unless USE_MEMORY_DB=true is explicitly set
    if (isProduction || !useMemoryDb) {
      console.error('[Database Error] In-memory database fallback is disabled. Server startup aborted.');
      throw error;
    }

    console.log('[Database] USE_MEMORY_DB is set to true. Attempting in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Database] MongoDB Memory Server connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database Error] Error initializing MongoDB Memory Server: ${memErr.message}`);
      throw memErr;
    }
  }
};

module.exports = connectDB;
