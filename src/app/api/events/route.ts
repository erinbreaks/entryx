import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

// GET /api/events - List events (public / filtered)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const onlyWithImages = searchParams.get('onlyWithImages') === 'true';
    const organizerId = searchParams.get('organizerId') || undefined;

    const events = await db.listEvents({
      status,
      onlyWithImages,
      organizerId,
    });

    return NextResponse.json({ events });
  } catch (err: any) {
    console.error('Error listing events:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events - Create new event (Owner or Organizer)
export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      ticketPrice,
      maxCapacity,
      eventDate,
      startTime,
      endTime,
      venue,
      imageUrl,
      registrationDeadline,
      assignedOrganizerId,
    } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const capacityNum = Number(maxCapacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return NextResponse.json({ error: 'Maximum capacity must be a positive number' }, { status: 400 });
    }

    const priceNum = Number(ticketPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Ticket price must be zero or a positive amount' }, { status: 400 });
    }

    if (!eventDate || !startTime || !venue) {
      return NextResponse.json({ error: 'Event date, start time, and venue are required' }, { status: 400 });
    }

    const newEvent = await db.createEvent({
      name: name.trim(),
      description: description ? description.trim() : undefined,
      ticket_price: priceNum,
      max_capacity: capacityNum,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime || undefined,
      venue: venue.trim(),
      image_url: imageUrl ? imageUrl.trim() : undefined,
      registration_deadline: registrationDeadline || undefined,
      created_by: user.id,
      status: 'active',
    });

    // If created by organizer, assign organizer to event
    if (user.role === 'organizer') {
      await db.assignOrganizerToEvent(newEvent.id, user.id);
    } else if (user.role === 'owner' && assignedOrganizerId) {
      // Owner can assign a specific organizer
      await db.assignOrganizerToEvent(newEvent.id, assignedOrganizerId);
    }

    return NextResponse.json({
      success: true,
      event: newEvent,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating event:', err);
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}
