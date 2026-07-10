const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendPasswordResetEmail = async (to, resetUrl) => {
  if (!resend) {
    console.log(`[dev] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Liferecord <onboarding@resend.dev>',
    to,
    subject: 'Reset your Liferecord password',
    text: `Hello,

We received a request to reset the password for your Liferecord account (${to}).

Reset your password using the link below. It will expire in 1 hour:
${resetUrl}

If you didn't request this, you can safely ignore this email — your password will stay the same.

— The Liferecord Team`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1c1917;">
        <p style="font-size: 20px; font-weight: 700; margin: 0 0 24px; color: #78350f;">Liferecord</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          We received a request to reset the password for your Liferecord account (<strong>${to}</strong>).
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #92400e; color: #fffbeb; text-decoration: none; font-size: 16px; font-weight: 600; padding: 12px 28px; border-radius: 999px;">
            Reset your password
          </a>
        </p>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px; color: #57534e;">
          This link will expire in 1 hour. If the button above doesn't work, copy and paste this address into your browser:<br />
          <a href="${resetUrl}" style="color: #92400e; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="font-size: 14px; line-height: 1.6; margin: 24px 0 0; color: #57534e;">
          If you didn't request this, you can safely ignore this email — your password will stay the same.
        </p>
        <p style="font-size: 13px; line-height: 1.6; margin: 32px 0 0; color: #a8a29e;">
          Liferecord — helping people record the stories worth remembering.
        </p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
