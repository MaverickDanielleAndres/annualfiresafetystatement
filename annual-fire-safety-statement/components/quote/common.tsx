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
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-black placeholder-gray-400 focus:border-[#fb5614] focus:outline-none focus:ring-2 focus:ring-[#fb5614]/40';

export const primaryButton = clsx(
  'afss-primary-btn mx-auto',
  'transition-all shadow-[0_8px_20px_rgba(251,86,20,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(251,86,20,0.4)] disabled:cursor-not-allowed disabled:opacity-60'
);

export const secondaryButton = clsx(
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-bold uppercase tracking-widest text-gray-700',
  'transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
);

export const subtleLink = 'text-xs uppercase tracking-widest text-gray-400 hover:text-black';
