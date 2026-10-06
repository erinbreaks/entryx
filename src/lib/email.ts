import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'EntryX <onboarding@resend.dev>';
const ownerEmail = process.env.OWNER_EMAIL || 'erinbobin@gmail.com';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendTicketEmailParams {
  to: string;
  attendeeName: string;
  studentId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketPrice: number;
  ticketNumber: string;
  ticketToken: string;
  qrDataUrl: string;
}

export interface SendEventRequestNotificationParams {
  organizerName: string;
  organizerEmail: string;
  phone: string;
  organizationName: string;
  message: string;
  eventDescription?: string;
  requestId: string;
}

/**
 * Sends a real transactional ticket confirmation email to the attendee
 */
export async function sendTicketConfirmationEmail(params: SendTicketEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    const errorMsg = 'RESEND_API_KEY is not configured in environment variables. Real email dispatch cannot proceed.';
    console.error(`[Email Service Error]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const {
    to,
    attendeeName,
    studentId,
    eventName,
    eventDate,
    eventTime,
    venue,
    ticketPrice,
    ticketNumber,
    ticketToken,
    qrDataUrl,
  } = params;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your EntryX Event Ticket</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0D13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FDFBF7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0D13; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121622; border: 1px solid #262D42; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A1F30 0%, #121622 100%); padding: 32px 36px; border-bottom: 2px solid #E5A93C;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #E5A93C; letter-spacing: -0.5px;">EntryX</h1>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #EADBBF; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Event Entry, Reimagined.</p>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(229, 169, 60, 0.15); border: 1px solid #E5A93C; color: #E5A93C; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;">CONFIRMED TICKET</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Headline -->
          <tr>
            <td style="padding: 32px 36px 20px 36px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">Event Access Pass</p>
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">${eventName}</h2>
            </td>
          </tr>

          <!-- Ticket Details Grid -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1A1F30; border-radius: 12px; padding: 20px;">
                <tr>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Attendee Name</span>
                    <strong style="font-size: 15px; color: #FFFFFF;">${attendeeName}</strong>
                  </td>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Student ID</span>
                    <strong style="font-size: 15px; color: #FFFFFF;">${studentId}</strong>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Date & Time</span>
                    <strong style="font-size: 15px; color: #FFFFFF;">${eventDate} at ${eventTime}</strong>
                  </td>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Venue</span>
                    <strong style="font-size: 15px; color: #FFFFFF;">${venue}</strong>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Ticket Price</span>
                    <strong style="font-size: 15px; color: #E5A93C;">${ticketPrice === 0 ? 'Free' : `₹${ticketPrice}`}</strong>
                  </td>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Ticket Reference</span>
                    <strong style="font-size: 15px; color: #FFFFFF; font-family: monospace;">${ticketNumber}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Verification Section -->
          <tr>
            <td align="center" style="padding: 10px 36px 36px 36px;">
              <table border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 12px; padding: 16px; display: inline-block;">
                <tr>
                  <td align="center">
                    <img src="${qrDataUrl}" alt="QR Entry Code" width="220" height="220" style="display: block; border: 0;" />
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 6px 0; font-size: 13px; color: #E5A93C; font-weight: 600;">Present this QR code at the venue entrance for scanning.</p>
              <p style="margin: 0; font-size: 11px; color: #6B7280; font-family: monospace; word-break: break-all; max-width: 480px;">Token: ${ticketToken.substring(0, 36)}...</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0E121C; padding: 24px 36px; border-top: 1px solid #262D42; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #9CA3AF;">EntryX Platform • Support: erinbobin@gmail.com | 9446611885</p>
              <p style="margin: 0; font-size: 11px; color: #6B7280;">This ticket is non-transferable and cryptographically protected.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your EntryX Ticket: ${eventName} (${ticketNumber})`,
      html,
    });

    if (response.error) {
      console.error('[Resend Error]:', response.error);
      throw new Error(`Resend email delivery failed: ${response.error.message}`);
    }

    return { success: true, id: response.data?.id };
  } catch (err: any) {
    console.error('[Email Send Error]:', err);
    throw new Error(err.message || 'Failed to dispatch confirmation email');
  }
}

/**
 * Sends a real email notification to the Owner when an event request is submitted
 */
export async function sendEventRequestNotification(params: SendEventRequestNotificationParams): Promise<{ success: boolean; id?: string }> {
  if (!resend) {
    const errorMsg = 'RESEND_API_KEY is not configured. Event request email cannot be dispatched.';
    console.error(`[Email Service Warning]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const { organizerName, organizerEmail, phone, organizationName, message, eventDescription, requestId } = params;

  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="background-color: #0B0D13; color: #FDFBF7; font-family: sans-serif; padding: 30px;">
  <div style="max-width: 600px; margin: 0 auto; background: #121622; border: 1px solid #262D42; border-radius: 12px; padding: 30px;">
    <h2 style="color: #E5A93C; margin-top: 0;">New Event Creation Request</h2>
    <p style="color: #9CA3AF;">A new request has been submitted on EntryX:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr><td style="padding: 8px 0; color: #9CA3AF; width: 140px;">Requester:</td><td style="color: #FFF; font-weight: bold;">${organizerName}</td></tr>
      <tr><td style="padding: 8px 0; color: #9CA3AF;">Email:</td><td style="color: #FFF;"><a href="mailto:${organizerEmail}" style="color: #E5A93C;">${organizerEmail}</a></td></tr>
      <tr><td style="padding: 8px 0; color: #9CA3AF;">Phone:</td><td style="color: #FFF;">${phone}</td></tr>
      <tr><td style="padding: 8px 0; color: #9CA3AF;">Organization:</td><td style="color: #FFF;">${organizationName}</td></tr>
      <tr><td style="padding: 8px 0; color: #9CA3AF;">Request ID:</td><td style="color: #FFF; font-family: monospace;">${requestId}</td></tr>
    </table>

    <div style="margin-top: 20px; padding: 15px; background: #1A1F30; border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0; color: #EADBBF;">Message:</h4>
      <p style="margin: 0; color: #FFF; line-height: 1.5;">${message}</p>
      ${
        eventDescription
          ? `<h4 style="margin: 16px 0 8px 0; color: #EADBBF;">Event Description:</h4><p style="margin: 0; color: #FFF; line-height: 1.5;">${eventDescription}</p>`
          : ''
      }
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #9CA3AF;">
      Log in to the <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/requests" style="color: #E5A93C;">EntryX Owner Portal</a> to review, approve, and authorize an organizer account.
    </p>
  </div>
</body>
</html>
  `;

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject: `[EntryX Request] New Event Creation Request from ${organizerName} (${organizationName})`,
      html,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return { success: true, id: response.data?.id };
  } catch (err: any) {
    console.error('[Admin Notification Email Error]:', err);
    throw new Error(err.message || 'Failed to dispatch owner notification email');
  }
}
