"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoLocationSharp, IoLocateOutline, IoSearchOutline } from "react-icons/io5";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";

const DEFAULT_LAT = 29.9602;
const DEFAULT_LNG = 31.2569;

export const DEFAULT_BRANCH_LATITUDE = DEFAULT_LAT;
export const DEFAULT_BRANCH_LONGITUDE = DEFAULT_LNG;

export function isValidBranchCoordinate(value: number): boolean {
  return Number.isFinite(value) && value !== 0;
}

export function formatBranchCoordinate(value: number): string {
  return String(value);
}

export function getDefaultBranchFormCoords(): { latitude: string; longitude: string } {
  return {
    latitude: formatBranchCoordinate(DEFAULT_LAT),
    longitude: formatBranchCoordinate(DEFAULT_LNG),
  };
}

interface BranchLocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: number, lng: number) => void;
  searchLabel: string;
  searchPlaceholder: string;
  mapHint?: string;
  disabled?: boolean;
}

export default function BranchLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  searchLabel,
  searchPlaceholder,
  mapHint,
  disabled = false,
}: BranchLocationPickerProps) {
  const locale = useLocale();
  const t = useTranslations("settingsDeliveryPage.branches");
  const isRTL = locale === "ar";

  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(
    null,
  );
  const pacObserverRef = useRef<MutationObserver | null>(null);
  const inputCleanupRef = useRef<(() => void) | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const skipIdleEmitRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);
  const hasCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
  const centerLat = hasCoords ? parsedLat : DEFAULT_LAT;
  const centerLng = hasCoords ? parsedLng : DEFAULT_LNG;

  const syncPacContainer = useCallback(() => {
    const input = searchRef.current;
    if (!input) return;

    const pac = document.querySelector<HTMLElement>(".pac-container");
    if (!pac) return;

    const rect = input.getBoundingClientRect();
    pac.style.width = `${rect.width}px`;

    if (isRTL) {
      pac.style.left = "auto";
      pac.style.right = `${window.innerWidth - rect.right}px`;
    } else {
      pac.style.right = "auto";
      pac.style.left = `${rect.left}px`;
    }
  }, [isRTL]);

  const emitLocation = (lat: number, lng: number) => {
    onLocationChangeRef.current(lat, lng);
  };

  const emitMapCenter = () => {
    const map = mapInstance.current;
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;
    emitLocation(center.lat(), center.lng());
  };

  const moveMapTo = (lat: number, lng: number, emit = true) => {
    const map = mapInstance.current;
    if (!map) return;
    skipIdleEmitRef.current = true;
    map.panTo(new google.maps.LatLng(lat, lng));
    if (emit) emitLocation(lat, lng);
  };

  const handleCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError(t("geolocationUnavailable"));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        moveMapTo(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setIsLocating(false);
        setLocationError(t("geolocationDenied"));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  };

  const handleGoToArea = () => {
    setLocationError(null);
    const query = searchRef.current?.value.trim();
    if (!query) return;

    const geocoder = geocoderRef.current ?? new google.maps.Geocoder();
    geocoderRef.current = geocoder;

    setIsGeocoding(true);
    geocoder.geocode({ address: query }, (results, status) => {
      setIsGeocoding(false);
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        moveMapTo(location.lat(), location.lng());
        return;
      }
      setLocationError(t("areaNotFound"));
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGoToArea();
    }
  };

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;

    loadGoogleMaps({
      language: isRTL ? "ar" : "en",
      region: "EG",
    })
      .then(() => {
        if (cancelled || !mapRef.current || !searchRef.current) return;

        const position = new google.maps.LatLng(centerLat, centerLng);

        const map = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapInstance.current = map;

        map.addListener("idle", () => {
          if (skipIdleEmitRef.current) {
            skipIdleEmitRef.current = false;
            return;
          }
          emitMapCenter();
        });

        const autocomplete = new google.maps.places.Autocomplete(
          searchRef.current,
          { fields: ["geometry", "formatted_address", "name"] },
        );
        autocompleteInstance.current = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const location = place.geometry?.location;
          if (!location) return;
          setLocationError(null);
          moveMapTo(location.lat(), location.lng());
        });

        emitLocation(centerLat, centerLng);

        const input = searchRef.current;
        const handleInputActivity = () => {
          requestAnimationFrame(syncPacContainer);
        };

        input.addEventListener("focus", handleInputActivity);
        input.addEventListener("input", handleInputActivity);

        pacObserverRef.current = new MutationObserver(() => {
          syncPacContainer();
        });
        pacObserverRef.current.observe(document.body, {
          childList: true,
          subtree: true,
        });

        window.addEventListener("resize", syncPacContainer);
        window.addEventListener("scroll", syncPacContainer, true);

        inputCleanupRef.current = () => {
          input.removeEventListener("focus", handleInputActivity);
          input.removeEventListener("input", handleInputActivity);
          window.removeEventListener("resize", syncPacContainer);
          window.removeEventListener("scroll", syncPacContainer, true);
        };

        queueMicrotask(() => {
          if (!cancelled) setIsLoading(false);
        });
      })
      .catch(() => {
        queueMicrotask(() => {
          if (!cancelled) {
            setLoadError(true);
            setIsLoading(false);
          }
        });
      });

    return () => {
      cancelled = true;
      inputCleanupRef.current?.();
      inputCleanupRef.current = null;
      pacObserverRef.current?.disconnect();
      pacObserverRef.current = null;
      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
      }
      if (autocompleteInstance.current) {
        google.maps.event.clearInstanceListeners(autocompleteInstance.current);
      }
      mapInstance.current = null;
      autocompleteInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, isRTL, syncPacContainer]);

  useEffect(() => {
    if (!mapInstance.current) return;
    moveMapTo(centerLat, centerLng, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLat, centerLng]);

  if (disabled) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 h-56 flex items-center justify-center text-sm text-slate-400">
        {mapHint}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
        {mapHint}
      </div>
    );
  }

  return (
    <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {searchLabel}
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              ref={searchRef}
              type="text"
              dir={isRTL ? "rtl" : "ltr"}
              placeholder={searchPlaceholder}
              onKeyDown={handleSearchKeyDown}
              className="w-full py-3.5 ps-10 pe-4 outline-none rounded-2xl border border-accent-purple/20 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-400 dark:focus:border-accent-purple text-sm text-start"
            />
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
              <IoSearchOutline className="text-lg" />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLoading || isLocating}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLocating ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <IoLocateOutline className="text-lg text-primary shrink-0" />
              )}
              <span className="hidden sm:inline">{t("currentLocationBtn")}</span>
            </button>
            <button
              type="button"
              onClick={handleGoToArea}
              disabled={isLoading || isGeocoding}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary text-white px-3 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isGeocoding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IoSearchOutline className="text-lg shrink-0" />
              )}
              <span className="hidden sm:inline">{t("goToAreaBtn")}</span>
            </button>
          </div>
        </div>
        {locationError ? (
          <p className="text-xs text-red-500">{locationError}</p>
        ) : null}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        <div ref={mapRef} className="h-56 w-full" />
        {!isLoading && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-full"
            aria-hidden
          >
            <IoLocationSharp className="h-10 w-10 text-red-500 drop-shadow-md" />
          </div>
        )}
      </div>

      {mapHint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{mapHint}</p>
      ) : null}
    </div>
  );
}
