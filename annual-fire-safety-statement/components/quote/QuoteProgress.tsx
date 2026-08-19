'use client';

interface QuoteProgressProps {
  current: number;
  total?: number;
}

const STEP_LABELS = ['You', 'Building', 'Confirm', 'AFSS', 'Due', 'Result'];

export default function QuoteProgress({ current, total = 6 }: QuoteProgressProps) {
  return (
    <div className="border-b border-gray-100 px-5 py-3 sm:px-8">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-gray-400">
        <span>Step {current} of {total}</span>
        <span>AFSS Instant Quote</span>
      </div>
      <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div key={label} className="flex flex-1 flex-col gap-1">
              <div
                className={
                  'h-1 w-full rounded-full transition-colors ' +
                  (done
                    ? 'bg-[#fb5614]'
                    : active
                      ? 'bg-[#fb5614]/60'
                      : 'bg-gray-200')
                }
              />
              <div
                className={
                  'text-[10px] font-semibold ' +
                  (active || done ? 'text-[#fb5614]' : 'text-gray-400')
                }
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}