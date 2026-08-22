/**
 * AFSS — Google Maps JavaScript loader (browser-only, Street View only).
 *
 * The active AFSS customer flow uses Google Maps JS API for ONE
 * thing only: rendering the building-confirmation `StreetViewPanorama`
 * widget. Address autocomplete and reverse geocoding are handled by
 * the Geoapify server-side proxies (`/api/afss/quote/address-search`
 * and `/api/afss/quote/address-resolve`). The `places` and `geocoding`
 * libraries are intentionally NOT loaded.
 *
 * Uses the CURRENT (2026) Google-recommended strategy:
 *   * A single <script src="...?loading=async&libraries=streetView,geometry">
 *     is injected exactly once per page.
 *   * After the script resolves, we call `google.maps.importLibrary()`
 *     for the libraries we actually need. The loader caches the
 *     library promises so duplicate calls reuse the same instance.
 *
 * Why the script tag approach (not the @googlemaps/js-api-loader
 * npm package)?
 *   * No additional dependency.
 *   * The `loading=async` query parameter is the official Google
 *     defer-loading strategy. It avoids blocking first paint and
 *     matches what AGENTS.md / Google Cloud docs recommend in 2026.
 *
 * Visibility: the API key is INTENTIONALLY exposed to the browser.
 * Google Cloud API-key restrictions (HTTP referrer + Maps JS API) are
 * the security boundary. The Places and Geocoding APIs are no longer
 * required by this code.
 */

const GOOGLE_MAPS_SCRIPT_ID = 'afss-google-maps-js';

export interface GoogleMapsLoaderOptions {
  apiKey: string;
  language?: string;
  region?: string;
  /**
   * Libraries to pre-load. The AFSS flow uses ONLY `streetView` and
   * `geometry`. `places` and `geocoding` were removed when the active
   * address flow was migrated to Geoapify — do not re-add them here.
   */
  libraries?: Array<'streetView' | 'geometry' | 'maps' | 'core'>;
}

export type GoogleMapsNamespace = typeof globalThis.google.maps;

type GoogleMapsScriptState =
  | { kind: 'idle' }
  | { kind: 'loading'; promise: Promise<GoogleMapsNamespace> }
  | { kind: 'ready'; google: GoogleMapsNamespace };

let scriptState: GoogleMapsScriptState = { kind: 'idle' };
const libraryCache = new Map<string, Promise<unknown>>();

/**
 * Returns true if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured.
 * Safe to call in any environment.
 */
export function isGoogleMapsConfigured(): boolean {
  const key =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
    '';
  return !!key && key.length >= 12;
}

/**
 * Loads the Google Maps JavaScript API (if not already loaded) and
 * returns the live `google.maps` namespace. Concurrent callers share
 * the same script-injection promise. The function is idempotent.
 */
export function loadGoogleMaps(
  opts: GoogleMapsLoaderOptions
): Promise<GoogleMapsNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser.'));
  }
  if (!opts.apiKey) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.'));
  }

  if (scriptState.kind === 'ready') {
    return Promise.resolve(scriptState.google);
  }
  if (scriptState.kind === 'loading') {
    return scriptState.promise;
  }

  const libraries = (opts.libraries ?? ['streetView', 'geometry']).join(
    ','
  );

  const existing = document.getElementById(
    GOOGLE_MAPS_SCRIPT_ID
  ) as HTMLScriptElement | null;
  if (existing) {
    // Another call already injected the script. Wait for it.
    const promise = waitForGlobal('google.maps', 15_000).then(
      () => window.google.maps
    );
    scriptState = { kind: 'loading', promise };
    return promise;
  }

  const src = new URL('https://maps.googleapis.com/maps/api/js');
  src.searchParams.set('key', opts.apiKey);
  src.searchParams.set('loading', 'async');
  src.searchParams.set('libraries', libraries);
  src.searchParams.set('language', opts.language ?? 'en-AU');
  src.searchParams.set('region', opts.region ?? 'AU');
  // v=weekly is Google's current default; allow override silently.
  src.searchParams.set('v', 'weekly');

  const promise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = src.toString();
    script.onerror = () => {
      scriptState = { kind: 'idle' };
      reject(new Error('Failed to load Google Maps JavaScript API.'));
    };
    // The script defines `google` once it finishes. We poll briefly
    // because the onload hook is not always reliable with the async
    // loader. The loader guarantees a 10s timeout internally.
    const handleLoaded = () => {
      waitForGlobal('google.maps', 15_000)
        .then(() => {
          if (!window.google) {
            scriptState = { kind: 'idle' };
            reject(new Error('Google Maps loaded but no global was found.'));
            return;
          }
          scriptState = { kind: 'ready', google: window.google.maps };
          resolve(window.google.maps);
        })
        .catch((err) => {
          scriptState = { kind: 'idle' };
          reject(err);
        });
    };
    script.addEventListener('load', handleLoaded);
    document.head.appendChild(script);
  });

  scriptState = { kind: 'loading', promise };
  return promise;
}

/**
 * Imports a Google Maps library by name. Subsequent calls reuse the
 * cached promise (no duplicate network requests).
 */
export async function importGoogleLibrary<K extends LibraryName>(
  google: GoogleMapsNamespace,
  name: K
): Promise<google.maps.LibraryMap[K]> {
  const cached = libraryCache.get(name);
  if (cached) return cached as google.maps.LibraryMap[K];
  const p = (google.importLibrary(name) as Promise<google.maps.LibraryMap[K]>);
  libraryCache.set(name, p);
  return p;
}

type LibraryName = keyof google.maps.LibraryMap;

/**
 * Returns the live NEXT_PUBLIC_GOOGLE_MAPS_API_KEY from the browser.
 * Returns an empty string if missing (callers should check first).
 */
export function getBrowserApiKey(): string {
  if (typeof window === 'undefined') return '';
  const proc = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (proc && typeof proc === 'string') return proc;
  // Next.js inlines NEXT_PUBLIC_* into the bundle at build time.
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
}

function waitForGlobal(path: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const parts = path.split('.');
      let cur: any = window;
      for (const p of parts) {
        if (cur == null) {
          cur = undefined;
          break;
        }
        cur = cur[p];
      }
      if (cur) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${path}`));
        return;
      }
      window.setTimeout(check, 80);
    };
    check();
  });
}
