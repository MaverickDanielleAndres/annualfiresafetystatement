/**
 * AFSS — secure anonymous session handling.
 *
 * Strategy:
 *   * Generate a high-entropy random token (32 bytes hex).
 *   * Store ONLY the SHA-256 hash of that token in the database
 *     (column: afss.quote_sessions.session_token_hash).
 *   * Place the raw token in an HttpOnly Secure SameSite=Lax cookie.
 *   * Lookup by cookie → hash → DB row.
 *
 * This means:
 *   * Database breach does NOT expose active session tokens.
 *   * Browser JS cannot read the cookie (HttpOnly).
 *   * Cross-site requests cannot ride the cookie (SameSite=Lax).
 *   * Network observers cannot reuse the cookie without TLS (Secure in prod).
 */

import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME =
  process.env.AFSS_SESSION_COOKIE_NAME || 'afss_session';
const MAX_AGE = Number(
  process.env.AFSS_SESSION_COOKIE_MAX_AGE_SECONDS || 60 * 60 * 24 * 30
); // 30 days
const SECURE =
  (process.env.AFSS_SESSION_COOKIE_SECURE || 'false').toLowerCase() ===
  'true';

export function generateSessionToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = randomBytes(32).toString('hex'); // 64 chars
  const tokenHash = hashSessionToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashSessionToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

export async function writeSessionCookie(rawToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function readSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_NAME);
  return v?.value ?? null;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}