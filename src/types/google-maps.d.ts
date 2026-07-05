declare namespace google.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    extend(latlng: LatLng): void;
  }

  class Map {
    constructor(el: HTMLElement, opts: Record<string, unknown>);
    setCenter(latlng: LatLng): void;
    panTo(latlng: LatLng): void;
    getCenter(): LatLng | null;
    fitBounds(bounds: LatLngBounds): void;
    addListener(
      event: string,
      handler: (event: { latLng?: LatLng | null }) => void,
    ): MapsEventListener;
  }

  class Marker {
    constructor(opts: Record<string, unknown>);
    setPosition(latlng: LatLng): void;
    getPosition(): LatLng | null;
    addListener(event: string, handler: () => void): MapsEventListener;
  }

  class Circle {
    constructor(opts: Record<string, unknown>);
    setRadius(radius: number): void;
    setCenter(latlng: LatLng): void;
  }

  interface MapsEventListener {
    remove(): void;
  }

  namespace event {
    function clearInstanceListeners(instance: unknown): void;
  }

  namespace places {
    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: Record<string, unknown>);
      addListener(event: string, handler: () => void): MapsEventListener;
      getPlace(): {
        geometry?: { location?: LatLng };
      };
    }
  }
}

declare const google: { maps: typeof google.maps };

interface Window {
  google?: typeof google;
}
