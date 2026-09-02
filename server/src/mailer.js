// Sends email alerts for notifications. Configured via SMTP_* env vars —
// if SMTP_HOST isn't set (local dev without a mail account, or any test
// run, which never sets it), sendAlert() logs instead of sending. Same
// no-op-when-unconfigured shape as socket.js's emit(): nothing here ever
// needs real credentials for the app or its tests to work.
const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

async function sendAlert({ to, subject, text }) {
  if (!to) return; // nothing to send to — e.g. no department/user email resolved

  const transport = getTransporter();
  if (!transport) {
    console.log(`[mailer] SMTP not configured — would have emailed ${to}: "${subject}"`);
    return;
  }

  await transport.sendMail({
    from: process.env.ALERTS_FROM || 'postflow@localhost',
    to,
    subject,
    text,
  });
}

module.exports = { sendAlert };
