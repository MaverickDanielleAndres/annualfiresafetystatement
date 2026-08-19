'use client';

import { useRef, useState } from 'react';
import { primaryButton } from './ContactStep';

interface Props {
  onUploaded: () => void;
  onFallback: () => void;
}

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.tif,.tiff,application/pdf,image/jpeg,image/png,image/tiff';

export default function DocumentStep({ onUploaded, onFallback }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function upload(f: File) {
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('document_type', 'afss');
      const res = await fetch('/api/afss/quote/document-upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload failed.');
        setSubmitting(false);
        return;
      }
      onUploaded();
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onPick(f: File | null) {
    if (!f) return;
    setFile(f);
    await upload(f);
  }

  async function reportFallback() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/afss/quote/document-fallback', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not record.');
        setSubmitting(false);
        return;
      }
      onFallback();
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
        Step 4 of 6
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Upload your AFSS
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        PDF, JPG, PNG or TIFF. Max 50&nbsp;MB.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void onPick(f);
        }}
        className={
          'mb-4 flex h-44 w-full items-center justify-center rounded-xl border-2 border-dashed text-center text-sm transition-colors ' +
          (dragOver
            ? 'border-[#fb5614] bg-[#fb5614]/5 text-[#fb5614]'
            : 'border-gray-300 bg-gray-50 text-gray-500')
        }
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        {file
          ? <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
          : <span>Tap to choose a file, or drop it here.</span>}
      </div>

      {submitting && (
        <div className="mb-4 text-center text-xs uppercase tracking-widest text-gray-400">
          Uploading…
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={reportFallback}
        className="w-full text-sm text-gray-500 underline-offset-4 hover:text-black hover:underline"
      >
        I can&apos;t find my AFSS →
      </button>
    </div>
  );
}