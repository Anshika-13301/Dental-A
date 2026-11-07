const Billing = require('../models/Billing');
const Appointment = require('../models/Appointment');
const Tenant = require('../models/Tenant');
const config = require('../config/config');

/**
 * Get current billing overview and real-time accrual metrics
 */
exports.getBillingOverview = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    if (!practiceId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, message: 'Practice association missing' });
    }

    const practice = await Tenant.findById(practiceId);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Count confirmed bookings in current billing window
    const confirmedCount = await Appointment.countDocuments({
      practiceId,
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const baseFee = practice?.subscription?.flatFee || config.BILLING.FLAT_BASE_FEE;
    const perBookingFee = practice?.subscription?.perBookingCommission || config.BILLING.PER_BOOKING_COMMISSION;
    const commissionTotal = confirmedCount * perBookingFee;
    const currentAccruedTotal = baseFee + commissionTotal;

    // Hygiene chair production value unlocked ($185 average hygiene value per seat)
    const hygieneProductionGenerated = confirmedCount * 185;
    const netPracticeProfit = hygieneProductionGenerated - currentAccruedTotal;
    const roiMultiplier = currentAccruedTotal > 0 ? (hygieneProductionGenerated / currentAccruedTotal).toFixed(1) : '12.4';

    res.status(200).json({
      success: true,
      data: {
        cycle: {
          month: currentMonth,
          year: currentYear,
          periodStart: startOfMonth,
          periodEnd: endOfMonth
        },
        pricingPlan: {
          name: 'DentAgent Commercial Growth Plan',
          flatMonthlyBaseFee: baseFee,
          perConfirmedBookingFee: perBookingFee,
          currency: 'USD'
        },
        currentMetrics: {
          confirmedBookingsCount: confirmedCount,
          baseFee,
          commissionTotal,
          currentAccruedTotal,
          hygieneProductionGenerated,
          netPracticeProfit,
          roiMultiplier: `${roiMultiplier}x`
        },
        subscriptionStatus: practice?.subscription?.status || 'ACTIVE'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invoices for practice
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const query = practiceId ? { practiceId } : {};

    const invoices = await Billing.find(query).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate monthly billing invoice
 */
exports.generateMonthlyInvoice = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId || req.body.practiceId;
    const { month, year } = req.body;

    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const practice = await Tenant.findById(practiceId);
    if (!practice) {
      return res.status(404).json({ success: false, message: 'Practice not found' });
    }

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Find confirmed appointments in that month
    const confirmedAppointments = await Appointment.find({
      practiceId,
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const confirmedCount = confirmedAppointments.length;
    const baseFee = practice.subscription?.flatFee || config.BILLING.FLAT_BASE_FEE;
    const perBookingFee = practice.subscription?.perBookingCommission || config.BILLING.PER_BOOKING_COMMISSION;
    const commissionTotal = confirmedCount * perBookingFee;
    const totalAmount = baseFee + commissionTotal;

    const invoiceNumber = `INV-${targetYear}${String(targetMonth).padStart(2, '0')}-${practice._id.toString().slice(-4).toUpperCase()}`;

    // Itemized lines
    const lineItems = [
      {
        description: 'DentAgent AI Platform Flat Monthly Retainer & Re-Activation Infrastructure',
        quantity: 1,
        unitPrice: baseFee,
        amount: baseFee
      },
      {
        description: `Confirmed Hygiene Chair Bookings Commission ($${perBookingFee}/confirmed chair)`,
        quantity: confirmedCount,
        unitPrice: perBookingFee,
        amount: commissionTotal
      }
    ];

    const invoice = await Billing.findOneAndUpdate(
      { practiceId, month: targetMonth, year: targetYear },
      {
        invoiceNumber,
        baseFee,
        confirmedBookingsCount: confirmedCount,
        commissionPerBooking: perBookingFee,
        commissionTotal,
        totalAmount,
        status: 'INVOICED',
        dueDate: new Date(targetYear, targetMonth, 15),
        lineItems
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark invoice as paid
 */
exports.markInvoicePaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Billing.findByIdAndUpdate(
      id,
      {
        status: 'PAID',
        paidAt: new Date()
      },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};
