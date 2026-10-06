import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTicketNumber, signTicketToken } from '@/lib/crypto';
import { generateQRCodeDataUrl } from '@/lib/qr';
import { sendTicketConfirmationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, fullName, email, studentId } = body;

    // 1. Validation
    if (!eventId || !fullName || !email || !studentId) {
      return NextResponse.json(
        { error: 'Event ID, Full Name, Email, and Student ID are all required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 2. Perform atomic registration & capacity verification
    const { registration, event } = await db.registerStudent({
      eventId,
      fullName,
      email,
      studentId,
    });

    // 3. Generate ticket metadata & cryptographic token
    const ticketId = crypto.randomUUID();
    const ticketNumber = generateTicketNumber();
    const issuedAt = Date.now();

    const signedToken = signTicketToken({
      ticketId,
      registrationId: registration.id,
      eventId: event.id,
      attendeeEmail: registration.email,
      studentId: registration.student_id,
      issuedAt,
    });

    // 4. Generate QR code containing the signed token
    const qrDataUrl = await generateQRCodeDataUrl(signedToken);

    // 5. Store ticket record in database
    const ticket = await db.createTicket({
      id: ticketId,
      registration_id: registration.id,
      event_id: event.id,
      ticket_number: ticketNumber,
      signed_token: signedToken,
      qr_data_url: qrDataUrl,
    });

    // 6. Send real transactional email via Resend
    let emailSent = false;
    let emailWarning: string | undefined;

    try {
      if (process.env.RESEND_API_KEY) {
        await sendTicketConfirmationEmail({
          to: registration.email,
          attendeeName: registration.full_name,
          studentId: registration.student_id,
          eventName: event.name,
          eventDate: event.event_date,
          eventTime: event.start_time,
          venue: event.venue,
          ticketPrice: Number(event.ticket_price) || 0,
          ticketNumber: ticket.ticket_number,
          ticketToken: ticket.signed_token,
          qrDataUrl,
        });
        emailSent = true;
      } else {
        emailWarning = 'RESEND_API_KEY is not configured in server environment. Real ticket email could not be dispatched.';
        console.warn(`[Warning]: ${emailWarning}`);
      }
    } catch (emailErr: any) {
      console.error('[Ticket Email Delivery Error]:', emailErr);
      emailWarning = emailErr.message || 'Failed to dispatch ticket confirmation email';
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Your ticket has been issued.',
      registration: {
        id: registration.id,
        fullName: registration.full_name,
        email: registration.email,
        studentId: registration.student_id,
      },
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        signedToken: ticket.signed_token,
        qrDataUrl: ticket.qr_data_url,
        status: ticket.status,
      },
      event: {
        id: event.id,
        name: event.name,
        eventDate: event.event_date,
        startTime: event.start_time,
        venue: event.venue,
        ticketPrice: event.ticket_price,
      },
      emailSent,
      warning: emailWarning,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Registration processing error:', err);
    const message = err.message || 'An error occurred during registration';
    const status = message.includes('Capacity Reached')
      ? 409
      : message.includes('already registered')
      ? 400
      : message.includes('not found')
      ? 404
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
