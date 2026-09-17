const Lead = require('../models/Lead');
const { checkDuplicateLead } = require('../services/duplicateCheckService');

const getLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find()
      .populate('companyId', 'name location industry')
      .populate('assignedSalesPersonId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    const leadCount = await Lead.countDocuments();
    const leadId = `LD-${new Date().getFullYear()}-${String(leadCount + 1).padStart(4, '0')}`;
    const lead = await Lead.create({ ...req.body, leadId, createdBy: req.user._id });
    res.status(201).json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

const checkDuplicate = async (req, res, next) => {
  try {
    const duplicates = await checkDuplicateLead(req.body);
    res.json({ success: true, count: duplicates.length, duplicates });
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: new Date() }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeads, createLead, checkDuplicate, updateLead };
