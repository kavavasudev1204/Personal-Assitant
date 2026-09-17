const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Sales', 'Lead Management', 'Report', 'Management', 'CEO', 'Finance', 'Administration', 'IT', 'Other'],
      default: 'Sales',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    reminderDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled', 'Overdue'],
      default: 'Pending',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    relatedCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    relatedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    relatedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
    informCEO: {
      type: Boolean,
      default: false,
    },
    ceoUpdateRequiredBy: {
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

module.exports = mongoose.model('Task', taskSchema);
