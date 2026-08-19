/**
 * AFSS — input validation.
 *
 * All inputs from the wizard are re-validated server-side. Client-side
 * validation is a UX nicety, never a security boundary.
 */

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accept AU mobiles with/without country code, with spaces, dashes, parens.
const AU_MOBILE_RE = /^(\+?61|0)[\s\-]?4\d{2}[\s\-]?\d{3}[\s\-]?\d{3}$/;
// Accept any AU mobile (incl. landline) within a reasonable range.
const AU_GENERAL_PHONE_RE = /^(\+?61|0)[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{0,4}$/;

export function normaliseEmail(s: string): string {
  return s.trim().toLowerCase();
}

export function normaliseAuMobile(s: string): string {
  // Strip all non-digits, then prepend 61 if missing country code.
  const digits = s.replace(/\D/g, '');
  if (digits.startsWith('61')) return digits;
  if (digits.startsWith('0')) return '61' + digits.slice(1);
  return '61' + digits;
}

export function validateFirstName(s: unknown): ValidationResult<string> {
  if (typeof s !== 'string')
    return { ok: false, error: 'First name is required.' };
  const trimmed = s.trim();
  if (trimmed.length < 1)
    return { ok: false, error: 'First name is required.' };
  if (trimmed.length > 100)
    return { ok: false, error: 'First name is too long.' };
  return { ok: true, value: trimmed };
}

export function validateEmail(s: unknown): ValidationResult<string> {
  if (typeof s !== 'string') return { ok: false, error: 'Email is required.' };
  const trimmed = s.trim();
  if (trimmed.length === 0) return { ok: false, error: 'Email is required.' };
  if (trimmed.length > 320)
    return { ok: false, error: 'Email is too long.' };
  if (!EMAIL_RE.test(trimmed))
    return { ok: false, error: 'Enter a valid email address.' };
  return { ok: true, value: normaliseEmail(trimmed) };
}

export function validateMobile(s: unknown): ValidationResult<string> {
  if (typeof s !== 'string') return { ok: false, error: 'Mobile is required.' };
  const trimmed = s.trim();
  if (trimmed.length === 0)
    return { ok: false, error: 'Mobile is required.' };
  // Loose match — common AU formats.
  if (trimmed.length < 8 || trimmed.length > 30)
    return { ok: false, error: 'Enter a valid Australian mobile number.' };
  if (!AU_GENERAL_PHONE_RE.test(trimmed) && !AU_MOBILE_RE.test(trimmed))
    return { ok: false, error: 'Enter a valid Australian mobile number.' };
  return { ok: true, value: normaliseAuMobile(trimmed) };
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export function validateAuState(s: unknown): ValidationResult<string | null> {
  if (s === null || s === undefined || s === '') return { ok: true, value: null };
  if (typeof s !== 'string') return { ok: false, error: 'Invalid state.' };
  const upper = s.trim().toUpperCase();
  if (!AU_STATES.includes(upper))
    return { ok: false, error: 'State must be an Australian state/territory.' };
  return { ok: true, value: upper };
}

export function validateAuPostcode(
  s: unknown
): ValidationResult<string | null> {
  if (s === null || s === undefined || s === '') return { ok: true, value: null };
  if (typeof s !== 'string') return { ok: false, error: 'Invalid postcode.' };
  const trimmed = s.trim();
  if (!/^\d{4}$/.test(trimmed))
    return { ok: false, error: 'Postcode must be 4 digits.' };
  return { ok: true, value: trimmed };
}

export interface AddressInput {
  address_line_1?: string | null;
  address_line_2?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  formatted_address?: string | null;
  google_place_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function validateAddress(
  input: unknown
): ValidationResult<AddressInput> {
  if (typeof input !== 'object' || input === null)
    return { ok: false, error: 'Invalid address.' };
  const a = input as Record<string, unknown>;

  // At minimum, we require a formatted address and either a
  // google_place_id OR an explicit address line. This prevents
  // users from typing arbitrary junk and getting it persisted.
  const formatted =
    typeof a.formatted_address === 'string'
      ? a.formatted_address.trim()
      : '';
  const addressLine1 =
    typeof a.address_line_1 === 'string' ? a.address_line_1.trim() : '';
  const placeId =
    typeof a.google_place_id === 'string' ? a.google_place_id.trim() : '';

  if (!formatted && !addressLine1)
    return {
      ok: false,
      error: 'Please select an address from the suggestions.',
    };
  if (!placeId && !formatted)
    return {
      ok: false,
      error: 'Please select an address from the suggestions.',
    };

  // Validate sub-fields if provided.
  const stateR = validateAuState(a.state);
  if (!stateR.ok) return stateR;
  const pcR = validateAuPostcode(a.postcode);
  if (!pcR.ok) return pcR;

  // Lat/lng range.
  let lat: number | null = null;
  let lng: number | null = null;
  if (typeof a.latitude === 'number') {
    if (a.latitude < -90 || a.latitude > 90)
      return { ok: false, error: 'Invalid latitude.' };
    lat = a.latitude;
  }
  if (typeof a.longitude === 'number') {
    if (a.longitude < -180 || a.longitude > 180)
      return { ok: false, error: 'Invalid longitude.' };
    lng = a.longitude;
  }

  return {
    ok: true,
    value: {
      address_line_1:
        typeof a.address_line_1 === 'string' ? a.address_line_1.trim() : null,
      address_line_2:
        typeof a.address_line_2 === 'string' ? a.address_line_2.trim() : null,
      suburb: typeof a.suburb === 'string' ? a.suburb.trim() : null,
      state: stateR.value,
      postcode: pcR.value,
      formatted_address: formatted || null,
      google_place_id: placeId || null,
      latitude: lat,
      longitude: lng,
    },
  };
}

export function validateDueDate(
  s: unknown
): ValidationResult<{ date: string | null; known: boolean }> {
  if (s === null || s === undefined || s === '') {
    return { ok: true, value: { date: null, known: false } };
  }
  if (typeof s !== 'string') return { ok: false, error: 'Invalid date.' };
  // Accept YYYY-MM-DD (HTML date input).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s))
    return { ok: false, error: 'Invalid date format.' };
  const d = new Date(s + 'T00:00:00Z');
  if (isNaN(d.getTime())) return { ok: false, error: 'Invalid date.' };
  // Reasonable sanity: not before 2020, not absurdly far in the future.
  const min = Date.UTC(2020, 0, 1);
  const max = Date.UTC(2100, 0, 1);
  const t = d.getTime();
  if (t < min || t > max) return { ok: false, error: 'Date out of range.' };
  return { ok: true, value: { date: s, known: true } };
}

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
]);

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MiB

export function validateUploadedFile(file: File): {
  ok: boolean;
  error?: string;
} {
  if (!file) return { ok: false, error: 'No file received.' };
  if (file.size <= 0) return { ok: false, error: 'File is empty.' };
  if (file.size > MAX_FILE_SIZE_BYTES)
    return { ok: false, error: 'File exceeds 50 MB limit.' };

  // Trust the browser-declared type only as a hint; we re-check the
  // declared MIME against the allowed list. (Real signature sniffing
  // could be added server-side in the future.)
  const declared = (file.type || '').toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(declared))
    return {
      ok: false,
      error: 'Unsupported file type. Please upload PDF, JPG, PNG or TIFF.',
    };
  return { ok: true };
}