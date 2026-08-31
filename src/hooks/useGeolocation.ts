import { useState, useEffect, useRef, useCallback } from "react";
import { GPSPoint, SportType } from "../types";
import { haversineDistance, calculateCalories, calculateElevationGain } from "../utils/geoUtils";

export type TrackingState = "idle" | "recording" | "paused" | "finished";

// Demo simulation path points around Jember center for instant testing
const SIMULATION_COORDS = [
  { lat: -8.1724, lng: 113.7001, alt: 85 },
  { lat: -8.1710, lng: 113.7018, alt: 87 },
  { lat: -8.1690, lng: 113.7035, alt: 90 },
  { lat: -8.1672, lng: 113.7058, alt: 95 },
  { lat: -8.1650, lng: 113.7082, alt: 104 },
  { lat: -8.1625, lng: 113.7100, alt: 115 },
  { lat: -8.1595, lng: 113.7125, alt: 126 },
  { lat: -8.1615, lng: 113.7150, alt: 119 },
  { lat: -8.1648, lng: 113.7125, alt: 110 },
  { lat: -8.1685, lng: 113.7085, alt: 100 },
  { lat: -8.1710, lng: 113.7045, alt: 92 },
  { lat: -8.1724, lng: 113.7001, alt: 85 }
];

export function useGeolocation(sportType: SportType = "Running", weightKg: number = 70) {
  const [trackingState, setTrackingState] = useState<TrackingState>("idle");
  const [points, setPoints] = useState<GPSPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState<number>(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(0);
  const [currentPaceMinPerKm, setCurrentPaceMinPerKm] = useState<number>(0);
  const [avgPaceMinPerKm, setAvgPaceMinPerKm] = useState<number>(0);
  const [elevationGainM, setElevationGainM] = useState<number>(0);
  const [caloriesKcal, setCaloriesKcal] = useState<number>(0);
  const [heartRate, setHeartRate] = useState<number>(142);
  const [cadence, setCadence] = useState<number>(172);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const simIndexRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const wakeLockRef = useRef<any>(null);

  // Request Wake Lock to prevent screen sleep
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      }
    } catch (e) {
      console.warn("Wake lock warning:", e);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Add new GPS point and update metrics
  const appendPoint = useCallback((newPt: GPSPoint) => {
    setPoints(prev => {
      const updated = [...prev, newPt];
      
      // Calculate distance increment
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const distMeters = haversineDistance(last.lat, last.lng, newPt.lat, newPt.lng);
        // Discard extreme GPS anomalies (> 150m in 1s)
        if (distMeters < 150) {
          setDistanceKm(d => {
            const nextDist = Number((d + distMeters / 1000).toFixed(3));
            return nextDist;
          });
        }
      }

      // Update elevation gain
      const elev = calculateElevationGain(updated);
      setElevationGainM(elev);

      return updated;
    });

    setCurrentLocation(newPt);
    if (newPt.accuracy !== undefined) setGpsAccuracy(newPt.accuracy);
  }, []);

  // Duration timer
  useEffect(() => {
    if (trackingState === "recording") {
      timerRef.current = setInterval(() => {
        setDurationSec(prev => {
          const nextDuration = prev + 1;
          
          // Update calories dynamically
          setCaloriesKcal(calculateCalories(sportType, nextDuration, weightKg, avgSpeedKmh));

          // Simulate heart rate dynamic variability
          if (sportType === "Running" || sportType === "Cycling" || sportType === "HIIT") {
            const baseHr = sportType === "Running" ? 148 : 138;
            const variance = Math.sin(nextDuration / 15) * 8 + (Math.random() * 4 - 2);
            setHeartRate(Math.round(baseHr + variance));
            setCadence(sportType === "Running" ? 170 + Math.round(Math.sin(nextDuration / 10) * 4) : 82);
          }

          return nextDuration;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [trackingState, sportType, weightKg, avgSpeedKmh]);

  // Recalculate average speed & pace
  useEffect(() => {
    if (durationSec > 0 && distanceKm > 0) {
      const speed = (distanceKm / (durationSec / 3600));
      setAvgSpeedKmh(Number(speed.toFixed(1)));
      setMaxSpeedKmh(prev => Math.max(prev, Number(speed.toFixed(1))));

      const pace = (durationSec / 60) / distanceKm;
      setAvgPaceMinPerKm(Number(pace.toFixed(2)));
      setCurrentPaceMinPerKm(Number(pace.toFixed(2)));
    }
  }, [durationSec, distanceKm]);

  // Simulated GPS generator loop
  useEffect(() => {
    let simInterval: NodeJS.Timeout | null = null;

    if (trackingState === "recording" && isSimulated) {
      simInterval = setInterval(() => {
        const step = SIMULATION_COORDS[simIndexRef.current % SIMULATION_COORDS.length];
        const nextCoord = {
          lat: step.lat + (Math.random() - 0.5) * 0.0001,
          lng: step.lng + (Math.random() - 0.5) * 0.0001,
          altitude: step.alt + Math.random() * 2,
          speed: 3.2 + Math.random() * 0.5,
          accuracy: 4,
          timestamp: Date.now(),
          heartRate: 145 + Math.round(Math.random() * 6),
          cadence: 174
        };

        simIndexRef.current += 1;
        appendPoint(nextCoord);
      }, 2000);
    }

    return () => {
      if (simInterval) clearInterval(simInterval);
    };
  }, [trackingState, isSimulated, appendPoint]);

  // Real GPS Watcher
  const startRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation tidak didukung di browser ini. Beralih ke mode simulasi.");
      setIsSimulated(true);
      return;
    }

    setGpsError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: GPSPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now(),
          heartRate: 145,
          cadence: 172
        };
        appendPoint(pt);
      },
      (err) => {
        console.warn("GPS Permission or signal issue:", err);
        setGpsError(`GPS Notice: ${err.message}. Anda dapat menggunakan mode simulasi.`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000
      }
    );
  };

  const startTracking = (useSimulation = false) => {
    setIsSimulated(useSimulation);
    setTrackingState("recording");
    startTimeRef.current = Date.now();
    requestWakeLock();

    if (!useSimulation) {
      startRealGps();
    } else {
      // Seed initial location
      const initial = {
        lat: SIMULATION_COORDS[0].lat,
        lng: SIMULATION_COORDS[0].lng,
        altitude: SIMULATION_COORDS[0].alt,
        speed: 3.1,
        accuracy: 3,
        timestamp: Date.now(),
        heartRate: 140,
        cadence: 170
      };
      appendPoint(initial);
    }
  };

  const pauseTracking = () => {
    setTrackingState("paused");
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const resumeTracking = () => {
    setTrackingState("recording");
    if (!isSimulated) {
      startRealGps();
    }
  };

  const finishTracking = () => {
    setTrackingState("finished");
    releaseWakeLock();
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const cancelTracking = () => {
    setTrackingState("idle");
    setPoints([]);
    setDurationSec(0);
    setDistanceKm(0);
    setElevationGainM(0);
    setCaloriesKcal(0);
    setAvgPaceMinPerKm(0);
    setAvgSpeedKmh(0);
    releaseWakeLock();
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  return {
    trackingState,
    points,
    currentLocation,
    durationSec,
    distanceKm,
    currentSpeedKmh,
    avgSpeedKmh,
    maxSpeedKmh,
    currentPaceMinPerKm,
    avgPaceMinPerKm,
    elevationGainM,
    caloriesKcal,
    heartRate,
    cadence,
    gpsAccuracy,
    isSimulated,
    gpsError,
    startTracking,
    pauseTracking,
    resumeTracking,
    finishTracking,
    cancelTracking,
    setIsSimulated
  };
}
