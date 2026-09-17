const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'Sales & Management Assistant API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
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

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Sales & Management Assistant API Server running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});
