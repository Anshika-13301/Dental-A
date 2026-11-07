const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
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
    sender: {
      type: String,
      enum: ['PATIENT', 'AI_AGENT', 'STAFF'],
      required: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    twilioSid: {
      type: String,
      default: null
    },
    deliveryStatus: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'RECEIVED', 'FAILED'],
      default: 'SENT'
    },
    aiMetadata: {
      intent: { type: String, default: null },
      confidence: { type: Number, default: null },
      tokensUsed: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
