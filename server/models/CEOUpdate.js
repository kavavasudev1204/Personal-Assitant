const mongoose = require('mongoose');

const ceoUpdateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add title for CEO update'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Sales', 'Quotation', 'Opportunity', 'Task', 'Management', 'Other'],
      default: 'Sales',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    importance: {
      type: String,
      enum: ['Critical', 'High', 'Medium'],
      default: 'High',
    },
    information: {
      type: String,
      required: [true, 'Please add information details'],
    },
    relatedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    relatedCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    relatedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
    relatedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    actionRequired: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Draft', 'Informed', 'Completed', 'Not Required'],
      default: 'Pending',
      index: true,
    },
    ceoInformedDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CEOUpdate', ceoUpdateSchema);
