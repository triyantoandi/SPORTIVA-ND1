import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { haversineDistance } from "../../utils/geoUtils";

interface Waypoint {
  lat: number;
  lng: number;
  label?: string;
  altitude?: number;
}

interface RouteEditorMapProps {
  onWaypointsChange: (waypoints: Waypoint[], distanceKm: number) => void;
  height?: string;
}

export const RouteEditorMap: React.FC<RouteEditorMapProps> = ({
  onWaypointsChange,
  height = "420px"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-8.1724, 113.7001], // Jember Center default
        zoom: 14,
        attributionControl: false
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd"
      }).addTo(map);

      // Add click listener to add waypoints
      map.on("click", (e: L.LeafletMouseEvent) => {
        const newWp: Waypoint = {
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
          altitude: Math.round(80 + Math.random() * 25)
        };

        setWaypoints(prev => {
          const next = [...prev, newWp];
          
          // Calculate total distance
          let totalDist = 0;
          for (let i = 1; i < next.length; i++) {
            totalDist += haversineDistance(next[i-1].lat, next[i-1].lng, next[i].lat, next[i].lng) / 1000;
          }
          onWaypointsChange(next, Number(totalDist.toFixed(2)));

          return next;
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onWaypointsChange]);

  // Update Polyline & Waypoint pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const latlngs: [number, number][] = waypoints.map(w => [w.lat, w.lng]);

    if (latlngs.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs);
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: "#ff4713",
          weight: 5,
          opacity: 0.9,
          dashArray: waypoints.length === 1 ? "4, 8" : undefined
        }).addTo(map);
      }

      // Add pins for each waypoint
      waypoints.forEach((wp, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === waypoints.length - 1 && waypoints.length > 1;
        const bgColor = isStart ? "#10b981" : isEnd ? "#ef4444" : "#ff4713";

        const icon = L.divIcon({
          className: "custom-wp-pin",
          html: `<div style="background-color:${bgColor}; color:white; width:22px; height:22px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.35);">${idx + 1}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([wp.lat, wp.lng], { icon }).addTo(map);
        markersRef.current.push(marker);
      });
    } else {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([]);
      }
    }
  }, [waypoints]);

  const handleUndo = () => {
    setWaypoints(prev => {
      const next = prev.slice(0, -1);
      let totalDist = 0;
      for (let i = 1; i < next.length; i++) {
        totalDist += haversineDistance(next[i-1].lat, next[i-1].lng, next[i].lat, next[i].lng) / 1000;
      }
      onWaypointsChange(next, Number(totalDist.toFixed(2)));
      return next;
    });
  };

  const handleClear = () => {
    setWaypoints([]);
    onWaypointsChange([], 0);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full cursor-crosshair" />

      {/* Interactive Controls Overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg border border-slate-700">
        <span>📍 Klik peta untuk membuat waypoint</span>
      </div>

      <div className="absolute top-3 right-3 z-[400] flex gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={waypoints.length === 0}
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow disabled:opacity-40"
        >
          ↩ Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={waypoints.length === 0}
          className="bg-red-600/90 hover:bg-red-700 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg shadow disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
