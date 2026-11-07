const express = require('express');
const router = express.Router();
const { handleTwilioInboundSMS } = require('../controllers/webhook.controller');

// Twilio calls this endpoint without auth token
router.post('/twilio/inbound-sms', express.urlencoded({ extended: false }), handleTwilioInboundSMS);

module.exports = router;
