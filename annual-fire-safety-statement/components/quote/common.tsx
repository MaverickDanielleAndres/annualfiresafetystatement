'use client';

/**
 * AFSS — shared form primitives.
 *
 * Exported so every step uses identical input/button/field
 * styling. Switched from the previous ContactStep implementation
 * to keep one source of truth.
 */

import { clsx } from 'clsx';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] uppercase tracking-wider text-gray-400">
          {hint}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/40';

export const primaryButton = 'afss-primary-btn';

export const secondaryButton = clsx(
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold uppercase tracking-widest text-gray-700',
  'transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
);

export const subtleLink = 'text-xs uppercase tracking-widest text-gray-400 hover:text-black';
