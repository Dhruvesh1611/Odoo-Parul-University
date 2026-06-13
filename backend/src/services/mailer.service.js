const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
    },
  });
};

const sendUserCredentialsEmail = async ({ to, name, email, password, role, shopName }) => {
  const subject = `Your ${shopName} account credentials`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="color: #1A4D2E;">Welcome to ${shopName}</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created with the following credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Role:</strong> ${role}</li>
        <li><strong>Temporary Password:</strong> ${password}</li>
      </ul>
      <p>Please sign in and change your password after the first login.</p>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[MAIL MOCK] User credentials email');
      console.log({ to, subject, email, password, role, shopName });
    }
    return { mocked: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  return { mocked: false };
};

module.exports = {
  sendUserCredentialsEmail,
};