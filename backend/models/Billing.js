const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    practiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    baseFee: {
      type: Number,
      default: 600,
      required: true
    },
    confirmedBookingsCount: {
      type: Number,
      default: 0,
      required: true
    },
    commissionPerBooking: {
      type: Number,
      default: 20,
      required: true
    },
    commissionTotal: {
      type: Number,
      default: 0,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'INVOICED', 'PAID', 'OVERDUE'],
      default: 'INVOICED'
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      default: 'ACH Auto-Debit'
    },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

billingSchema.index({ practiceId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Billing', billingSchema);
