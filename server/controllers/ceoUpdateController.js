const CEOUpdate = require('../models/CEOUpdate');

const getCEOUpdates = async (req, res, next) => {
  try {
    const updates = await CEOUpdate.find()
      .populate('relatedCompanyId', 'name')
      .populate('relatedLeadId', 'leadId')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: updates.length, updates });
  } catch (err) {
    next(err);
  }
};

const createCEOUpdate = async (req, res, next) => {
  try {
    const update = await CEOUpdate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, update });
  } catch (err) {
    next(err);
  }
};

const markCEOInformed = async (req, res, next) => {
  try {
    const update = await CEOUpdate.findByIdAndUpdate(
      req.params.id,
      { status: 'Informed', ceoInformedDate: new Date() },
      { new: true }
    );
    if (!update) return res.status(404).json({ success: false, message: 'CEO Update item not found' });
    res.json({ success: true, update });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCEOUpdates, createCEOUpdate, markCEOInformed };
