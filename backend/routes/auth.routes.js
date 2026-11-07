const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  logout
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;
