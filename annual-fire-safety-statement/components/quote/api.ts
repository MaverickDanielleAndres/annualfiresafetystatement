'use client';

/**
 * AFSS — tiny client-side fetch wrapper.
 *
 * Centralises:
 *   * cookies/auth forwarding
 *   * error normalisation
 *   * JSON handling
 *
 * Returns a discriminated union { ok, data, error } so callers
 * can branch cleanly without try/catch noise.
 */

export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: string;
  status: number;
}
export type ApiResult<T> = ApiOk<T> | ApiErr;

async function call<T>(
  url: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body && !(init.body instanceof FormData)
          ? { 'content-type': 'application/json' }
          : {}),
        ...(init.headers ?? {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof json?.error === 'string'
          ? json.error
          : `Request failed (${res.status})`;
      return { ok: false, error: message, status: res.status };
    }
    return { ok: true, data: json as T };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? 'Network error',
      status: 0,
    };
  }
}

export const api = {
  get: <T>(url: string) => call<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    call<T>(url, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    }),
  postForm: <T>(url: string, form: FormData) =>
    call<T>(url, { method: 'POST', body: form }),
};

export async function readJson(
  url: string
): Promise<{ ok: true; data: any } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json().catch(() => null);
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Network error' };
  }
}
