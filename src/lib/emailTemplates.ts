/**
 * Clean, modern, enterprise-grade transactional email templates.
 * Designed with universal email client compatibility (Gmail, Apple Mail, Outlook).
 * Uses clean white-card layout with high contrast, crisp typography, and professional accents.
 */

export interface OtpEmailProps {
  adminName?: string;
  otp: string;
  expiresInMinutes?: number;
}

export interface PasswordChangedEmailProps {
  adminName?: string;
  changedAt: string;
}

export interface InquiryReplyEmailProps {
  recipientName: string;
  replyText: string;
  originalMessage: string;
  originalDate: string;
  projectType?: string;
}

export interface InquiryNotificationEmailProps {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

/**
 * 1. Security Verification Code (OTP) Email Template
 */
export function getOtpEmailHtml({
  adminName = "Md Abu Rayhan",
  otp,
  expiresInMinutes = 10,
}: OtpEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">MD ABU RAYHAN</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Portfolio Security Center</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #eff6ff; color: #0284c7; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Auth Verification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #0f172a;">Hello <strong>${adminName}</strong>,</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                A request was initiated from your admin console to update your master account password. Please use the verification code below to authorize this change:
              </p>

              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 1.5px dashed #0284c7; border-radius: 10px; padding: 24px;">
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">One-Time Security Code</div>
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #0284c7; margin-left: 10px;">${otp}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for <strong>${expiresInMinutes} minutes</strong> only</div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                  <strong>Security Advisory:</strong> If you did not initiate this request, your password remains unchanged. Do not disclose this code to anyone.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Need help? Your portfolio admin dashboard is secured by encrypted JWT and salted bcrypt hashing.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">
                Md Abu Rayhan • Frontend Developer
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Automated Transactional Dispatcher • Dhaka, Bangladesh
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 2. Password Changed Confirmation Email Template
 */
export function getPasswordChangedEmailHtml({
  adminName = "Md Abu Rayhan",
  changedAt,
}: PasswordChangedEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert: Password Changed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">MD ABU RAYHAN</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Portfolio Security Center</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Security Alert</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 8px 12px; background-color: #ecfdf5; border-radius: 8px; margin-bottom: 20px;">
                <span style="font-size: 14px; font-weight: 600; color: #059669;">✓ Master Password Updated Successfully</span>
              </div>

              <p style="margin: 0 0 16px; font-size: 15px; color: #0f172a;">Hello <strong>${adminName}</strong>,</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                This email confirms that your master administrator password for your portfolio was successfully changed. All future logins must use your newly configured password.
              </p>

              <!-- Activity Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Timestamp:</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">${changedAt}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Action:</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">Password Modification</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Status:</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #059669; padding: 4px 0;">Verified &amp; Active</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #f0f9ff; border: 1px solid #e0f2fe; border-left: 4px solid #0284c7; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #0369a1; line-height: 1.5;">
                  <strong>Did you make this change?</strong> If yes, no further action is necessary. If you did not make this update, please immediately access your server environment or MongoDB database to secure your account.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Your account security is protected with salted bcrypt rounds and TLS-encrypted transport.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">
                Md Abu Rayhan • Frontend Developer
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Automated Transactional Dispatcher • Dhaka, Bangladesh
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 3. Inquiry Reply Email Template (Sent to prospective clients / recruiters)
 */
export function getInquiryReplyEmailHtml({
  recipientName,
  replyText,
  originalMessage,
  originalDate,
  projectType = "Project Inquiry",
}: InquiryReplyEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Response to your inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">Md Abu Rayhan</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Frontend Developer</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #eff6ff; color: #0284c7; border-radius: 9999px; font-size: 11px; font-weight: 600;">${projectType}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Reply Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #0f172a;">Hello <strong>${recipientName}</strong>,</p>
              
              <div style="font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-wrap; margin-bottom: 28px;">
${replyText.trim()}
              </div>

              <!-- Original Message Blockquote -->
              <div style="background-color: #f8fafc; border-left: 3px solid #0284c7; border-radius: 4px; padding: 14px 18px; margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px;">
                  On ${originalDate}, ${recipientName} wrote:
                </div>
                <div style="font-size: 13px; color: #475569; font-style: italic; white-space: pre-wrap; line-height: 1.6;">${originalMessage}</div>
              </div>

              <!-- Sign-off -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <div style="font-size: 14px; font-weight: 700; color: #0f172a;">Md Abu Rayhan</div>
                <div style="font-size: 13px; color: #64748b;">Frontend Developer</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 2px;">
                  Email: <a href="mailto:aburayhan.bpi@gmail.com" style="color: #0284c7; text-decoration: none;">aburayhan.bpi@gmail.com</a> • WhatsApp: <a href="https://wa.me/8801719857898" style="color: #0284c7; text-decoration: none;">+880 171 985 7898</a>
                </div>
                <div style="font-size: 13px; color: #64748b; margin-top: 2px;">
                  Portfolio: <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" style="color: #0284c7; text-decoration: none;">Portfolio Profile</a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Direct reply to this email reaches Md Abu Rayhan directly • Sherpur, Bogura, Bangladesh (UTC+6)
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 4. Inbound Lead Notification Email Template (Dispatched to Abu Rayhan)
 */
export function getInquiryNotificationHtml({
  name,
  email,
  projectType,
  message,
}: InquiryNotificationEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Portfolio Lead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f172a; color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 16px; font-weight: 700; color: #ffffff;">🚀 New Portfolio Inquiry</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Inbound Lead from Portfolio Website</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 6px; font-size: 11px; font-weight: 600;">${projectType}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <!-- Lead Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding: 4px 0; width: 120px;">Sender Name:</td>
                        <td style="font-size: 14px; font-weight: 600; color: #0f172a; padding: 4px 0;">${name}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Sender Email:</td>
                        <td style="font-size: 14px; font-weight: 600; color: #0284c7; padding: 4px 0;">
                          <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Project Type:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">${projectType}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Body -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message:</div>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</div>
              </div>

              <!-- Action Link -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: Inquiry regarding ${encodeURIComponent(projectType)}" style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
                      Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Direct reply to this notification email will reach <strong>${email}</strong> directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
