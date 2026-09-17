const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    leadUpdateReminderDays: {
      type: Number,
      default: 7,
    },
    duplicateMatchThreshold: {
      type: Number,
      default: 80,
    },
    leadTypeNRuleName: {
      type: String,
      default: 'Repeated Lead (Type N)',
    },
    customStatuses: {
      type: [String],
      default: ['New', 'Contacted', 'Qualified', 'Requirement Received', 'Quotation', 'Negotiation', 'Won', 'Lost', 'On Hold'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
