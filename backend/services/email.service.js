const transporter = require('../config/nodemailer');
const config = require('../config/config');

/**
 * Send branded HTML OTP email to user
 */
const sendOtpEmail = async (email, otpCode, userName = 'Dental Professional') => {
  const subject = `DentAgent AI — Security Verification Code [${otpCode}]`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DentAgent AI Verification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 32px; color: #18181B; }
    .container { max-width: 480px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header { border-bottom: 1px solid #F4F4F5; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 18px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em; }
    .brand span { color: #0284C7; }
    .title { font-size: 20px; font-weight: 600; margin: 0 0 12px 0; color: #0F172A; }
    .code-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0284C7; }
    .expires { font-size: 13px; color: #71717A; margin-top: 8px; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #F4F4F5; font-size: 12px; color: #A1A1AA; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">DentAgent<span>.AI</span></div>
    </div>
    <h1 class="title">Two-Step Verification Code</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #3F3F46; margin: 0 0 16px 0;">
      Hello ${userName},<br>
      Please use the single-use security code below to complete your authentication into your clinical portal.
    </p>

    <div class="code-box">
      <div class="code">${otpCode}</div>
      <div class="expires">Valid for 10 minutes (expires strictly on security timeout)</div>
    </div>

    <p style="font-size: 13px; color: #71717A; line-height: 1.5; margin: 0;">
      If you did not request this verification code, please ignore this email or contact your practice security administrator immediately.
    </p>

    <div class="footer">
      <strong>DentAgent AI Healthcare Technologies</strong><br>
      Automated Patient Re-Activation & Hygiene Booking Platform<br>
      Confidentiality Notice: Protected Health Information & HIPAA Compliant Infrastructure.
    </div>
  </div>
</body>
</html>
  `;

  const text = `DentAgent AI Verification Code: ${otpCode}\n\nValid for 10 minutes.\nIf you did not request this code, please ignore this email.`;

  const mailOptions = {
    from: config.SMTP_FROM,
    to: email,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendOtpEmail };
