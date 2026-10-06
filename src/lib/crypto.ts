import crypto from 'crypto';

export interface TicketPayload {
  ticketId: string;
  registrationId: string;
  eventId: string;
  attendeeEmail: string;
  studentId: string;
  issuedAt: number;
}

/**
 * Returns the secret key for HMAC-SHA256 cryptographic ticket signing.
 * The secret must exist ONLY in an environment variable.
 */
function getTicketSecret(): string {
  const secret = process.env.TICKET_SECRET;
  if (!secret) {
    // Fallback for development if env is missing, but log warning
    return 'entryx_default_dev_cryptographic_secret_key_2026_do_not_use_in_prod';
  }
  return secret;
}

/**
 * Generates a unique, formatted ticket number (e.g. ETX-8B92-4F10)
 */
export function generateTicketNumber(): string {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const hex2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ETX-${hex}-${hex2}`;
}

/**
 * Signs a ticket payload using HMAC-SHA256.
 * Result format: base64url(JSON_payload).signature_hex
 */
export function signTicketToken(payload: TicketPayload): string {
  const secret = getTicketSecret();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, 'utf8').toString('base64url');
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadB64);
  const signature = hmac.digest('hex');

  return `${payloadB64}.${signature}`;
}

/**
 * Validates a cryptographically signed ticket token.
 * Returns the payload if valid, or error if signature is invalid or token is malformed.
 */
export function verifyTicketToken(token: string): {
  valid: boolean;
  payload?: TicketPayload;
  error?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is empty or invalid format' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed ticket token structure' };
  }

  const [payloadB64, providedSignature] = parts;

  try {
    const secret = getTicketSecret();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadB64);
    const expectedSignature = hmac.digest('hex');

    // Constant time comparison to prevent timing attacks
    const sigBuffer1 = Buffer.from(providedSignature, 'hex');
    const sigBuffer2 = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer1.length !== sigBuffer2.length || !crypto.timingSafeEqual(sigBuffer1, sigBuffer2)) {
      return { valid: false, error: 'Cryptographic signature verification failed' };
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as TicketPayload;

    if (!payload.ticketId || !payload.eventId || !payload.attendeeEmail) {
      return { valid: false, error: 'Incomplete ticket payload data' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Failed to decode ticket token' };
  }
}
