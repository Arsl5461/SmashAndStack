const nodemailer = require('nodemailer');
const env = require('../config/environment');
const logger = require('../config/logger');
const { AppError } = require('./AppError');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  return transporter;
}

function otpEmailHtml(name, otp, expiresMinutes) {
  return `
    <div style="background:#0B0E13;padding:32px 16px;font-family:Arial,sans-serif;color:#E8EDF4;">
      <div style="max-width:480px;margin:0 auto;background:#141A22;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">
        <p style="margin:0 0 6px;color:#E31B23;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Smash & Stack</p>
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;">Password reset code</h1>
        <p style="margin:0 0 20px;color:#9AA5B4;font-size:14px;line-height:1.5;">
          Hi ${name || 'there'}, use this one-time code to reset your password. It expires in ${expiresMinutes} minutes.
        </p>
        <div style="background:#1B232E;border-radius:12px;padding:18px;text-align:center;letter-spacing:0.28em;font-size:32px;font-weight:700;color:#ffffff;">
          ${otp}
        </div>
        <p style="margin:20px 0 0;color:#8B95A5;font-size:12px;line-height:1.5;">
          If you did not request this, you can ignore this email. Do not share this code with anyone.
        </p>
      </div>
    </div>
  `;
}

async function sendOtpEmail({ to, name, otp }) {
  const expiresMinutes = env.otp.expiresMinutes;
  const mail = {
    from: env.smtp.from,
    to,
    subject: `${otp} is your Smash & Stack reset code`,
    text: `Hi ${name || 'there'}, your Smash & Stack password reset code is ${otp}. It expires in ${expiresMinutes} minutes.`,
    html: otpEmailHtml(name, otp, expiresMinutes),
  };

  const transport = getTransporter();
  if (!transport) {
    if (env.isProduction) {
      throw new AppError('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.', 503);
    }
    logger.warn(`SMTP is not configured. OTP for ${to}: ${otp}`);
    return { delivered: false, preview: true };
  }

  try {
    await transport.sendMail(mail);
    logger.info(`Password reset OTP emailed to ${to}`);
    return { delivered: true };
  } catch (error) {
    logger.error({ message: 'Failed to send OTP email', error: error.message, to });
    throw new AppError('Unable to send the verification email. Please try again later.', 503);
  }
}

module.exports = {
  sendOtpEmail,
};
