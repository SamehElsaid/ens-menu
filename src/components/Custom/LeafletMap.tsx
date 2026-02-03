"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { FaSearch, FaTimes } from "react-icons/fa";

// Dynamic import for Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

// Fix for default marker icon in Next.js
if (typeof window !== "undefined") {
  import("leaflet").then((L) => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  });
}

interface LeafletMapProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    country?: string;
    state?: string;
    city?: string;
  }) => void;
  initialPosition?: { lat: number; lng: number };
  initialAddress?: string;
}

// Component to handle map updates - must be inside MapContainer
function MapUpdaterComponent({
  position,
  onLocationSelect,
}: {
  position: { lat: number; lng: number };
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    country?: string;
    state?: string;
    city?: string;
  }) => void;
}) {
  const [UseMapComponent, setUseMapComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      const MapUpdaterInner = () => {
        const map = mod.useMap();
        const isUserInteractionRef = useRef(false);
        const lastPositionRef = useRef<{ lat: number; lng: number } | null>(
          null
        );
        const dragThrottleRef = useRef<NodeJS.Timeout | null>(null);
        const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const positionRef = useRef(position);
        const onLocationSelectRef = useRef(onLocationSelect);

        // Helper function to check if position has changed significantly
        const hasPositionChanged = (
          newPos: { lat: number; lng: number },
          oldPos: { lat: number; lng: number } | null
        ) => {
          if (!oldPos) return true;
          const threshold = 0.0001; // ~11 meters
          return (
            Math.abs(newPos.lat - oldPos.lat) > threshold ||
            Math.abs(newPos.lng - oldPos.lng) > threshold
          );
        };

        // Update refs when props change (using refs to avoid dependency issues)
        positionRef.current = position;
        onLocationSelectRef.current = onLocationSelect;

        // Update map view when position changes (only when position is set externally, e.g., from search)
        // Don't update when user is dragging/clicking
        useEffect(() => {
          if (!map || isUserInteractionRef.current) return;

          const currentPosition = positionRef.current;
          const newPos = { lat: currentPosition.lat, lng: currentPosition.lng };

          // Only update if position actually changed
          if (!hasPositionChanged(newPos, lastPositionRef.current)) {
            return;
          }

          // Clear any pending updates
          if (positionUpdateTimeoutRef.current) {
            clearTimeout(positionUpdateTimeoutRef.current);
          }

          // Debounce position updates to avoid excessive map movements
          positionUpdateTimeoutRef.current = setTimeout(() => {
            if (!isUserInteractionRef.current) {
              const currentCenter = map.getCenter();
              const currentPos = positionRef.current;
              const distance = Math.sqrt(
                Math.pow(currentPos.lat - currentCenter.lat, 2) +
                  Math.pow(currentPos.lng - currentCenter.lng, 2)
              );

              // Only update if the distance is significant (more than ~50 meters)
              if (distance > 0.0005) {
                map.setView([currentPos.lat, currentPos.lng], map.getZoom(), {
                  animate: true,
                  duration: 0.3,
                });
                lastPositionRef.current = newPos;
              }
            }
          }, 50);
        }, [map]);

        // Handle map click events - update position directly without API call
        useEffect(() => {
          if (!map) return;

          const handleClick = (e: { latlng: { lat: number; lng: number } }) => {
            isUserInteractionRef.current = true;
            const { lat, lng } = e.latlng;
            const newPos = { lat, lng };

            // Only update if position changed
            if (hasPositionChanged(newPos, lastPositionRef.current)) {
              lastPositionRef.current = newPos;
              onLocationSelectRef.current({
                lat,
                lng,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              });
            }

            // Reset interaction flag after a delay
            setTimeout(() => {
              isUserInteractionRef.current = false;
            }, 200);
          };

          map.on("click", handleClick);
          return () => {
            map.off("click", handleClick);
          };
        }, [map]);

        // Handle map drag events - update position continuously during drag with throttling
        useEffect(() => {
          if (!map) return;

          const handleDragStart = () => {
            isUserInteractionRef.current = true;
            // Clear any pending position updates
            if (positionUpdateTimeoutRef.current) {
              clearTimeout(positionUpdateTimeoutRef.current);
            }
          };

          const handleDrag = () => {
            // Throttle drag updates to improve performance (update every 100ms)
            if (dragThrottleRef.current) return;

            dragThrottleRef.current = setTimeout(() => {
              const center = map.getCenter();
              const newPos = { lat: center.lat, lng: center.lng };

              // Only update if position changed significantly
              if (hasPositionChanged(newPos, lastPositionRef.current)) {
                lastPositionRef.current = newPos;
                onLocationSelectRef.current({
                  lat: center.lat,
                  lng: center.lng,
                  address: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
                });
              }

              dragThrottleRef.current = null;
            }, 100);
          };

          const handleDragEnd = () => {
            // Clear throttle
            if (dragThrottleRef.current) {
              clearTimeout(dragThrottleRef.current);
              dragThrottleRef.current = null;
            }

            // Final update on drag end
            const center = map.getCenter();
            const newPos = { lat: center.lat, lng: center.lng };

            if (hasPositionChanged(newPos, lastPositionRef.current)) {
              lastPositionRef.current = newPos;
              onLocationSelectRef.current({
                lat: center.lat,
                lng: center.lng,
                address: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
              });
            }

            // Reset interaction flag after a delay
            setTimeout(() => {
              isUserInteractionRef.current = false;
            }, 200);
          };

          map.on("dragstart", handleDragStart);
          map.on("drag", handleDrag);
          map.on("dragend", handleDragEnd);

          return () => {
            map.off("dragstart", handleDragStart);
            map.off("drag", handleDrag);
            map.off("dragend", handleDragEnd);

            // Cleanup timeouts
            if (dragThrottleRef.current) {
              clearTimeout(dragThrottleRef.current);
            }
            if (positionUpdateTimeoutRef.current) {
              clearTimeout(positionUpdateTimeoutRef.current);
            }
          };
        }, [map]);

        return null;
      };
      setUseMapComponent(() => MapUpdaterInner);
    });
    // Using refs for position and onLocationSelect to avoid dependency issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!UseMapComponent) return null;

  return <UseMapComponent />;
}

