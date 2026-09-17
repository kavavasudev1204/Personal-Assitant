const Opportunity = require('../models/Opportunity');
const { calculateDeadlineUrgency } = require('../services/deadlineEngineService');

const getOpportunities = async (req, res, next) => {
  try {
    const opps = await Opportunity.find()
      .populate('responsiblePersonId', 'name email')
      .sort({ endDate: 1 });

    const oppsWithUrgency = opps.map((o) => {
      const urgency = calculateDeadlineUrgency(o.endDate);
      return {
        ...o.toObject(),
        calculatedUrgency: urgency.status, // Green, Orange, Red, Grey
        urgencyLabel: urgency.label,
        daysRemaining: urgency.daysRemaining,
        colorCode: urgency.colorCode,
      };
    });

    res.json({ success: true, count: oppsWithUrgency.length, opportunities: oppsWithUrgency });
  } catch (err) {
    next(err);
  }
};

const createOpportunity = async (req, res, next) => {
  try {
    const opp = await Opportunity.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, opportunity: opp });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOpportunities, createOpportunity };
