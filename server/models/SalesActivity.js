const mongoose = require('mongoose');

const salesActivitySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    assignedSalesPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: ['Quotation Sent', 'Follow-up', 'Client Call', 'Meeting', 'Requirement Received', 'Negotiation', 'PO Received', 'Won', 'Lost'],
      required: true,
    },
    activityDate: {
      type: Date,
      default: Date.now,
    },
    stage: {
      type: String,
      enum: ['Lead', 'Enquiry', 'Requirement Received', 'Quotation Preparation', 'Quotation Sent', 'Follow-up', 'Negotiation', 'PO Expected', 'Won', 'Lost'],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    expectedValue: {
      type: Number,
      default: 0,
    },
    nextAction: {
      type: String,
      default: '',
    },
    nextActionDate: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    remarks: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SalesActivity', salesActivitySchema);
