import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const owner = await db.getProfileByEmail(process.env.OWNER_EMAIL || 'erinbobin@gmail.com');
    return NextResponse.json({
      ownerExists: Boolean(owner),
      ownerEmail: process.env.OWNER_EMAIL || 'erinbobin@gmail.com',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if an owner already exists
    const existing = await db.getProfileByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const profile = await db.createProfile({
      name,
      email,
      password_hash,
      role: 'owner',
      phone: phone || process.env.OWNER_PHONE || '9446611885',
    });

    return NextResponse.json({
      success: true,
      message: 'Owner account created successfully',
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to setup owner' }, { status: 500 });
  }
}
