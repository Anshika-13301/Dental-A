const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const config = require('../config/config');
const { sendOtpEmail } = require('../services/email.service');

// Generate 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

/**
 * Register User & Clinic Practice
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, practiceName, phoneNumber, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP (10 minute expiry)
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let practice = null;
    const assignedRole = role || 'PRACTICE_ADMIN';

    // If role is PRACTICE_ADMIN, create Tenant practice
    if (assignedRole === 'PRACTICE_ADMIN') {
      practice = await Tenant.create({
        practiceName: practiceName || `${name.split(' ')[0]}'s Dental Practice`,
        phoneNumber: phoneNumber || '+15551234567',
        status: 'ACTIVE',
        subscription: {
          flatFee: config.BILLING.FLAT_BASE_FEE,
          perBookingCommission: config.BILLING.PER_BOOKING_COMMISSION,
          status: 'ACTIVE'
        }
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      isVerified: false,
      otpCode,
      otpExpiresAt,
      practiceId: practice ? practice._id : null
    });

    if (practice) {
      practice.ownerId = user._id;
      await practice.save();
    }

    // Send OTP via Nodemailer
    await sendOtpEmail(user.email, otpCode, user.name);

    res.status(201).json({
      success: true,
      message: 'Registration initiated. A 6-digit verification code has been dispatched to your email.',
      email: user.email,
      // For development ease, include in response if dev environment
      devOtp: config.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login Trigger (Issues 6-digit OTP)
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +otpCode +otpExpiresAt');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate 6-digit OTP
    const otpCode = generateOtp();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email via Nodemailer
    await sendOtpEmail(user.email, otpCode, user.name);

    res.status(200).json({
      success: true,
      message: 'Verification code dispatched to your email address.',
      email: user.email,
      devOtp: config.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 6-digit OTP and Issue Session Tokens
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification code' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otpCode +otpExpiresAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No pending verification request found. Please login again.' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check and try again.' });
    }

    // Mark as verified & clear OTP
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate Access Token
    const token = generateToken(user._id);

    // Set secure HTTP-Only cookie
    const isProduction = config.NODE_ENV === 'production';
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const populatedUser = await User.findById(user._id).populate('practiceId');

    res.status(200).json({
      success: true,
      message: 'Two-step authentication verified successfully.',
      token,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        isVerified: populatedUser.isVerified,
        practice: populatedUser.practiceId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP Code
 */
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpCode = generateOtp();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otpCode, user.name);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email.',
      devOtp: config.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('practiceId');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        practice: user.practiceId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({
    success: true,
    message: 'Signed out successfully'
  });
};
