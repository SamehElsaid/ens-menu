let loadPromise: Promise<typeof google> | null = null;

export type GoogleMapsLoadOptions = {
  language?: string;
  region?: string;
};

export function loadGoogleMaps(
  options: GoogleMapsLoadOptions = {},
): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (loadPromise) return loadPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
  }

  const language = options.language ?? "en";
  const region = options.region ?? "EG";

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = `__gmapsInit_${Date.now()}`;
    const win = window as unknown as Window & Record<string, () => void>;
    win[callbackName] = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps failed to initialize"));
      }
      delete win[callbackName];
    };

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      `&libraries=places&language=${encodeURIComponent(language)}` +
      `&region=${encodeURIComponent(region)}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
