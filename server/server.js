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

// Connect Database
connectDB();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

const corsOptions = {
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint with Database Status Validation
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const responsePayload = {
    success: isDbConnected,
    status: isDbConnected ? 'healthy' : 'unhealthy',
    database: isDbConnected ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
    system: 'Sales & Management Assistant API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  };

  if (!isDbConnected) {
    return res.status(503).json(responsePayload);
  }

  res.json(responsePayload);
});

// Auto-seed default users if database is empty
const User = require('./models/User');
const SystemSettings = require('./models/SystemSettings');

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No users found. Creating default seed accounts...');
      await User.create([
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
      ]);
      await SystemSettings.create({
        leadUpdateReminderDays: 7,
        duplicateMatchThreshold: 80,
        leadTypeNRuleName: 'Repeated Lead (Type N)',
      });
      console.log('[Bootstrap] Default users created successfully: assistant@company.com / password123');
    }
  } catch (err) {
    console.error('[Bootstrap Error]', err.message);
  }
};

setTimeout(autoSeedIfEmpty, 2000);

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
