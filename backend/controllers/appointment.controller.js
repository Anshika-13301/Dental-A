const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Conversation = require('../models/Conversation');
const config = require('../config/config');

/**
 * Get all appointments for practice
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const { status, startDate, endDate } = req.query;

    const query = practiceId ? { practiceId } : {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName phone email insuranceCarrier overdueMonths')
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create confirmed hygiene appointment
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const { patientId, hygienistName, appointmentDate, durationMinutes, notes, bookingChannel } = req.body;

    if (!patientId || !appointmentDate) {
      return res.status(400).json({ success: false, message: 'Please provide patient ID and appointment date' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const appointment = await Appointment.create({
      practiceId,
      patientId,
      hygienistName: hygienistName || 'Sarah Jenkins, RDH',
      appointmentDate: new Date(appointmentDate),
      durationMinutes: durationMinutes || 60,
      status: 'CONFIRMED',
      bookingChannel: bookingChannel || 'SMS_AI_AUTOMATED',
      commissionBilled: false,
      commissionAmount: config.BILLING.PER_BOOKING_COMMISSION,
      notes: notes || 'Booked via DentAgent AI hygiene reactivation'
    });

    // Update patient status to SCHEDULED
    patient.status = 'SCHEDULED';
    await patient.save();

    // Mark conversation as BOOKED
    await Conversation.findOneAndUpdate(
      { practiceId, patientId },
      { status: 'BOOKED' }
    );

    const populated = await Appointment.findById(appointment._id).populate('patientId');

    res.status(201).json({
      success: true,
      message: 'Hygiene appointment confirmed and chair slot booked',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status (e.g. COMPLETED, CANCELLED)
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status || appointment.status;
    await appointment.save();

    // If completed, update patient lastHygieneDate and reset overdue months
    if (status === 'COMPLETED') {
      await Patient.findByIdAndUpdate(appointment.patientId, {
        lastHygieneDate: appointment.appointmentDate,
        overdueMonths: 0,
        status: 'COMPLETED'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get hygiene chair metrics
 */
exports.getHygieneMetrics = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const query = practiceId ? { practiceId } : {};

    const totalConfirmed = await Appointment.countDocuments({ ...query, status: 'CONFIRMED' });
    const totalCompleted = await Appointment.countDocuments({ ...query, status: 'COMPLETED' });
    const totalPending = await Appointment.countDocuments({ ...query, status: 'PENDING_CONFIRMATION' });

    // Approximate hygiene revenue generated ($185 average clinical hygiene chair production)
    const estimatedProduction = (totalConfirmed + totalCompleted) * 185;
    const totalCommissionAccrued = (totalConfirmed + totalCompleted) * config.BILLING.PER_BOOKING_COMMISSION;

    res.status(200).json({
      success: true,
      data: {
        totalConfirmed,
        totalCompleted,
        totalPending,
        totalBookings: totalConfirmed + totalCompleted,
        estimatedHygieneProduction: estimatedProduction,
        commissionAccrued: totalCommissionAccrued,
        perBookingRate: config.BILLING.PER_BOOKING_COMMISSION
      }
    });
  } catch (error) {
    next(error);
  }
};
