const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    practiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    lastHygieneDate: {
      type: Date,
      required: true
    },
    overdueMonths: {
      type: Number,
      required: true,
      default: 6
    },
    status: {
      type: String,
      enum: ['OVERDUE', 'ENGAGED', 'SCHEDULED', 'COMPLETED', 'INACTIVE'],
      default: 'OVERDUE'
    },
    optedOut: {
      type: Boolean,
      default: false
    },
    insuranceCarrier: {
      type: String,
      default: 'Delta Dental PPO'
    },
    notes: {
      type: String,
      default: ''
    },
    lastContactedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

patientSchema.index({ practiceId: 1, phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);
