import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "Please define EMAIL_USER and EMAIL_PASS in .env.local"
  );
}

/**
 * Reusable transporter — uses Gmail with App Password.
 * For other providers set the `host`, `port`, and `secure` fields instead.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a 6-digit OTP to the given email address.
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  name?: string
): Promise<void> {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";

  await transporter.sendMail({
    from: `"Helium" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Helium verification code",
    text: `${greeting}\n\nYour one-time verification code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.\n\n— The Helium Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:'Manrope',Arial,sans-serif;background:#f6f6f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:24px;padding:48px;border:1px solid rgba(0,0,0,0.06);">
                <tr>
                  <td>
                    <!-- Logo -->
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px;">
                      <div style="width:36px;height:36px;background:#238859;border-radius:50%;
                                  display:inline-flex;align-items:center;justify-content:center;">
                        <span style="color:#fff;font-size:18px;font-weight:700;line-height:1;">H</span>
                      </div>
                      <span style="font-size:20px;font-weight:700;color:#1a1a1a;margin-left:8px;">Helium</span>
                    </div>

                    <!-- Greeting -->
                    <p style="font-size:16px;color:#1a1a1a;font-weight:500;margin:0 0 8px;">${greeting}</p>
                    <p style="font-size:15px;color:#5f665c;margin:0 0 32px;">
                      Here is your one-time verification code:
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#ebffe0;border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;">
                      <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#238859;">${otp}</span>
                    </div>

                    <p style="font-size:13px;color:#8d9889;margin:0;">
                      This code expires in <strong>5 minutes</strong>. Never share it with anyone.
                    </p>
                    <hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:32px 0;" />
                    <p style="font-size:12px;color:#8d9889;text-align:center;margin:0;">
                      © ${new Date().getFullYear()} Helium. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}
