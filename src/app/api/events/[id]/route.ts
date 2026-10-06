import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

// GET /api/events/[id] - Get event details + dynamic statistics
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const event = await db.getEventById(id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err: any) {
    console.error('Error fetching event:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch event' }, { status: 500 });
  }
}

// PATCH /api/events/[id] - Update event (Owner or authorized Organizer)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const isAuthorized = await db.isOrganizerAuthorizedForEvent(user.id, id);
    if (!isAuthorized && user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden. You cannot modify this event.' }, { status: 403 });
    }

    const body = await request.json();
    const allowedUpdates: any = {};

    if (body.name !== undefined) allowedUpdates.name = body.name;
    if (body.description !== undefined) allowedUpdates.description = body.description;
    if (body.ticketPrice !== undefined) allowedUpdates.ticket_price = Number(body.ticketPrice);
    if (body.maxCapacity !== undefined) allowedUpdates.max_capacity = Number(body.maxCapacity);
    if (body.eventDate !== undefined) allowedUpdates.event_date = body.eventDate;
    if (body.startTime !== undefined) allowedUpdates.start_time = body.startTime;
    if (body.endTime !== undefined) allowedUpdates.end_time = body.endTime;
    if (body.venue !== undefined) allowedUpdates.venue = body.venue;
    if (body.imageUrl !== undefined) allowedUpdates.image_url = body.imageUrl;
    if (body.status !== undefined) allowedUpdates.status = body.status;

    const updated = await db.updateEvent(id, allowedUpdates);
    return NextResponse.json({ success: true, event: updated });
  } catch (err: any) {
    console.error('Error updating event:', err);
    return NextResponse.json({ error: err.message || 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Cancel or remove event
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const isAuthorized = await db.isOrganizerAuthorizedForEvent(user.id, id);
    if (!isAuthorized && user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark as cancelled rather than destructive delete to preserve data integrity
    const cancelled = await db.updateEvent(id, { status: 'cancelled' });
    return NextResponse.json({ success: true, message: 'Event marked as cancelled', event: cancelled });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to cancel event' }, { status: 500 });
  }
}
