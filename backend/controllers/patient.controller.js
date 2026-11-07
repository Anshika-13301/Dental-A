const Patient = require('../models/Patient');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Tenant = require('../models/Tenant');
const { sendSMS } = require('../services/twilio.service');

/**
 * Get all patients for the user's practice
 */
exports.getPatients = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    if (!practiceId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, message: 'Practice association missing' });
    }

    const { status, minOverdue, search } = req.query;
    const query = practiceId ? { practiceId } : {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (minOverdue) {
      query.overdueMonths = { $gte: parseInt(minOverdue, 10) };
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query).sort({ overdueMonths: -1, lastHygieneDate: 1 });
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single patient with their history
 */
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const conversation = await Conversation.findOne({ patientId: patient._id });
    const messages = conversation
      ? await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 })
      : [];

    res.status(200).json({
      success: true,
      data: {
        patient,
        conversation,
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new patient
 */
exports.createPatient = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const { firstName, lastName, phone, email, lastHygieneDate, insuranceCarrier, notes } = req.body;

    if (!firstName || !lastName || !phone || !lastHygieneDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, phone, and last hygiene date'
      });
    }

    // Calculate overdue months from last hygiene date
    const lastDate = new Date(lastHygieneDate);
    const now = new Date();
    const monthsDiff = Math.max(
      1,
      Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    );

    const patient = await Patient.create({
      practiceId,
      firstName,
      lastName,
      phone,
      email: email || '',
      lastHygieneDate: lastDate,
      overdueMonths: monthsDiff,
      status: monthsDiff >= 6 ? 'OVERDUE' : 'ENGAGED',
      insuranceCarrier: insuranceCarrier || 'Delta Dental PPO',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import patients (CSV/JSON upload)
 */
exports.bulkImportPatients = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const { patients } = req.body;

    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of patients' });
    }

    const docs = patients.map((p) => {
      const lastDate = p.lastHygieneDate ? new Date(p.lastHygieneDate) : new Date(Date.now() - 180 * 24 * 3600 * 1000);
      const monthsDiff = Math.max(
        1,
        Math.round((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      );

      return {
        practiceId,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        email: p.email || '',
        lastHygieneDate: lastDate,
        overdueMonths: monthsDiff,
        status: monthsDiff >= 6 ? 'OVERDUE' : 'ENGAGED',
        insuranceCarrier: p.insuranceCarrier || 'Delta Dental PPO',
        notes: p.notes || ''
      };
    });

    const inserted = await Patient.insertMany(docs);

    res.status(201).json({
      success: true,
      count: inserted.length,
      data: inserted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger Automated Re-activation SMS Campaign for a single patient or batch
 */
exports.triggerReactivationSMS = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const { patientIds, customTemplate } = req.body;

    const practice = await Tenant.findById(practiceId);
    if (!practice) {
      return res.status(404).json({ success: false, message: 'Practice record not found' });
    }

    const query = { practiceId };
    if (patientIds && Array.isArray(patientIds) && patientIds.length > 0) {
      query._id = { $in: patientIds };
    } else {
      // Default: Target all overdue patients who haven't opted out
      query.status = 'OVERDUE';
      query.optedOut = false;
    }

    const patientsToReach = await Patient.find(query);
    const results = [];

    for (const patient of patientsToReach) {
      // Get or create conversation thread
      let conversation = await Conversation.findOne({ practiceId, patientId: patient._id });
      if (!conversation) {
        conversation = await Conversation.create({
          practiceId,
          patientId: patient._id,
          status: 'ACTIVE',
          autoPilot: true
        });
      }

      // Default re-activation copy (clinical, crisp, non-AI cliché)
      const body = customTemplate
        ? customTemplate.replace('{firstName}', patient.firstName).replace('{practiceName}', practice.practiceName)
        : `Hi ${patient.firstName}, this is ${practice.practiceName}. Dr. Chen noted you are overdue for your preventative hygiene visit. We have openings this Tuesday at 10am or Thursday at 2pm. Would either time work for you?`;

      // Dispatch SMS
      const smsResult = await sendSMS(patient.phone, body, practice.phoneNumber);

      // Save Message
      const message = await Message.create({
        conversationId: conversation._id,
        practiceId,
        patientId: patient._id,
        sender: 'AI_AGENT',
        body,
        twilioSid: smsResult.sid,
        deliveryStatus: 'SENT'
      });

      // Update conversation
      conversation.lastMessagePreview = body;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // Update patient status
      patient.status = 'ENGAGED';
      patient.lastContactedAt = new Date();
      await patient.save();

      results.push({
        patientId: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        status: 'DISPATCHED'
      });
    }

    res.status(200).json({
      success: true,
      dispatchedCount: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient record
 */
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};
