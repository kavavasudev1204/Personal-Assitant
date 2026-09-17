const Lead = require('../models/Lead');
const SalesActivity = require('../models/SalesActivity');

const getLeadReport = async (req, res, next) => {
  try {
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const leadsByLocation = await Lead.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, leadsByStatus, leadsByLocation });
  } catch (err) {
    next(err);
  }
};

const getSalesReport = async (req, res, next) => {
  try {
    const funnelByStage = await SalesActivity.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalExpectedValue: { $sum: '$expectedValue' },
        },
      },
    ]);

    res.json({ success: true, funnelByStage });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeadReport, getSalesReport };