const MapUpdater = dynamic(() => Promise.resolve(MapUpdaterComponent), {
  ssr: false,
});

export default function LeafletMap({
  onLocationSelect,
  initialPosition,
  initialAddress,
}: LeafletMapProps) {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [searchResults, setSearchResults] = useState<
    Array<{
      display_name: string;
      lat: string;
      lon: string;
      address?: {
        country?: string;
        state?: string;
        city?: string;
        town?: string;
        village?: string;
      };
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialPosition || { lat: 30.0444, lng: 31.2357 } // Default: Cairo, Egypt
  );
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || "");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle search input
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setShowResults(false);
      setSearchResults([]);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.trim().length < 3) {
        return;
      }

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              value
            )}&limit=5&accept-language=${
              locale === "ar" ? "ar" : "en"
            }&addressdetails=1`
          );
          const data = await response.json();
          setSearchResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Error searching locations:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    },
    [locale]
  );

  // Handle result selection - API call only when selecting from search results
  const handleSelectResult = useCallback(
    (result: {
      display_name: string;
      lat: string;
      lon: string;
      address?: {
        country?: string;
        state?: string;
        city?: string;
        town?: string;
        village?: string;
      };
    }) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const newPosition = { lat, lng };

      setPosition(newPosition);
      setSelectedAddress(result.display_name);
      setSearchQuery(result.display_name);
      setShowResults(false);
      setSearchResults([]);

      // Extract location details from search result
      const address = result.address || {};
      const country = address.country || "";
      const state = address.state || "";
      const city = address.city || address.town || address.village || "";

      // Call onLocationSelect with full details from search result
      onLocationSelect({
        lat,
        lng,
        address: result.display_name,
        country,
        state,
        city,
      });
    },
    [onLocationSelect]
  );

  // Handle map click/drag - update position directly without API call
  const handleMapLocationSelect = useCallback(
    (location: {
      lat: number;
      lng: number;
      address: string;
      country?: string;
      state?: string;
      city?: string;
    }) => {
      setPosition({ lat: location.lat, lng: location.lng });
      // Update address display with coordinates (no API call)
      setSelectedAddress(location.address);
      setSearchQuery(location.address);
      onLocationSelect(location);
    },
    [onLocationSelect]
  );

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Search Bar */}
      <div className="relative" ref={resultsRef}>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              locale === "ar" ? "ابحث عن موقع..." : "Search for a location..."
            }
            className="w-full ps-10 pe-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectResult(result)}
                className="w-full text-start px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                <div className="flex items-start gap-2">
                  <FaSearch className="text-gray-400 text-xs mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.display_name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              {locale === "ar" ? "جاري البحث..." : "Searching..."}
            </p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 relative">
        <MapContainer
          scrollWheelZoom={false}
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater
            position={position}
            onLocationSelect={handleMapLocationSelect}
          />
        </MapContainer>
        {/* Fixed center marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1000 pointer-events-none">
          <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">
              {locale === "ar" ? "الموقع المحدد:" : "Selected Location:"}
            </span>{" "}
            <span className="text-gray-900">{selectedAddress}</span>
          </p>
        </div>
      )}
    </div>
  );
}
