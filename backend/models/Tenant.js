const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    practiceName: {
      type: String,
      required: [true, 'Please provide practice name'],
      trim: true,
      maxlength: 120
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide clinic phone number'],
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' }
    },
    timeZone: {
      type: String,
      default: 'America/New_York'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRIAL', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    subscription: {
      flatFee: {
        type: Number,
        default: 600
      },
      perBookingCommission: {
        type: Number,
        default: 20
      },
      status: {
        type: String,
        enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED'],
        default: 'ACTIVE'
      },
      billingCycleAnchorDay: {
        type: Number,
        default: 1
      }
    },
    aiConfig: {
      autoPilotEnabled: {
        type: Boolean,
        default: true
      },
      customPromptInstructions: {
        type: String,
        default: 'Be polite, empathetic, and professional. Explain that routine hygiene appointments prevent costly procedures. Offer morning or afternoon slots.'
      },
      operatingHours: {
        start: { type: String, default: '08:00' },
        end: { type: String, default: '17:00' }
      },
      hygienistNames: {
        type: [String],
        default: ['Sarah Jenkins, RDH', 'Michael Vance, RDH']
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Tenant', tenantSchema);
