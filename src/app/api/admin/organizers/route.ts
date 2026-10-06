import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromRequest, hashPassword } from '@/lib/auth';

// GET: List all organizers
export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const organizers = await db.listOrganizers();
    const sanitized = organizers.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      role: o.role,
      created_at: o.created_at,
    }));

    return NextResponse.json({ organizers: sanitized });
  } catch (err: any) {
    console.error('Error fetching organizers:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch organizers' }, { status: 500 });
  }
}

// POST: Create a new organizer account
export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existing = await db.getProfileByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const newOrganizer = await db.createProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role: 'organizer',
      phone: phone ? phone.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Organizer account created successfully.',
      organizer: {
        id: newOrganizer.id,
        name: newOrganizer.name,
        email: newOrganizer.email,
        phone: newOrganizer.phone,
        role: newOrganizer.role,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating organizer:', err);
    return NextResponse.json({ error: err.message || 'Failed to create organizer' }, { status: 500 });
  }
}
