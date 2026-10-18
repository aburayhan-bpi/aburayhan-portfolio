import { getInquiryNotificationHtml } from "@/lib/emailTemplates";
import { sendGmailSmtp } from "@/lib/smtp";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface SendInquiryParams {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

export async function sendInquiryNotification({
  name,
  email,
  projectType,
  message,
}: SendInquiryParams) {
  const recipientEmail = process.env.ADMIN_EMAIL || "aburayhan.bpi@gmail.com";
  const subject = `🚀 New Portfolio Lead: ${name} (${projectType})`;
  const emailHtml = getInquiryNotificationHtml({
    name,
    email,
    projectType,
    message,
  });

  // 1. Try Resend if configured
  if (resend) {
    try {
      const notificationResult = await resend.emails.send({
        from: "Portfolio Lead <onboarding@resend.dev>",
        to: recipientEmail,
        replyTo: email,
        subject,
        html: emailHtml,
      });

      return { success: true, provider: "resend", notificationResult };
    } catch (resendError) {
      console.warn("⚠️ Resend delivery failed, falling back to Gmail SMTP:", resendError);
    }
  }

  // 2. Reliable Gmail SMTP Fallback
  try {
    const smtpResult = await sendGmailSmtp({
      to: recipientEmail,
      toName: "Md Abu Rayhan",
      subject,
      html: emailHtml,
      text: `New lead from ${name} (${email}) for ${projectType}:\n\n${message}`,
    });

    return { success: true, provider: "gmail-smtp", smtpResult };
  } catch (smtpError) {
    console.error("❌ Both Resend and SMTP failed to dispatch inquiry email:", smtpError);
    return { success: false, error: smtpError };
  }
}

export default sendInquiryNotification;
