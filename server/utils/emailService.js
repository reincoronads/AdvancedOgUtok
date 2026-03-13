const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

exports.sendGuestInviteEmail = async ({ guestEmail, guestName, billName, inviteCode, hostName }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SplitBill" <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: `You've been added to a bill: ${billName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb; margin-top: 0;">You've been added to a bill!</h2>
        <p>Hi <strong>${guestName}</strong>,</p>
        <p><strong>${hostName}</strong> has added you to the bill <strong>"${billName}"</strong> on SplitBill.</p>
        <div style="background: #f3f4f6; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <p style="color: #6b7280; margin: 0 0 8px;">Your Invitation Code</p>
          <p style="font-size: 36px; font-weight: bold; font-family: monospace; color: #2563eb; letter-spacing: 6px; margin: 0;">${inviteCode}</p>
        </div>
        <p>Use this code at <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/guest" style="color: #2563eb;">SplitBill Guest Access</a> to view the bill.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 13px; margin: 0;">
          As a guest, you can access bills for up to <strong>6 hours per day</strong>. Want unlimited access? 
          You can upgrade your account directly from the guest access page.
        </p>
      </div>
    `
  });
};
