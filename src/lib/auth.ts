import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, Profile } from './db';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'entryx_jwt_session_secret_key_2026_change_in_production';
const COOKIE_NAME = 'entryx_session';

export interface AuthSessionUser {
  id: string;
  email: string;
  role: 'owner' | 'organizer';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(user: AuthSessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySessionToken(token: string): { valid: boolean; user?: AuthSessionUser; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthSessionUser;
    return { valid: true, user: decoded };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

/**
 * Retrieves the currently logged-in user from cookies or Authorization header
 */
export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { valid, user } = verifySessionToken(token);
    if (!valid || !user) return null;

    const profile = await db.getProfileById(user.id);
    return profile;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to inspect Request headers/cookies directly in Route Handlers
 */
export async function getAuthUserFromRequest(request: Request): Promise<Profile | null> {
  try {
    let token: string | undefined;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Check Cookie header
    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) return null;

    const { valid, user } = verifySessionToken(token);
    if (!valid || !user) return null;

    return await db.getProfileById(user.id);
  } catch (err) {
    return null;
  }
}
