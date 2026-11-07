const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    practiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    hygienistName: {
      type: String,
      default: 'Sarah Jenkins, RDH'
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING_CONFIRMATION', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'CONFIRMED'
    },
    bookingChannel: {
      type: String,
      enum: ['SMS_AI_AUTOMATED', 'STAFF_MANUAL', 'ONLINE_PORTAL'],
      default: 'SMS_AI_AUTOMATED'
    },
    commissionBilled: {
      type: Boolean,
      default: false,
      index: true
    },
    commissionAmount: {
      type: Number,
      default: 20
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
