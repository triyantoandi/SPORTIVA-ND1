import { GPSPoint, Split, SportType, PersonalRecords, Activity } from "../types";

// Haversine distance in meters
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// MET (Metabolic Equivalent of Task) table
export const SPORT_METS: Record<SportType, number> = {
  Running: 9.8,
  Walking: 3.8,
  Cycling: 7.5,
  Hiking: 6.0,
  Trekking: 6.5,
  Swimming: 8.0,
  Gym: 5.5,
  Strength: 5.0,
  HIIT: 8.5,
  Yoga: 3.0,
  Badminton: 5.8,
  Football: 8.0,
  Basketball: 7.5,
  Tennis: 7.3,
  Volleyball: 4.0,
  Rowing: 7.0,
  Skating: 7.0,
  Treadmill: 8.8,
  'Indoor Cycling': 7.0
};

export function calculateCalories(
  sportType: SportType,
  durationSec: number,
  weightKg: number = 70,
  avgSpeedKmh?: number
): number {
  let met = SPORT_METS[sportType] || 6.0;
  
  // Dynamic MET scaling based on speed if available
  if (sportType === 'Running' && avgSpeedKmh) {
    if (avgSpeedKmh >= 14) met = 12.8;
    else if (avgSpeedKmh >= 12) met = 11.5;
    else if (avgSpeedKmh >= 10) met = 9.8;
    else met = 8.0;
  } else if (sportType === 'Cycling' && avgSpeedKmh) {
    if (avgSpeedKmh >= 30) met = 12.0;
    else if (avgSpeedKmh >= 24) met = 10.0;
    else if (avgSpeedKmh >= 18) met = 8.0;
    else met = 6.0;
  }

  const hours = durationSec / 3600;
  return Math.round(met * weightKg * hours);
}

// Calculate cumulative elevation gain in meters
export function calculateElevationGain(points: GPSPoint[]): number {
  if (points.length < 2) return 0;
  let gain = 0;
  let prevAlt: number | null = null;

  for (const pt of points) {
    if (pt.altitude !== null && pt.altitude !== undefined) {
      if (prevAlt !== null) {
        const delta = pt.altitude - prevAlt;
        // Filter small GPS altitude jitter (< 1.2m)
        if (delta > 1.2 && delta < 50) {
          gain += delta;
        }
      }
      prevAlt = pt.altitude;
    }
  }

  return Math.round(gain);
}

// Generate automatic 1KM / 5KM splits from recorded GPS points
export function calculateSplits(points: GPSPoint[], splitIntervalKm: number = 1.0): Split[] {
  if (points.length < 2) return [];

  const splits: Split[] = [];
  let currentSplitIndex = 1;
  let splitDistanceAccumulator = 0;
  let splitStartTime = points[0].timestamp;
  let splitStartAltitude = points[0].altitude ?? 0;
  let totalHr = 0;
  let hrCount = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dMeters = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const dKm = dMeters / 1000;

    splitDistanceAccumulator += dKm;
    if (p2.heartRate) {
      totalHr += p2.heartRate;
      hrCount++;
    }

    if (splitDistanceAccumulator >= splitIntervalKm || i === points.length - 1) {
      const splitDurationSec = Math.max(1, Math.round((p2.timestamp - splitStartTime) / 1000));
      const paceMinPerKm = (splitDurationSec / 60) / splitDistanceAccumulator;
      const endAltitude = p2.altitude ?? splitStartAltitude;

      splits.push({
        splitNumber: currentSplitIndex,
        distanceKm: Number(splitDistanceAccumulator.toFixed(2)),
        timeSec: splitDurationSec,
        paceMinPerKm: Number(paceMinPerKm.toFixed(2)),
        elevationChangeM: Math.round(endAltitude - splitStartAltitude),
        avgHeartRate: hrCount > 0 ? Math.round(totalHr / hrCount) : undefined
      });

      // Reset for next split
      currentSplitIndex++;
      splitDistanceAccumulator = 0;
      splitStartTime = p2.timestamp;
      splitStartAltitude = endAltitude;
      totalHr = 0;
      hrCount = 0;
    }
  }

  return splits;
}

