'use client';

/**
 * AFSS — button to launch the Instant Quote modal.
 *
 * Drop this component anywhere on the site. Renders a primary CTA
 * matching the site's brand styling and opens the modal on click.
 */

import { useState } from 'react';
import InstantQuoteModal from './InstantQuoteModal';

interface Props {
  className?: string;
  label?: string;
}

export default function GetInstantQuoteButton({
  className = '',
  label = 'Get an instant quote',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          'inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#0b1d36] to-[#1c4d9c] px-6 py-4 text-base font-bold uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ' +
          className
        }
      >
        {label} →
      </button>
      <InstantQuoteModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
