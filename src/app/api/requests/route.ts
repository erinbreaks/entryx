import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEventRequestNotification } from '@/lib/email';
import { getAuthUserFromRequest } from '@/lib/auth';

// GET: List all event creation requests (Owner only)
export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const requests = await db.listEventRequests();
    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error('Error fetching event requests:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST: Public event creation request submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, organizationName, message, eventDescription } = body;

    // Validate inputs
    if (!fullName || !email || !phone || !organizationName || !message) {
      return NextResponse.json(
        { error: 'Please provide full name, email, phone number, organization name, and message.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Save request in real database
    const newRequest = await db.createEventRequest({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organization_name: organizationName.trim(),
      message: message.trim(),
      event_description: eventDescription ? eventDescription.trim() : undefined,
    });

    // Send real transactional email notification to owner
    let emailSent = false;
    let emailWarning: string | undefined;

    try {
      if (process.env.RESEND_API_KEY) {
        await sendEventRequestNotification({
          organizerName: fullName,
          organizerEmail: email,
          phone,
          organizationName,
          message,
          eventDescription,
          requestId: newRequest.id,
        });
        emailSent = true;
      } else {
        emailWarning = 'RESEND_API_KEY is not configured in server environment. Email notification was not sent to owner.';
        console.warn(`[Warning]: ${emailWarning}`);
      }
    } catch (emailErr: any) {
      console.error('[Event Request Email Error]:', emailErr);
      emailWarning = emailErr.message || 'Failed to dispatch email to owner';
    }

    return NextResponse.json({
      success: true,
      message: 'Your event creation request has been submitted successfully.',
      requestId: newRequest.id,
      emailSent,
      warning: emailWarning,
    });
  } catch (err: any) {
    console.error('Error processing event request:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit event request' }, { status: 500 });
  }
}
