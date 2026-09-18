const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS options with multi-origin and Vercel/Render support
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, direct browser GET)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    const isAllowed =
      allowedOrigins.includes('*') ||
      allowedOrigins.some((allowed) => allowed === cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.onrender.com') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint with Database & User Count Status
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  let userCount = 0;

  if (isDbConnected) {
    try {
      userCount = await mongoose.model('User').countDocuments();
    } catch (e) {
      console.error('[Health Check DB Error]', e.message);
    }
  }

  const responsePayload = {
    status: isDbConnected ? 'ok' : 'error',
    database: isDbConnected ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
    usersInDb: userCount,
    system: 'Sales & Management Assistant API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  };

  if (!isDbConnected) {
    return res.status(503).json(responsePayload);
  }

  res.json(responsePayload);
});

// Auto-seed default users if database is empty or demo users missing (idempotent)
const User = require('./models/User');
const SystemSettings = require('./models/SystemSettings');

const autoSeedIfEmpty = async () => {
  try {
    const defaultUsers = [
      {
        name: 'Vasudev Assistant',
        email: 'assistant@company.com',
        password: 'password123',
        role: 'Assistant',
        phone: '+91 98765 43210',
      },
      {
        name: 'System Admin',
        email: 'admin@company.com',
        password: 'password123',
        role: 'Admin',
        phone: '+91 99999 99999',
      },
      {
        name: 'Amit Sales',
        email: 'sales@company.com',
        password: 'password123',
        role: 'Sales',
        phone: '+91 98123 45678',
      },
      {
        name: 'Chief Executive Officer',
        email: 'ceo@company.com',
        password: 'password123',
        role: 'Management',
        phone: '+91 90000 00000',
      },
    ];

    let createdCount = 0;
    for (const userData of defaultUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create(userData);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`[Bootstrap] Created ${createdCount} missing default seed accounts.`);
    } else {
      console.log('[Bootstrap] All default demo accounts verified.');
    }

    const settingsCount = await SystemSettings.countDocuments();
    if (settingsCount === 0) {
      await SystemSettings.create({
        leadUpdateReminderDays: 7,
        duplicateMatchThreshold: 80,
        leadTypeNRuleName: 'Repeated Lead (Type N)',
      });
      console.log('[Bootstrap] Default system settings created.');
    }
  } catch (err) {
    console.error('[Bootstrap Error]', err.message);
  }
};

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/ceo-updates', require('./routes/ceoUpdateRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (Atlas or memory DB if USE_MEMORY_DB=true)
    await connectDB();

    // 2. Idempotent seed check
    await autoSeedIfEmpty();

    // 3. Start Express server only after DB is ready
    const server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 Sales & Management Assistant API Server running`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
      console.log(`===================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      console.log(`[Server] Graceful shutdown initiated (${signal})...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log('[Database] MongoDB connection closed.');
        } catch (err) {
          console.error('[Database Error] Error closing MongoDB connection:', err.message);
        } finally {
          process.exit(0);
        }
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server] Startup aborted because database connection failed:', err.message);
    process.exit(1);
  }
};

startServer();