// Anti-Cheat Detection System
export interface AntiCheatResult {
  isFlagged: boolean;
  reason?: string;
  maxSpeedDetectedKmh?: number;
}

export function validateAntiCheat(points: GPSPoint[], sportType: SportType): AntiCheatResult {
  if (points.length < 2) return { isFlagged: false };

  const MAX_SPEED_LIMITS: Record<SportType, number> = {
    Running: 40, // Bolt peak is ~44km/h for 100m
    Walking: 15,
    Cycling: 100, // Pro downhill
    Hiking: 20,
    Trekking: 20,
    Swimming: 12,
    Gym: 30,
    Strength: 30,
    HIIT: 30,
    Yoga: 10,
    Badminton: 35,
    Football: 38,
    Basketball: 35,
    Tennis: 35,
    Volleyball: 25,
    Rowing: 35,
    Skating: 65,
    Treadmill: 30,
    'Indoor Cycling': 90
  };

  const limit = MAX_SPEED_LIMITS[sportType] || 45;
  let maxCalculatedSpeedKmh = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const deltaSec = (p2.timestamp - p1.timestamp) / 1000;
    
    if (deltaSec > 0.3) {
      const distMeters = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
      const speedKmh = (distMeters / deltaSec) * 3.6;

      if (speedKmh > maxCalculatedSpeedKmh) {
        maxCalculatedSpeedKmh = speedKmh;
      }

      // Check for GPS teleportation (e.g. > 400m in less than 3 seconds)
      if (distMeters > 400 && deltaSec < 3) {
        return {
          isFlagged: true,
          reason: `Deteksi GPS Teleportasi / Lonjakan rute abnormal (${Math.round(distMeters)}m dalam ${deltaSec.toFixed(1)}s)`,
          maxSpeedDetectedKmh: Math.round(speedKmh)
        };
      }
    }
  }

  if (maxCalculatedSpeedKmh > limit) {
    return {
      isFlagged: true,
      reason: `Kecepatan puncak melebihi batas fisik realistis untuk ${sportType} (${Math.round(maxCalculatedSpeedKmh)} km/h > batas ${limit} km/h)`,
      maxSpeedDetectedKmh: Math.round(maxCalculatedSpeedKmh)
    };
  }

  return { isFlagged: false, maxSpeedDetectedKmh: Math.round(maxCalculatedSpeedKmh) };
}

// Personal Records Detection
export interface PRBreakEvent {
  metric: 'fastest1k' | 'fastest5k' | 'fastest10k' | 'longestRun' | 'longestRide' | 'highestElevation';
  metricTitle: string;
  previousValue?: string;
  newValue: string;
  improvement?: string;
}

