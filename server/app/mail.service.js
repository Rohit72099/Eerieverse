const nodemailer = require('nodemailer');

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const createClientUrl = (path, token) => {
  const url = new URL(path, getClientUrl());
  url.searchParams.set('token', token);
  return url.toString();
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({ from, to, subject, text, html });
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = createClientUrl('/verify-email', token);

  await sendEmail({
    to: email,
    subject: 'Verify your EerieVerse email address',
    text: `Verify your EerieVerse account: ${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to EerieVerse.</p><p><a href="${verificationUrl}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = createClientUrl('/reset-password', token);

  await sendEmail({
    to: email,
    subject: 'Reset your EerieVerse password',
    text: `Reset your EerieVerse password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request it, you can ignore this email.`,
    html: `<p>We received a request to reset your EerieVerse password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in 1 hour. If you did not request it, you can ignore this email.</p>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
