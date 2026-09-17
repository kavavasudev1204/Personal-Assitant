const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      index: true,
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
    },
    leadSource: {
      type: String,
      default: 'Direct',
    },
    leadType: {
      type: String,
      default: 'New',
    },
    productOrService: {
      type: String,
      required: true,
    },
    assignedSalesPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Requirement Received', 'Quotation', 'Negotiation', 'Won', 'Lost', 'On Hold'],
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    dateReceived: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
    nextFollowUpDate: {
      type: Date,
      index: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOfLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
