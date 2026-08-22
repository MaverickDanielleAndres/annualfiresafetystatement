'use client';

interface QuoteProgressProps {
  current: number;
  total?: number;
}

const STEP_LABELS = ['You', 'Building', 'Confirm', 'AFSS', 'Due', 'Result'];

export default function QuoteProgress({ current, total = 6 }: QuoteProgressProps) {
  return (
    <div className="px-5 pt-6 pb-2 sm:px-8 md:px-10 md:pt-10">
      <div className="mx-auto max-w-md">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-600">
          Step {current} of {total}
        </p>
        <div className="mb-2 flex items-center gap-1.5 max-w-[200px]">
          {Array.from({ length: total }).map((_, i) => {
            const n = i + 1;
            const activeOrDone = n <= current;
            return (
              <div
                key={n}
                className={
                  'h-1 flex-1 rounded-full ' +
                  (activeOrDone ? 'bg-red-600' : 'bg-gray-200')
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
