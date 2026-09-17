const SalesActivity = require('../models/SalesActivity');

const getSalesActivities = async (req, res, next) => {
  try {
    const activities = await SalesActivity.find()
      .populate('companyId', 'name')
      .populate('leadId', 'leadId productOrService')
      .populate('assignedSalesPersonId', 'name')
      .sort({ activityDate: -1 });
    res.json({ success: true, count: activities.length, activities });
  } catch (err) {
    next(err);
  }
};

const createSalesActivity = async (req, res, next) => {
  try {
    const activity = await SalesActivity.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, activity });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSalesActivities, createSalesActivity };
