const nodemailer = require('nodemailer');
const config = require('./config');

let transporter;

if (config.SMTP_USER && config.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.warn(`[Nodemailer] SMTP Connection Warning: ${error.message}`);
    } else {
      console.log(`[Nodemailer] Gmail SMTP Transporter ready for OTP delivery (${config.SMTP_USER})`);
    }
  });
} else {
  // Development Mock Transporter
  console.log('[Nodemailer] Running in Development Sandbox mode (SMTP credentials not set). OTPs will be securely logged to console and returned for seamless testing.');
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('--------------------------------------------------');
      console.log(`[DEV EMAIL SIMULATOR] To: ${mailOptions.to}`);
      console.log(`[DEV EMAIL SIMULATOR] Subject: ${mailOptions.subject}`);
      console.log(`[DEV EMAIL SIMULATOR] Body: ${mailOptions.text || mailOptions.html}`);
      console.log('--------------------------------------------------');
      return { messageId: `dev-mock-${Date.now()}` };
    }
  };
}

module.exports = transporter;
