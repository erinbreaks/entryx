import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: eventId } = params;
    const isAuthorized = await db.isOrganizerAuthorizedForEvent(user.id, eventId);
    if (!isAuthorized && user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden. You cannot view attendees for this event.' }, { status: 403 });
    }

    const [registrations, checkIns] = await Promise.all([
      db.listRegistrationsForEvent(eventId),
      db.listCheckInsForEvent(eventId),
    ]);

    // Combine registrations with ticket and check-in status
    const checkInMap = new Map(checkIns.map((c) => [c.ticket_id, c.checked_in_at]));

    const attendees = await Promise.all(
      registrations.map(async (reg) => {
        const ticket = await db.getTicketByRegistrationId(reg.id);
        const checkedInAt = ticket ? checkInMap.get(ticket.id) : undefined;

        return {
          id: reg.id,
          fullName: reg.full_name,
          email: reg.email,
          studentId: reg.student_id,
          registeredAt: reg.created_at,
          ticketNumber: ticket?.ticket_number,
          ticketStatus: ticket?.status || 'valid',
          isCheckedIn: Boolean(checkedInAt || ticket?.status === 'checked_in'),
          checkedInAt: checkedInAt || null,
        };
      })
    );

    return NextResponse.json({ attendees });
  } catch (err: any) {
    console.error('Error fetching attendees:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch attendees' }, { status: 500 });
  }
}
