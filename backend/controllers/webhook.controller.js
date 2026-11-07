const Patient = require('../models/Patient');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Tenant = require('../models/Tenant');
const Appointment = require('../models/Appointment');
const { generateDentistAgentResponse } = require('../services/openai.service');
const config = require('../config/config');

/**
 * Handle incoming SMS from Twilio webhook
 */
exports.handleTwilioInboundSMS = async (req, res, next) => {
  try {
    const { From, Body, MessageSid } = req.body;

    console.log(`[Twilio Webhook] Inbound SMS from ${From}: "${Body}"`);

    if (!From || !Body) {
      return res.status(400).send('<Response></Response>');
    }

    // Clean phone number (last 10 digits or exact match)
    const normalizedPhone = From.replace(/\D/g, '').slice(-10);

    const patient = await Patient.findOne({
      phone: { $regex: normalizedPhone }
    });

    if (!patient) {
      console.warn(`[Twilio Webhook] Received SMS from unregistered phone: ${From}`);
      return res.type('text/xml').send('<Response></Response>');
    }

    const practice = await Tenant.findById(patient.practiceId);
    let conversation = await Conversation.findOne({
      practiceId: patient.practiceId,
      patientId: patient._id
    });

    if (!conversation) {
      conversation = await Conversation.create({
        practiceId: patient.practiceId,
        patientId: patient._id,
        status: 'ACTIVE',
        autoPilot: true
      });
    }

    // Record incoming message
    const incomingMsg = await Message.create({
      conversationId: conversation._id,
      practiceId: patient.practiceId,
      patientId: patient._id,
      sender: 'PATIENT',
      body: Body,
      twilioSid: MessageSid,
      deliveryStatus: 'RECEIVED'
    });

    conversation.lastMessagePreview = Body;
    conversation.lastMessageAt = new Date();
    conversation.unreadCount += 1;
    await conversation.save();

    const io = req.app.get('socketio');
    if (io) {
      io.to(`practice_${patient.practiceId}`).emit('message:received', {
        message: incomingMsg,
        conversationId: conversation._id
      });
    }

    // If autoPilot is enabled, generate response
    let replyText = '';
    if (conversation.autoPilot) {
      const history = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 });
      const aiResponse = await generateDentistAgentResponse({
        patient,
        practice,
        conversationHistory: history,
        incomingMessageText: Body
      });

      replyText = aiResponse.replyText;

      const aiMsg = await Message.create({
        conversationId: conversation._id,
        practiceId: patient.practiceId,
        patientId: patient._id,
        sender: 'AI_AGENT',
        body: replyText,
        deliveryStatus: 'SENT',
        aiMetadata: {
          intent: aiResponse.intent,
          confidence: 0.98
        }
      });

      conversation.lastMessagePreview = replyText;
      conversation.lastMessageAt = new Date();

      if (aiResponse.isBookingConfirmed) {
        conversation.status = 'BOOKED';
        patient.status = 'SCHEDULED';
        await patient.save();

        const appointmentDate = aiResponse.appointmentSlot ? new Date(aiResponse.appointmentSlot) : new Date(Date.now() + 3 * 24 * 3600 * 1000);

        const appointment = await Appointment.create({
          practiceId: patient.practiceId,
          patientId: patient._id,
          hygienistName: practice?.aiConfig?.hygienistNames?.[0] || 'Sarah Jenkins, RDH',
          appointmentDate,
          durationMinutes: 60,
          status: 'CONFIRMED',
          bookingChannel: 'SMS_AI_AUTOMATED',
          commissionBilled: false,
          commissionAmount: config.BILLING.PER_BOOKING_COMMISSION,
          notes: 'Auto-confirmed via Twilio inbound SMS re-activation'
        });

        if (io) {
          io.to(`practice_${patient.practiceId}`).emit('appointment:confirmed', {
            appointment,
            patientName: `${patient.firstName} ${patient.lastName}`
          });
        }
      }

      await conversation.save();

      if (io) {
        io.to(`practice_${patient.practiceId}`).emit('message:sent', {
          message: aiMsg,
          conversationId: conversation._id
        });
      }
    }

    // Return TwiML XML response
    if (replyText) {
      res.type('text/xml').send(`
        <Response>
          <Message>${replyText}</Message>
        </Response>
      `);
    } else {
      res.type('text/xml').send('<Response></Response>');
    }
  } catch (error) {
    console.error('[Twilio Webhook Error]', error);
    res.type('text/xml').send('<Response></Response>');
  }
};
