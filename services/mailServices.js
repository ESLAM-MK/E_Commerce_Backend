import nodemailer from "nodemailer"
export const sendEmail = async ({ to, subject, html, otp }) => {
  if (!process.env.BREVO_API_KEY) {
    console.error("[sendEmail] ❌ BREVO_API_KEY not set — email skipped.");
    return;
  }

  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderEmail) {
    console.error("[sendEmail] ❌ SENDER_EMAIL (verified sender address) not set — email skipped.");
    return;
  }

  const body = html || `
  <div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
    <div style="max-width:500px;margin:auto;background:#fff;padding:20px;border-radius:10px;text-align:center;">
      <h2 style="color:#333;">🔐 Password Reset Request</h2>
      <p style="font-size:16px;color:#555;">We received a request to reset your password.</p>
      <p style="font-size:14px;color:#777;">Use the OTP below to continue:</p>
      <div style="font-size:28px;letter-spacing:5px;font-weight:bold;background:#f0f0f0;padding:10px;border-radius:8px;margin:20px 0;color:#000;">
        ${otp}
      </div>
      <p style="font-size:12px;color:red;">This OTP will expire in 10 minutes.</p>
      <hr/>
      <p style="font-size:12px;color:#999;">If you didn't request this, ignore this email.</p>
    </div>
  </div>`;

  console.log(`[sendEmail] Attempting to send "${subject}" to ${to}`);

  if (process.env.NODE_ENV === "development") {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"SmartX" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html:body,
    });
    
    console.log("⚡ [Nodemailer] Email sent in Dev Mode!");
    return;
  }
  else{
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "SMART-X", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: body,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    console.error(`[sendEmail] ❌ Brevo error for "${subject}" → ${to}:`, errData);
    throw new Error(errData.message || "Brevo send failed");
  }

  const data = await res.json();
  console.log(`[sendEmail] ✅ Sent! Message ID: ${data.messageId}`);
  }
};
