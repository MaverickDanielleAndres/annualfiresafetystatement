/**
 * Minimal ambient type declarations for the Google Maps JavaScript
 * API global loaded at runtime via the script tag in lib/google/maps-loader.ts.
 *
 * We intentionally do NOT pull in the @types/google.maps package
 * (it is incomplete against the latest Places API (New) interfaces
 * and we only consume a small, well-defined surface). The fields
 * below are the minimal shape the AFSS wizard relies on.
 *
 * Keep this file in sync with the call sites in:
 *   - lib/google/places.ts
 *   - lib/google/geocoder.ts
 *   - lib/google/street-view.ts
 */

declare global {
  namespace google.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngLiteral {
      lat: number;
      lng: number;
    }

    namespace places {
      class AutocompleteSessionToken {
        constructor();
      }

      interface AutocompleteRequest {
        input: string;
        sessionToken?: AutocompleteSessionToken;
        includedRegionCodes?: string[];
        includedPrimaryTypes?: string[];
        language?: string;
        region?: string;
        locationBias?: LatLng | LatLngLiteral | { west: number; east: number; north: number; south: number };
        locationRestriction?: LatLng | LatLngLiteral | { west: number; east: number; north: number; south: number };
        origin?: LatLng | LatLngLiteral;
      }

      interface PlacePrediction {
        placeId: string;
        text: { toString(): string };
        mainText?: { toString(): string };
        secondaryText?: { toString(): string };
        toPlace(): Place;
      }

      interface AutocompleteSuggestion {
        placePrediction?: PlacePrediction;
      }

      class AutocompleteSuggestion {
        static fetchAutocompleteSuggestions(
          request: AutocompleteRequest
        ): Promise<{ suggestions: AutocompleteSuggestion[] }>;
      }

      interface AddressComponent {
        longText?: string;
        shortText?: string;
        long_name?: string;
        short_name?: string;
        types?: string[];
      }

      interface PlaceSelectEvent {
        placePrediction: PlacePrediction;
      }

      class Place {
        constructor(opts: { id: string });
        id?: string;
        formattedAddress?: string;
        displayName?: string;
        addressComponents?: AddressComponent[];
        location?: LatLng | { lat: number; lng: number };
        fetchFields(opts: { fields: string[] }): Promise<void>;
        addListener(event: string, handler: (...args: any[]) => void): any;
      }
    }

    namespace geometry {
      namespace spherical {
        function computeHeading(from: LatLng, to: LatLng): number;
      }
    }

    const importLibrary: <K extends keyof LibraryMap>(name: K) => Promise<LibraryMap[K]>;

    interface LibraryMap {
      core: any;
      maps: any;
      maps3d: any;
      places: any;
      geocoding: any;
      routes: any;
      marker: any;
      geometry: any;
      elevation: any;
      streetView: any;
      journeySharing: any;
      visualization: any;
      airQuality: any;
      addressValidation: any;
      drawing: any;
    }
  }

  // eslint-disable-next-line no-var
  var google: typeof google.maps;
}

export {};
