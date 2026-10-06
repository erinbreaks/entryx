import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyTicketToken } from '@/lib/crypto';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to scan tickets' }, { status: 401 });
    }

    const body = await request.json();
    const { token, eventId } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({
        result: 'INVALID_TICKET',
        message: 'Invalid ticket token: token is missing or malformed',
        status: 'invalid',
      }, { status: 400 });
    }

    // STEP 1 & STEP 2: Verify token format and cryptographic HMAC signature
    const verification = verifyTicketToken(token);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json({
        result: 'INVALID_TICKET',
        message: verification.error || 'Cryptographic verification failed: Invalid ticket signature',
        status: 'invalid',
      }, { status: 400 });
    }

    const { ticketId, eventId: tokenEventId, attendeeEmail } = verification.payload;

    // STEP 3: Find ticket in database
    const ticket = await db.getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json({
        result: 'INVALID_TICKET',
        message: 'Ticket not found in database records',
        status: 'invalid',
      }, { status: 404 });
    }

    // Verify event matches
    const targetEventId = eventId || tokenEventId;
    if (ticket.event_id !== targetEventId) {
      return NextResponse.json({
        result: 'INVALID_TICKET',
        message: 'Ticket is issued for a different event',
        status: 'invalid',
      }, { status: 400 });
    }

    // STEP 4: Check event ownership / organizer authorization
    const isAuthorized = await db.isOrganizerAuthorizedForEvent(user.id, targetEventId);
    if (!isAuthorized && user.role !== 'owner') {
      return NextResponse.json({
        result: 'UNAUTHORIZED',
        message: 'Forbidden: You are not authorized to scan tickets for this event',
        status: 'forbidden',
      }, { status: 403 });
    }

    // Fetch attendee & event details for response
    const [registration, event] = await Promise.all([
      db.getRegistrationByEventAndEmail(targetEventId, attendeeEmail),
      db.getEventById(targetEventId),
    ]);

    const attendeeName = registration?.full_name || 'Attendee';
    const studentId = registration?.student_id || '';

    // STEP 5: Check ticket status
    if (ticket.status === 'checked_in') {
      // Find original check-in record
      const checkInRecord = await db.getCheckInByTicketId(ticket.id);
      const originalCheckedInAt = checkInRecord?.checked_in_at || ticket.updated_at || ticket.created_at;

      return NextResponse.json({
        result: 'ALREADY_USED',
        message: 'Ticket has already been used for entry',
        status: 'already_used',
        attendeeName,
        studentId,
        ticketNumber: ticket.ticket_number,
        firstCheckedInAt: originalCheckedInAt,
        eventName: event?.name || 'Event',
      });
    }

    if (ticket.status === 'cancelled') {
      return NextResponse.json({
        result: 'INVALID_TICKET',
        message: 'Ticket has been cancelled',
        status: 'cancelled',
      }, { status: 400 });
    }

    // TICKET IS UNUSED & VALID: Perform Check-in
    const serverTimestamp = new Date().toISOString();
    
    // Update ticket status
    await db.updateTicketStatus(ticket.id, 'checked_in');

    // Store check-in record
    await db.recordCheckIn(ticket.id, targetEventId, user.id);

    return NextResponse.json({
      result: 'CHECKED_IN',
      message: 'Check-in successful. Entry granted.',
      status: 'checked_in',
      attendeeName,
      studentId,
      ticketNumber: ticket.ticket_number,
      checkedInAt: serverTimestamp,
      eventName: event?.name || 'Event',
    });

  } catch (err: any) {
    console.error('Error during ticket verification:', err);
    return NextResponse.json({
      result: 'ERROR',
      message: err.message || 'Internal server error during verification',
      status: 'error',
    }, { status: 500 });
  }
}
