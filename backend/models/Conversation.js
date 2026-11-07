const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['ACTIVE', 'WAITING_ON_PATIENT', 'ESCALATED_TO_STAFF', 'BOOKED', 'CLOSED'],
      default: 'ACTIVE'
    },
    autoPilot: {
      type: Boolean,
      default: true
    },
    lastMessagePreview: {
      type: String,
      default: ''
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ practiceId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
