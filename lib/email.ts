import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "mock_resend_key";
const resend = resendKey !== "mock_resend_key" ? new Resend(resendKey) : null;

export async function sendOTPEmail(email: string, name: string, otpCode: string) {
  const subject = "TrustBridge - Confirm Your OTP Code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0ea5e9; text-align: center;">Confirm Your Verification</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering on TrustBridge. To activate your credentials and complete authentication, please enter the following One-Time Password (OTP) code:</p>
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a; margin: 20px 0; border-radius: 8px;">
        ${otpCode}
      </div>
      <p style="font-size: 11px; color: #64748b;">This OTP code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; text-align: center; color: #94a3b8;">TrustBridge - Transparent Charity Donation Platform</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: "TrustBridge <noreply@trustbridge.com>",
        to: email,
        subject,
        html,
      });
      console.log(`[EMAIL] OTP sent to ${email} via Resend.`);
    } catch (error) {
      console.error("[EMAIL] Resend OTP email failed. Falling back to console log:", error);
      logConsoleEmail(email, subject, otpCode);
    }
  } else {
    logConsoleEmail(email, subject, otpCode);
  }
}

export async function sendReceiptEmail(
  email: string,
  donorName: string,
  campaignTitle: string,
  amount: number,
  receiptUrl: string
) {
  const subject = "TrustBridge - Donation Receipt Confirmation";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981; text-align: center;">Donation Received!</h2>
      <p>Dear ${donorName || "Supporter"},</p>
      <p>Thank you for your generous contribution of <strong>$${amount.toFixed(2)}</strong> to the campaign: <strong>${campaignTitle}</strong>.</p>
      <p>Your donation is held securely in escrow and will only be disbursed for audited budget allocations. You can view your tax-deductible receipt below:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${receiptUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Download Tax Receipt PDF
        </a>
      </div>
      <p style="font-size: 11px; color: #64748b;">Receipt Reference: ${receiptUrl}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; text-align: center; color: #94a3b8;">TrustBridge - Transparent Charity Donation Platform</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: "TrustBridge <donations@trustbridge.com>",
        to: email,
        subject,
        html,
      });
      console.log(`[EMAIL] Donation receipt sent to ${email} via Resend.`);
    } catch (error) {
      console.error("[EMAIL] Resend receipt email failed. Falling back to console log:", error);
      logConsoleEmail(email, subject, `Amount: $${amount}, Campaign: ${campaignTitle}, Receipt: ${receiptUrl}`);
    }
  } else {
    logConsoleEmail(email, subject, `Amount: $${amount}, Campaign: ${campaignTitle}, Receipt: ${receiptUrl}`);
  }
}

function logConsoleEmail(to: string, subject: string, dataSummary: string) {
  console.log("════════════════════════ MOCK EMAIL OUTBOX ════════════════════════");
  console.log(`To      : ${to}`);
  console.log(`Subject : ${subject}`);
  console.log(`Details : ${dataSummary}`);
  console.log("═══════════════════════════════════════════════════════════════════");
}
