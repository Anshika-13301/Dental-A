const OpenAI = require('openai');
const config = require('../config/config');

let openaiClient = null;

if (config.OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    console.log('[OpenAI] Client initialized with model:', config.OPENAI_MODEL);
  } catch (err) {
    console.warn('[OpenAI] Initialization warning:', err.message);
  }
} else {
  console.log('[OpenAI] Running in Smart Rule-Based Engine mode (OPENAI_API_KEY not configured).');
}

/**
 * Generate dental conversational response using OpenAI RAG or Smart Engine
 */
const generateDentistAgentResponse = async ({
  patient,
  practice,
  conversationHistory = [],
  incomingMessageText
}) => {
  const practiceName = practice?.practiceName || 'Apex Dental Care';
  const hygienists = practice?.aiConfig?.hygienistNames?.join(', ') || 'Sarah Jenkins, RDH';
  const operatingHours = `${practice?.aiConfig?.operatingHours?.start || '08:00 AM'} to ${practice?.aiConfig?.operatingHours?.end || '05:00 PM'}`;
  const customInstructions = practice?.aiConfig?.customPromptInstructions || '';

  // Rule 1: Check for opt-out keywords
  const lowerMsg = incomingMessageText.toLowerCase().trim();
  if (['stop', 'unsubscribe', 'cancel all', 'leave me alone', 'quit'].includes(lowerMsg)) {
    return {
      replyText: `You have been unsubscribed from automated appointment reminders for ${practiceName}. Reply START to re-enable.`,
      intent: 'OPT_OUT',
      isBookingConfirmed: false,
      appointmentSlot: null
    };
  }

  // If OpenAI is available, call GPT
  if (openaiClient) {
    try {
      const systemPrompt = `You are the friendly, professional, clinical hygiene scheduling coordinator for "${practiceName}".
Operating Hours: ${operatingHours}.
Hygienists: ${hygienists}.
Patient Name: ${patient.firstName} ${patient.lastName}.
Last Hygiene Appointment: ${patient.lastHygieneDate ? new Date(patient.lastHygieneDate).toLocaleDateString() : 'Over 6 months ago'} (${patient.overdueMonths} months overdue).
Insurance on file: ${patient.insuranceCarrier || 'Standard PPO'}.

Clinical Instructions:
${customInstructions}

Tone & Rules:
1. Act like a real, experienced dental receptionist texting a patient.
2. NEVER use buzzwords like "supercharge", "seamless", "cutting-edge", or "AI".
3. Keep the SMS short, clear, and direct (under 200 characters if possible).
4. Guide the patient to confirm a specific morning or afternoon hygiene appointment time.
5. If the patient agrees to an appointment time or proposes a day/time, confirm it warmly.

You MUST respond in strict JSON format:
{
  "replyText": "your SMS text response here",
  "intent": "BOOKING_CONFIRMED" | "TIME_PROPOSAL" | "QUESTION" | "RESCHEDULE" | "OPT_OUT",
  "isBookingConfirmed": boolean,
  "appointmentSlot": "ISO Date string or null if not yet confirmed"
}`;

      const formattedHistory = conversationHistory.slice(-6).map((msg) => ({
        role: msg.sender === 'PATIENT' ? 'user' : 'assistant',
        content: msg.body
      }));

      const messages = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: incomingMessageText }
      ];

      const completion = await openaiClient.chat.completions.create({
        model: config.OPENAI_MODEL,
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(completion.choices[0].message.content);
      return {
        replyText: parsed.replyText,
        intent: parsed.intent || 'CONVERSATION',
        isBookingConfirmed: Boolean(parsed.isBookingConfirmed),
        appointmentSlot: parsed.appointmentSlot || null
      };
    } catch (err) {
      console.error('[OpenAI Error] Chat completion failed, falling back to smart rule engine:', err.message);
    }
  }

  // Smart Rule-Based Engine (Guaranteed zero-failure fallback)
  const isAffirmative = /\b(yes|yeah|sure|yep|tuesday|wednesday|thursday|friday|monday|morning|afternoon|2pm|10am|book it|works for me|sounds good|confirm)\b/i.test(lowerMsg);
  const isQuestion = /\b(how much|cost|price|insurance|delta|coverage|take|accept|location|address)\b/i.test(lowerMsg);
  const isReschedule = /\b(not now|busy|later|next month|next week|can't make it)\b/i.test(lowerMsg);

  if (isAffirmative) {
    // Generate next business day at 10:00 AM or 2:00 PM
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(10, 0, 0, 0);

    return {
      replyText: `Great, ${patient.firstName}! I have reserved Tuesday at 10:00 AM with Sarah, RDH at ${practiceName}. We look forward to seeing you then! Reply C to confirm or let us know if you need to adjust.`,
      intent: 'BOOKING_CONFIRMED',
      isBookingConfirmed: true,
      appointmentSlot: targetDate.toISOString()
    };
  } else if (isQuestion) {
    return {
      replyText: `Hi ${patient.firstName}, routine preventative hygiene is usually covered 100% under your ${patient.insuranceCarrier || 'dental insurance'}. Would Tuesday morning or Thursday afternoon fit your schedule best?`,
      intent: 'QUESTION',
      isBookingConfirmed: false,
      appointmentSlot: null
    };
  } else if (isReschedule) {
    return {
      replyText: `No problem at all, ${patient.firstName}. Keeping up with preventative cleanings helps avoid gum inflammation and deep decay. Would next week or early next month work better for you?`,
      intent: 'RESCHEDULE',
      isBookingConfirmed: false,
      appointmentSlot: null
    };
  }

  return {
    replyText: `Hi ${patient.firstName}, this is ${practiceName}. Dr. Chen asked me to reach out as you're due for your hygiene visit. We have openings this Tuesday at 10am or Thursday at 2pm. Which works best for you?`,
    intent: 'TIME_PROPOSAL',
    isBookingConfirmed: false,
    appointmentSlot: null
  };
};

module.exports = { generateDentistAgentResponse };
