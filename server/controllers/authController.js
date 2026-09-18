const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      phone: req.user.phone,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (Admin only)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: role || 'Assistant',
      phone: phone || '',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bootstrap/Seed Demo Accounts (Idempotent)
// @route   POST /api/auth/seed
// @access  Public
const seedDemoAccounts = async (req, res, next) => {
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

    const results = [];
    for (const userData of defaultUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        results.push({ email: userData.email, action: 'created' });
      } else {
        user.password = userData.password;
        user.status = 'Active';
        await user.save();
        results.push({ email: userData.email, action: 'password_reset' });
      }
    }

    const settingsCount = await SystemSettings.countDocuments();
    if (settingsCount === 0) {
      await SystemSettings.create({
        leadUpdateReminderDays: 7,
        duplicateMatchThreshold: 80,
        leadTypeNRuleName: 'Repeated Lead (Type N)',
      });
    }

    res.json({
      success: true,
      message: 'Demo accounts bootstrapped successfully',
      results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, register, seedDemoAccounts };
