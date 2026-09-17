const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add opportunity name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Awards', 'Funding', 'Tenders', 'Registrations', 'Grants', 'Conferences', 'Exhibitions', 'Memberships', 'Certifications', 'Competitions', 'Other'],
      required: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Active', 'Submitted', 'Won', 'Lost', 'Expired'],
      default: 'Active',
      index: true,
    },
    responsiblePersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    documentsRequired: {
      type: [String],
      default: [],
    },
    ceoInformationRequired: {
      type: Boolean,
      default: false,
    },
    ceoInformed: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('Opportunity', opportunitySchema);
