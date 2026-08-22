'use client';

import { useEffect, useRef, useState } from 'react';
import { subtleLink, primaryButton } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';

interface Props {
  onUploaded: () => void;
  onFallback: () => void;
  onBack?: () => void;
}

interface UploadedFile {
  document_id: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}

const ACCEPT_LIST = '.pdf,.jpg,.jpeg,.png,.tif,.tiff';
const MAX_SIZE_MB = 50;

const HUMAN_MIME: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/tiff': 'TIFF',
};

function extensionFromMime(filename: string, mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/tiff': 'tif',
  };
  if (mime in map) return map[mime];
  const m = filename.toLowerCase().match(/\.([a-z0-9]{2,5})$/);
  return m ? m[1] : 'bin';
}

function readableSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function clientValidate(file: File): string | null {
  if (!file) return 'No file received.';
  if (file.size === 0) return 'The file appears to be empty.';
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
  if (!allowed.includes(file.type))
    return 'Unsupported file type. Please upload PDF, JPG, PNG or TIFF.';
  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return `File is larger than ${MAX_SIZE_MB} MB.`;
  return null;
}

/**
 * Step 4 — Upload your AFSS.
 *
 * Drag-and-drop OR file picker. Server-side validated again at
 * the /document-upload route (MIME, size, magic bytes). The
 * component supports replace and remove flows. Each successful
 * upload calls a custom toast and updates a "current file" panel.
 *
 * "I CAN'T FIND MY AFSS →" preserved path that does not delete
 * previous progress.
 */
export default function DocumentStep({ onUploaded, onFallback, onBack }: Props) {
  const { push } = useToaster();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progressPct, setProgressPct] = useState<number | null>(null);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragDepthRef = useRef(0);

  // Pull existing file from the server on mount (handles back-nav
  // and refresh).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await api.get<{ session: any }>('/api/afss/quote/status');
      if (cancelled) return;
      // Pull existing document from a dedicated endpoint via status.
      const ds = await api.get<{ document: UploadedFile | null }>(
        '/api/afss/quote/current-document'
      );
      if (cancelled) return;
      if (ds.ok && ds.data.document) setUploaded(ds.data.document);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function upload(f: File) {
    setError(null);
    setUploaded(null);

    const clientErr = clientValidate(f);
    if (clientErr) {
      setError(clientErr);
      push({ kind: 'error', title: 'Unsupported file', text: clientErr });
      return;
    }

    const extension = extensionFromMime(f.name, f.type);
    const fd = new FormData();
    fd.append('file', f, f.name);
    fd.append('document_type', 'afss');
    fd.append('document_extension', extension);

    setBusy(true);
    setProgressPct(0);

    // Use XHR to get upload progress events. fetch() streams can't.
    const result = await new Promise<{ ok: boolean; status: number; data: any }>(
      (resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgressPct(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener('loadend', () => {
          let data: any = null;
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = null;
          }
          resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
        });
        xhr.addEventListener('error', () => {
          resolve({ ok: false, status: 0, data: null });
        });
        xhr.open('POST', '/api/afss/quote/document-upload');
        xhr.send(fd);
      }
    );
    setBusy(false);
    setProgressPct(null);

    if (!result.ok) {
      const message =
        (result.data && typeof result.data.error === 'string'
          ? result.data.error
          : 'Upload failed. Please try again.');
      setError(message);
      push({ kind: 'error', title: 'Upload failed', text: message });
      return;
    }
    const uploadedRow: UploadedFile = {
      document_id: String(result.data?.document_id ?? ''),
      filename: f.name,
      size_bytes: f.size,
      mime_type: f.type,
      uploaded_at: new Date().toISOString(),
    };
    setUploaded(uploadedRow);
    push({
      kind: 'success',
      title: 'Upload complete',
      text: 'AFSS uploaded securely.',
    });
    onUploaded();
  }

  async function removeCurrent() {
    if (!uploaded) return;
    setBusy(true);
    const r = await api.post<{ ok: boolean }>(
      '/api/afss/quote/current-document-delete'
    );
    setBusy(false);
    if (r.ok) {
      setUploaded(null);
      push({
        kind: 'info',
        title: 'File removed',
        text: 'You can upload a different file now.',
      });
    } else {
      push({ kind: 'error', title: 'Remove failed', text: r.error });
    }
  }

  async function reportFallback() {
    setBusy(true);
    const res = await api.post<{ ok: boolean }>(
      '/api/afss/quote/document-fallback'
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      push({ kind: 'error', title: 'Could not save', text: res.error });
      return;
    }
    push({ kind: 'info', text: 'No worries — we can work with what you have.' });
    onFallback();
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragDepthRef.current++;
    setDragOver(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragOver(false);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragDepthRef.current = 0;
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Upload your AFSS
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        PDF, JPG, PNG or TIFF. Maximum {MAX_SIZE_MB}&nbsp;MB.
      </p>

      {!uploaded && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!busy && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={
            'mb-4 flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1c4d9c]/40 ' +
            (dragOver
              ? 'border-[#1c4d9c] bg-[#1c4d9c]/5 text-[#1c4d9c]'
              : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400')
          }
          aria-label="Drag and drop your AFSS here, or browse for a file"
        >
          <div className="flex flex-col items-center gap-1">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-base font-semibold uppercase tracking-wide">
              Drag &amp; drop your AFSS here
            </div>
            <div className="text-xs text-gray-500">or</div>
            <div
              className="rounded-md bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white"
            >
              Browse files
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_LIST}
            className="sr-only"
            aria-hidden
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f) void upload(f);
              // Reset input so picking the same file twice still fires.
              e.currentTarget.value = '';
            }}
          />
        </div>
      )}

      {busy && (
        <div className="mb-4 rounded-xl border border-[#1c4d9c]/30 bg-[#1c4d9c]/5 p-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-gray-700">
            <span>Uploading your AFSS…</span>
            <span className="font-mono">{progressPct ?? 0}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white">
            <div
              className="h-full bg-[#1c4d9c] transition-all"
              style={{ width: `${progressPct ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {uploaded && (
        <div className="mb-4 rounded-xl border border-[#1c4d9c]/30 bg-[#1c4d9c]/5 p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1c4d9c]/15 text-[#1c4d9c]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-black">
                {uploaded.filename}
              </div>
              <div className="mt-0.5 text-xs text-gray-600">
                {HUMAN_MIME[uploaded.mime_type] ?? uploaded.mime_type} ·{' '}
                {readableSize(uploaded.size_bytes)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex-1 rounded-md border border-[#1c4d9c]/30 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#1c4d9c] hover:bg-[#1c4d9c]/10"
            >
              Replace file
            </button>
            <button
              type="button"
              onClick={removeCurrent}
              disabled={busy}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50"
            >
              Remove
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_LIST}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f) void upload(f);
              e.currentTarget.value = '';
            }}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="pt-4 flex w-full items-center gap-4 sm:gap-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className={subtleLink + ' flex-shrink-0'}
          >
            ← Back
          </button>
        )}

        {uploaded ? (
          <button
            type="button"
            onClick={() => onUploaded()}
            disabled={busy}
            className={primaryButton + ' flex-1 !mx-0'}
            style={{ background: "linear-gradient(to right, #0b1d36, #1c4d9c)", color: "#ffffff" }}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={reportFallback}
            disabled={busy}
            className={subtleLink + ' flex-shrink-0'}
          >
            I can&apos;t find my AFSS →
          </button>
        )}
      </div>
    </div>
  );
}
