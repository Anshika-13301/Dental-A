const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

/**
 * Get current user's practice profile
 */
exports.getPracticeProfile = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    if (!practiceId) {
      return res.status(404).json({ success: false, message: 'No practice associated with this account' });
    }

    const practice = await Tenant.findById(practiceId).populate('ownerId', 'name email');
    res.status(200).json({ success: true, data: practice });
  } catch (error) {
    next(error);
  }
};

/**
 * Update practice profile
 */
exports.updatePracticeProfile = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const practice = await Tenant.findByIdAndUpdate(practiceId, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: practice });
  } catch (error) {
    next(error);
  }
};

/**
 * Super Admin: Get all tenant practices
 */
exports.getAllTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find().populate('ownerId', 'name email');

    const enhanced = await Promise.all(
      tenants.map(async (t) => {
        const patientCount = await Patient.countDocuments({ practiceId: t._id });
        const confirmedBookings = await Appointment.countDocuments({ practiceId: t._id, status: 'CONFIRMED' });
        return {
          ...t.toObject(),
          stats: {
            patientCount,
            confirmedBookings,
            estimatedMonthlyBilling: (t.subscription?.flatFee || 600) + confirmedBookings * (t.subscription?.perBookingCommission || 20)
          }
        };
      })
    );

    res.status(200).json({ success: true, count: enhanced.length, data: enhanced });
  } catch (error) {
    next(error);
  }
};