export function checkPersonalRecords(
  activity: Activity,
  existingPRs: PersonalRecords = {}
): { updatedPRs: PersonalRecords; newRecords: PRBreakEvent[] } {
  const updated: PersonalRecords = { ...existingPRs };
  const newRecords: PRBreakEvent[] = [];

  const { sportType, distanceKm, durationSec, elevationGainM, id, createdAt } = activity;

  if (sportType === 'Running' || sportType === 'Treadmill') {
    // Check 1K PR (if activity is >= 1.0 km)
    if (distanceKm >= 1.0) {
      const estimated1kSec = (durationSec / distanceKm) * 1.0;
      if (!updated.fastest1k || estimated1kSec < updated.fastest1k.timeSec) {
        const prevSec = updated.fastest1k?.timeSec;
        updated.fastest1k = { timeSec: Math.round(estimated1kSec), date: createdAt, activityId: id };
        newRecords.push({
          metric: 'fastest1k',
          metricTitle: 'Fastest 1 KM',
          previousValue: prevSec ? formatSecToMinSec(prevSec) : undefined,
          newValue: formatSecToMinSec(estimated1kSec),
          improvement: prevSec ? `${Math.round(prevSec - estimated1kSec)}s faster` : 'First Record!'
        });
      }
    }

    // Check 5K PR
    if (distanceKm >= 5.0) {
      const estimated5kSec = (durationSec / distanceKm) * 5.0;
      if (!updated.fastest5k || estimated5kSec < updated.fastest5k.timeSec) {
        const prevSec = updated.fastest5k?.timeSec;
        updated.fastest5k = { timeSec: Math.round(estimated5kSec), date: createdAt, activityId: id };
        newRecords.push({
          metric: 'fastest5k',
          metricTitle: 'Fastest 5 KM',
          previousValue: prevSec ? formatSecToMinSec(prevSec) : undefined,
          newValue: formatSecToMinSec(estimated5kSec),
          improvement: prevSec ? `${Math.round(prevSec - estimated5kSec)}s faster` : 'First Record!'
        });
      }
    }

    // Check 10K PR
    if (distanceKm >= 10.0) {
      const estimated10kSec = (durationSec / distanceKm) * 10.0;
      if (!updated.fastest10k || estimated10kSec < updated.fastest10k.timeSec) {
        const prevSec = updated.fastest10k?.timeSec;
        updated.fastest10k = { timeSec: Math.round(estimated10kSec), date: createdAt, activityId: id };
        newRecords.push({
          metric: 'fastest10k',
          metricTitle: 'Fastest 10 KM',
          previousValue: prevSec ? formatSecToMinSec(prevSec) : undefined,
          newValue: formatSecToMinSec(estimated10kSec),
          improvement: prevSec ? `${Math.round(prevSec - estimated10kSec)}s faster` : 'First Record!'
        });
      }
    }

    // Longest Run
    if (!updated.longestRun || distanceKm > updated.longestRun.distanceKm) {
      const prevDist = updated.longestRun?.distanceKm;
      updated.longestRun = { distanceKm: Number(distanceKm.toFixed(2)), date: createdAt, activityId: id };
      newRecords.push({
        metric: 'longestRun',
        metricTitle: 'Longest Run',
        previousValue: prevDist ? `${prevDist} KM` : undefined,
        newValue: `${distanceKm.toFixed(2)} KM`,
        improvement: prevDist ? `+${(distanceKm - prevDist).toFixed(2)} KM` : 'First Record!'
      });
    }
  }

  if (sportType === 'Cycling' || sportType === 'Indoor Cycling') {
    if (!updated.longestRide || distanceKm > updated.longestRide.distanceKm) {
      const prevDist = updated.longestRide?.distanceKm;
      updated.longestRide = { distanceKm: Number(distanceKm.toFixed(2)), date: createdAt, activityId: id };
      newRecords.push({
        metric: 'longestRide',
        metricTitle: 'Longest Ride',
        previousValue: prevDist ? `${prevDist} KM` : undefined,
        newValue: `${distanceKm.toFixed(2)} KM`,
        improvement: prevDist ? `+${(distanceKm - prevDist).toFixed(2)} KM` : 'First Record!'
      });
    }
  }

  // Highest Elevation
  if (elevationGainM > 20) {
    if (!updated.highestElevation || elevationGainM > updated.highestElevation.elevationM) {
      const prevElev = updated.highestElevation?.elevationM;
      updated.highestElevation = { elevationM: elevationGainM, date: createdAt, activityId: id };
      newRecords.push({
        metric: 'highestElevation',
        metricTitle: 'Highest Elevation Gain',
        previousValue: prevElev ? `${prevElev} m` : undefined,
        newValue: `${elevationGainM} m`,
        improvement: prevElev ? `+${elevationGainM - prevElev} m` : 'First Record!'
      });
    }
  }

  return { updatedPRs: updated, newRecords };
}

function formatSecToMinSec(totalSec: number): string {
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
