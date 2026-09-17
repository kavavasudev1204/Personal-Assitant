const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      index: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      index: true,
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '', index: true },
      state: { type: String, default: '', index: true },
      country: { type: String, default: 'India' },
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

module.exports = mongoose.model('Company', companySchema);
