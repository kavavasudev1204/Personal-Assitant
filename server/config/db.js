const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection failed: ${error.message}`);
    console.log('[Database] Attempting in-memory MongoDB fallback for immediate offline run...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Database] MongoDB Memory Server connected successfully: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`[Database] Error initializing MongoDB Memory Server: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
