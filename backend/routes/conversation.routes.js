const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationMessages,
  sendManualMessage,
  toggleAutoPilot,
  simulatePatientSMS
} = require('../controllers/conversation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/', getConversations);
router.get('/:id/messages', getConversationMessages);
router.post('/manual-reply', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), sendManualMessage);
router.put('/:id/toggle-autopilot', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), toggleAutoPilot);
router.post('/simulate-sms', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), simulatePatientSMS);

module.exports = router;
