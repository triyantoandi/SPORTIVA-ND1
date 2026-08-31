import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { GPSPoint } from "../../types";

interface LeafletMapProps {
  points?: GPSPoint[];
  currentLocation?: GPSPoint | null;
  interactive?: boolean;
  height?: string;
  zoom?: number;
  showSatelliteToggle?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  points = [],
  currentLocation,
  interactive = true,
  height = "320px",
  zoom = 15,
  showSatelliteToggle = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fallback default coordinates (Jember City Center)
    const initialLat = points.length > 0 ? points[0].lat : (currentLocation?.lat || -8.1724);
    const initialLng = points.length > 0 ? points[0].lng : (currentLocation?.lng || 113.7001);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        attributionControl: false
      });

      // Sportive Dark CartoDB Tile Layer as primary
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd"
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Polyline and Markers when points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Build latlngs
    const latlngs: [number, number][] = points.map(p => [p.lat, p.lng]);

    // Update or create polyline
    if (latlngs.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs);
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: "#ff4713", // SPORTIVA Signature Neon Orange
          weight: 5,
          opacity: 0.95,
          lineJoin: "round",
          lineCap: "round"
        }).addTo(map);
      }

      // Add Start Marker
      if (!startMarkerRef.current && latlngs.length > 0) {
        const startIcon = L.divIcon({
          className: "custom-start-marker",
          html: `<div style="background-color:#10b981; width:14px; height:14px; border:2.5px solid #ffffff; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        startMarkerRef.current = L.marker(latlngs[0], { icon: startIcon }).addTo(map);
      }

      // If finished with multiple points, add End Marker
      if (latlngs.length > 1) {
        const lastCoord = latlngs[latlngs.length - 1];
        if (endMarkerRef.current) {
          endMarkerRef.current.setLatLng(lastCoord);
        } else {
          const endIcon = L.divIcon({
            className: "custom-end-marker",
            html: `<div style="background-color:#ef4444; width:16px; height:16px; border:2.5px solid #ffffff; border-radius:3px; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          endMarkerRef.current = L.marker(lastCoord, { icon: endIcon }).addTo(map);
        }
      }

      // Fit bounds if more than 1 point and not strictly live tracking
      if (latlngs.length > 1 && !currentLocation) {
        try {
          map.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
        } catch (e) {
          // Ignore
        }
      }
    }

    // Live Current Location Pulse Marker
    if (currentLocation) {
      const curPos: [number, number] = [currentLocation.lat, currentLocation.lng];
      if (markerRef.current) {
        markerRef.current.setLatLng(curPos);
      } else {
        const pulseIcon = L.divIcon({
          className: "sportiva-pulse-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        markerRef.current = L.marker(curPos, { icon: pulseIcon }).addTo(map);
      }
      map.panTo(curPos, { animate: true });
    }
  }, [points, currentLocation]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map branding indicator */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md border border-slate-700/50">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        SPORTIVA Live GPS Engine
      </div>
    </div>
  );
};
