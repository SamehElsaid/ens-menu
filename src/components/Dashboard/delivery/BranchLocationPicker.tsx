"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  IoLocationSharp,
  IoLocateOutline,
  IoSearchOutline,
} from "react-icons/io5";
import {
  Alert,
  Button,
  Field,
  FieldError,
  Input,
  Spinner,
} from "@/components/ui";
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

export function getDefaultBranchFormCoords(): {
  latitude: string;
  longitude: string;
} {
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
  const tPage = useTranslations("settingsDeliveryPage");
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
      <div className="flex h-56 items-center justify-center rounded-lg border border-line bg-surface-2 px-4 text-center text-[13px] text-fg-subtle">
        {mapHint}
      </div>
    );
  }

  if (loadError) {
    return <Alert tone="danger">{mapHint}</Alert>;
  }

  return (
    <div className="flex flex-col gap-3" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-1.5">
        <Field label={searchLabel}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              ref={searchRef}
              type="text"
              dir={isRTL ? "rtl" : "ltr"}
              placeholder={searchPlaceholder}
              onKeyDown={handleSearchKeyDown}
              startIcon={<IoSearchOutline className="size-4" />}
              wrapperClassName="min-w-0 flex-1"
            />
            <div className="flex shrink-0 gap-2">
              {/* Both labels collapse below `sm`, so the icon is on its own —
                  hence the always-present `aria-label`. */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleCurrentLocation}
                loading={isLocating}
                disabled={isLoading}
                aria-label={t("currentLocationBtn")}
                title={t("currentLocationBtn")}
                startIcon={<IoLocateOutline className="size-4" />}
              >
                <span className="hidden sm:inline">
                  {t("currentLocationBtn")}
                </span>
              </Button>
              <Button
                type="button"
                loading={isGeocoding}
                disabled={isLoading}
                aria-label={t("goToAreaBtn")}
                title={t("goToAreaBtn")}
                startIcon={<IoSearchOutline className="size-4" />}
                onClick={handleGoToArea}
              >
                <span className="hidden sm:inline">{t("goToAreaBtn")}</span>
              </Button>
            </div>
          </div>
        </Field>
        {/* Outside the `Field`: geolocation and geocoding failures are not the
            typed value being invalid, so the control keeps a clean state. */}
        {locationError ? <FieldError>{locationError}</FieldError> : null}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-line">
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-surface-2/80"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">{tPage("loading")}</span>
            <Spinner size="lg" className="text-brand" />
          </div>
        )}
        <div ref={mapRef} className="h-56 w-full" />
        {!isLoading && (
          /* Physical centring is correct here: the pin marks the centre of the
             viewport, which does not move with direction. `text-danger` and the
             drop shadow are both load-bearing — `mapHint` tells the user to look
             for a red pin, and the shadow is what separates it from map tiles
             nobody controls. */
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-1 -translate-x-1/2 -translate-y-full"
            aria-hidden
          >
            <IoLocationSharp className="size-10 text-danger drop-shadow-md" />
          </div>
        )}
      </div>

      {mapHint ? <p className="text-xs text-fg-muted">{mapHint}</p> : null}
    </div>
  );
}
