import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromRequest, hashPassword } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, createOrganizerAccount, organizerPassword } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be either approved or rejected' }, { status: 400 });
    }

    // Update request status
    const updatedRequest = await db.updateEventRequestStatus(id, status, user.id);
    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    let createdOrganizer = null;

    // If approved and requested to provision organizer account
    if (status === 'approved' && createOrganizerAccount) {
      const existingUser = await db.getProfileByEmail(updatedRequest.email);
      if (existingUser) {
        createdOrganizer = existingUser;
      } else {
        const passwordToUse = organizerPassword || 'EntryX@' + Math.random().toString(36).slice(-8);
        const password_hash = await hashPassword(passwordToUse);
        
        createdOrganizer = await db.createProfile({
          name: updatedRequest.full_name,
          email: updatedRequest.email,
          password_hash,
          role: 'organizer',
          phone: updatedRequest.phone,
        });

        (createdOrganizer as any).temporaryPassword = passwordToUse;
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      organizer: createdOrganizer,
    });
  } catch (err: any) {
    console.error('Error updating request:', err);
    return NextResponse.json({ error: err.message || 'Failed to update request' }, { status: 500 });
  }
}
