const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Patient = require('../models/Patient');
const Tenant = require('../models/Tenant');
const Appointment = require('../models/Appointment');
const { sendSMS } = require('../services/twilio.service');
const { generateDentistAgentResponse } = require('../services/openai.service');
const config = require('../config/config');

/**
 * Get all conversations for practice
 */
exports.getConversations = async (req, res, next) => {
  try {
    const practiceId = req.user.practiceId;
    const query = practiceId ? { practiceId } : {};

    const conversations = await Conversation.find(query)
      .populate('patientId', 'firstName lastName phone email status overdueMonths insuranceCarrier')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get message thread history for a conversation
 */
exports.getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversationId: id }).sort({ sentAt: 1 });

    // Mark unread as read
    await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send manual staff SMS response
 */
exports.sendManualMessage = async (req, res, next) => {
  try {
    const { conversationId, body } = req.body;
    const practiceId = req.user.practiceId;

    if (!conversationId || !body) {
      return res.status(400).json({ success: false, message: 'Conversation ID and message body required' });
    }

    const conversation = await Conversation.findById(conversationId).populate('patientId');
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    const practice = await Tenant.findById(practiceId);

    // Send SMS
    const smsResult = await sendSMS(conversation.patientId.phone, body, practice?.phoneNumber);

    const message = await Message.create({
      conversationId: conversation._id,
      practiceId,
      patientId: conversation.patientId._id,
      sender: 'STAFF',
      body,
      twilioSid: smsResult.sid,
      deliveryStatus: 'SENT'
    });

    conversation.lastMessagePreview = body;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Emit socket event if io is available
    const io = req.app.get('socketio');
    if (io) {
      io.to(`practice_${practiceId}`).emit('message:sent', { message, conversationId });
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle AI Auto-Pilot on/off for a thread
 */
exports.toggleAutoPilot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conversation.autoPilot = !conversation.autoPilot;
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        id: conversation._id,
        autoPilot: conversation.autoPilot
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * In-App Patient SMS Simulator
 * Allows full real-time testing of the AI agent, twilio pipeline, and appointment booking!
 */
exports.simulatePatientSMS = async (req, res, next) => {
  try {
    const { patientId, messageText } = req.body;
    const practiceId = req.user.practiceId;

    if (!patientId || !messageText) {
      return res.status(400).json({ success: false, message: 'Patient ID and message text are required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const practice = await Tenant.findById(practiceId);

    // Get or create conversation
    let conversation = await Conversation.findOne({ practiceId, patientId });
    if (!conversation) {
      conversation = await Conversation.create({
        practiceId,
        patientId,
        status: 'ACTIVE',
        autoPilot: true
      });
    }

    // 1. Record incoming patient SMS
    const patientMsg = await Message.create({
      conversationId: conversation._id,
      practiceId,
      patientId,
      sender: 'PATIENT',
      body: messageText,
      deliveryStatus: 'RECEIVED'
    });

    conversation.lastMessagePreview = messageText;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const io = req.app.get('socketio');
    if (io) {
      io.to(`practice_${practiceId}`).emit('message:received', {
        message: patientMsg,
        conversationId: conversation._id
      });
    }

    let aiMsg = null;
    let newAppointment = null;

    // 2. If Auto-Pilot is enabled, generate AI response
    if (conversation.autoPilot) {
      const history = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 });

      const aiResponse = await generateDentistAgentResponse({
        patient,
        practice,
        conversationHistory: history,
        incomingMessageText: messageText
      });

      // Dispatch outgoing AI SMS
      const smsResult = await sendSMS(patient.phone, aiResponse.replyText, practice?.phoneNumber);

      aiMsg = await Message.create({
        conversationId: conversation._id,
        practiceId,
        patientId,
        sender: 'AI_AGENT',
        body: aiResponse.replyText,
        twilioSid: smsResult.sid,
        deliveryStatus: 'SENT',
        aiMetadata: {
          intent: aiResponse.intent,
          confidence: 0.98
        }
      });

      conversation.lastMessagePreview = aiResponse.replyText;
      conversation.lastMessageAt = new Date();

      // Check if patient confirmed an appointment
      if (aiResponse.isBookingConfirmed) {
        conversation.status = 'BOOKED';
        patient.status = 'SCHEDULED';
        await patient.save();

        const appointmentDate = aiResponse.appointmentSlot ? new Date(aiResponse.appointmentSlot) : new Date(Date.now() + 3 * 24 * 3600 * 1000);

        newAppointment = await Appointment.create({
          practiceId,
          patientId,
          hygienistName: practice?.aiConfig?.hygienistNames?.[0] || 'Sarah Jenkins, RDH',
          appointmentDate,
          durationMinutes: 60,
          status: 'CONFIRMED',
          bookingChannel: 'SMS_AI_AUTOMATED',
          commissionBilled: false,
          commissionAmount: config.BILLING.PER_BOOKING_COMMISSION,
          notes: 'Auto-confirmed via DentAgent AI conversational re-activation'
        });

        if (io) {
          io.to(`practice_${practiceId}`).emit('appointment:confirmed', {
            appointment: newAppointment,
            patientName: `${patient.firstName} ${patient.lastName}`
          });
        }
      }

      await conversation.save();

      if (io) {
        io.to(`practice_${practiceId}`).emit('message:sent', {
          message: aiMsg,
          conversationId: conversation._id
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        patientMessage: patientMsg,
        aiResponse: aiMsg,
        appointmentCreated: newAppointment
      }
    });
  } catch (error) {
    next(error);
  }
};
