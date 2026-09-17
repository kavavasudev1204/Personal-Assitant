const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_assistant_db';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing users
    await User.deleteMany();
    await SystemSettings.deleteMany();

    // Create Initial Users
    const users = await User.create([
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

    console.log(`[Seed] Successfully seeded ${users.length} initial users and system settings.`);
    console.log('--- Initial Credentials ---');
    console.log('Assistant: assistant@company.com / password123');
    console.log('Admin: admin@company.com / password123');
    console.log('Sales: sales@company.com / password123');
    console.log('CEO: ceo@company.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

seedDatabase();
