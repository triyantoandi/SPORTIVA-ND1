import { Activity, GPSPoint, Split, SportType } from "../types";
import { haversineDistance, calculateCalories, calculateElevationGain, calculateSplits } from "./geoUtils";

export interface ParsedGpxData {
  title: string;
  sportType: SportType;
  points: GPSPoint[];
  distanceKm: number;
  durationSec: number;
  elevationGainM: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  avgPaceMinPerKm: number;
  caloriesKcal: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  cadence?: number;
  startTime: string;
  endTime: string;
  splits: Split[];
}

/**
 * Parse standard GPX 1.1 / 1.0 XML files from Garmin, Strava, Apple Watch, Coros, etc.
 */
export function parseGPX(xmlContent: string): ParsedGpxData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Format file GPX tidak valid atau file korup.");
  }

  // Extract track name
  const nameNode = xmlDoc.querySelector("trk > name, gpx > name, metadata > name");
  const title = nameNode?.textContent?.trim() || "Aktivitas GPX Impor";

  // Determine sport type if present
  let sportType: SportType = "Running";
  const typeNode = xmlDoc.querySelector("trk > type");
  const typeText = (typeNode?.textContent || "").toLowerCase();
  if (typeText.includes("ride") || typeText.includes("cycl") || typeText.includes("bike")) {
    sportType = "Cycling";
  } else if (typeText.includes("walk")) {
    sportType = "Walking";
  } else if (typeText.includes("hike")) {
    sportType = "Hiking";
  } else if (typeText.includes("swim")) {
    sportType = "Swimming";
  }

  const trkpts = xmlDoc.querySelectorAll("trkpt");
  if (trkpts.length === 0) {
    // Try waypoints if no trackpoints
    const wpts = xmlDoc.querySelectorAll("wpt");
    if (wpts.length === 0) {
      throw new Error("Tidak ditemukan titik koordinat GPS (trkpt/wpt) dalam file GPX.");
    }
  }

  const points: GPSPoint[] = [];
  let totalHr = 0;
  let hrCount = 0;
  let maxHr = 0;
  let totalCad = 0;
  let cadCount = 0;

  const baseTimestamp = Date.now();

  trkpts.forEach((pt, index) => {
    const latStr = pt.getAttribute("lat");
    const lonStr = pt.getAttribute("lon") || pt.getAttribute("lng");
    if (!latStr || !lonStr) return;

    const lat = parseFloat(latStr);
    const lng = parseFloat(lonStr);

    const eleNode = pt.querySelector("ele");
    const altitude = eleNode?.textContent ? parseFloat(eleNode.textContent) : undefined;

    const timeNode = pt.querySelector("time");
    let timestamp = baseTimestamp + index * 1000;
    if (timeNode?.textContent) {
      const parsedTime = Date.parse(timeNode.textContent);
      if (!isNaN(parsedTime)) {
        timestamp = parsedTime;
      }
    }

    // Heart rate extensions (Garmin gpxtpx:hr or ns3:hr)
    const hrNode = pt.querySelector("hr, gpxtpx\\:hr, TrackPointExtension > hr");
    let heartRate: number | undefined;
    if (hrNode?.textContent) {
      const hrVal = parseInt(hrNode.textContent, 10);
      if (!isNaN(hrVal) && hrVal > 30 && hrVal < 240) {
        heartRate = hrVal;
        totalHr += hrVal;
        hrCount++;
        if (hrVal > maxHr) maxHr = hrVal;
      }
    }

    // Cadence extensions
    const cadNode = pt.querySelector("cad, gpxtpx\\:cad, TrackPointExtension > cad");
    let cadence: number | undefined;
    if (cadNode?.textContent) {
      const cadVal = parseInt(cadNode.textContent, 10);
      if (!isNaN(cadVal) && cadVal > 0) {
        cadence = cadVal;
        totalCad += cadVal;
        cadCount++;
      }
    }

    points.push({
      lat,
      lng,
      altitude: altitude !== undefined && !isNaN(altitude) ? altitude : null,
      elevation: altitude !== undefined && !isNaN(altitude) ? altitude : null,
      timestamp,
      heartRate,
      cadence
    });
  });

  if (points.length < 2) {
    throw new Error("File GPX harus memiliki minimal 2 titik pelacakan GPS.");
  }

  // Calculate cumulative distance and metrics
  let totalDistanceM = 0;
  let maxSpeedKmh = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dMeters = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    totalDistanceM += dMeters;

    const dtSec = (p2.timestamp - p1.timestamp) / 1000;
    if (dtSec > 0.5) {
      const speedKmh = (dMeters / dtSec) * 3.6;
      if (speedKmh > maxSpeedKmh && speedKmh < 120) {
        maxSpeedKmh = speedKmh;
      }
    }
  }

  const distanceKm = Number((totalDistanceM / 1000).toFixed(2));
  const startTime = new Date(points[0].timestamp).toISOString();
  const endTime = new Date(points[points.length - 1].timestamp).toISOString();
  const durationSec = Math.max(1, Math.round((points[points.length - 1].timestamp - points[0].timestamp) / 1000));

  const avgSpeedKmh = durationSec > 0 ? Number(((distanceKm / (durationSec / 3600))).toFixed(1)) : 0;
  const avgPaceMinPerKm = distanceKm > 0 ? Number(((durationSec / 60) / distanceKm).toFixed(2)) : 0;
  const elevationGainM = calculateElevationGain(points);
  const caloriesKcal = calculateCalories(sportType, durationSec, 70, avgSpeedKmh);
  const splits = calculateSplits(points, 1.0);

  return {
    title,
    sportType,
    points,
    distanceKm,
    durationSec,
    elevationGainM,
    avgSpeedKmh,
    maxSpeedKmh: Number(maxSpeedKmh.toFixed(1)),
    avgPaceMinPerKm,
    caloriesKcal,
    avgHeartRate: hrCount > 0 ? Math.round(totalHr / hrCount) : undefined,
    maxHeartRate: maxHr > 0 ? maxHr : undefined,
    cadence: cadCount > 0 ? Math.round(totalCad / cadCount) : undefined,
    startTime,
    endTime,
    splits
  };
}

/**
 * Parse TCX (Garmin Training Center XML) files
 */
export function parseTCX(xmlContent: string): ParsedGpxData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

  const trkpts = xmlDoc.querySelectorAll("Trackpoint");
  if (trkpts.length < 2) {
    throw new Error("File TCX tidak memiliki cukup titik koordinat Trackpoint.");
  }

  const points: GPSPoint[] = [];
  let totalHr = 0;
  let hrCount = 0;
  let maxHr = 0;
  let totalCad = 0;
  let cadCount = 0;

  trkpts.forEach((pt, idx) => {
    const latNode = pt.querySelector("Position > LatitudeDegrees");
    const lngNode = pt.querySelector("Position > LongitudeDegrees");
    if (!latNode || !lngNode) return;

    const lat = parseFloat(latNode.textContent || "0");
    const lng = parseFloat(lngNode.textContent || "0");

    const altNode = pt.querySelector("AltitudeMeters");
    const altitude = altNode ? parseFloat(altNode.textContent || "0") : undefined;

    const timeNode = pt.querySelector("Time");
    const timestamp = timeNode?.textContent ? Date.parse(timeNode.textContent) : Date.now() + idx * 1000;

    const hrNode = pt.querySelector("HeartRateBpm > Value");
    let heartRate: number | undefined;
    if (hrNode?.textContent) {
      const hrVal = parseInt(hrNode.textContent, 10);
      if (!isNaN(hrVal) && hrVal > 30) {
        heartRate = hrVal;
        totalHr += hrVal;
        hrCount++;
        if (hrVal > maxHr) maxHr = hrVal;
      }
    }

    const cadNode = pt.querySelector("Cadence");
    let cadence: number | undefined;
    if (cadNode?.textContent) {
      const cadVal = parseInt(cadNode.textContent, 10);
      if (!isNaN(cadVal) && cadVal > 0) {
        cadence = cadVal;
        totalCad += cadVal;
        cadCount++;
      }
    }

    points.push({
      lat,
      lng,
      altitude: altitude !== undefined ? altitude : null,
      elevation: altitude !== undefined ? altitude : null,
      timestamp,
      heartRate,
      cadence
    });
  });

  if (points.length < 2) {
    throw new Error("Gagal mengekstrak koordinat dari file TCX.");
  }

  let totalDistanceM = 0;
  let maxSpeedKmh = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dMeters = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    totalDistanceM += dMeters;

    const dtSec = (p2.timestamp - p1.timestamp) / 1000;
    if (dtSec > 0.5) {
      const speedKmh = (dMeters / dtSec) * 3.6;
      if (speedKmh > maxSpeedKmh && speedKmh < 120) {
        maxSpeedKmh = speedKmh;
      }
    }
  }

  const distanceKm = Number((totalDistanceM / 1000).toFixed(2));
  const startTime = new Date(points[0].timestamp).toISOString();
  const endTime = new Date(points[points.length - 1].timestamp).toISOString();
  const durationSec = Math.max(1, Math.round((points[points.length - 1].timestamp - points[0].timestamp) / 1000));
  const avgSpeedKmh = durationSec > 0 ? Number(((distanceKm / (durationSec / 3600))).toFixed(1)) : 0;
  const avgPaceMinPerKm = distanceKm > 0 ? Number(((durationSec / 60) / distanceKm).toFixed(2)) : 0;
  const elevationGainM = calculateElevationGain(points);
  const caloriesKcal = calculateCalories("Running", durationSec, 70, avgSpeedKmh);
  const splits = calculateSplits(points, 1.0);

  return {
    title: "Garmin TCX Activity",
    sportType: "Running",
    points,
    distanceKm,
    durationSec,
    elevationGainM,
    avgSpeedKmh,
    maxSpeedKmh: Number(maxSpeedKmh.toFixed(1)),
    avgPaceMinPerKm,
    caloriesKcal,
    avgHeartRate: hrCount > 0 ? Math.round(totalHr / hrCount) : undefined,
    maxHeartRate: maxHr > 0 ? maxHr : undefined,
    cadence: cadCount > 0 ? Math.round(totalCad / cadCount) : undefined,
    startTime,
    endTime,
    splits
  };
}

/**
 * Export any SPORTIVA activity into standard RFC-compliant GPX 1.1 file
 */
export function exportToGPX(activity: Activity): void {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SPORTIVA Athletic OS - https://sportiva.app"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(activity.title)}</name>
    <desc>${escapeXml(activity.caption || "SPORTIVA Recorded Activity")}</desc>
    <time>${activity.startTime}</time>
  </metadata>
  <trk>
    <name>${escapeXml(activity.title)}</name>
    <type>${activity.sportType}</type>
    <trkseg>`;

  const pointsXml = activity.routePoints.map(pt => {
    const timeIso = new Date(pt.timestamp).toISOString();
    const eleTag = pt.altitude !== null && pt.altitude !== undefined ? `\n        <ele>${pt.altitude.toFixed(1)}</ele>` : "";
    const hrTag = pt.heartRate ? `\n          <gpxtpx:TrackPointExtension><gpxtpx:hr>${pt.heartRate}</gpxtpx:hr></gpxtpx:TrackPointExtension>` : "";
    const extTag = hrTag ? `\n        <extensions>${hrTag}\n        </extensions>` : "";

    return `      <trkpt lat="${pt.lat.toFixed(6)}" lon="${pt.lng.toFixed(6)}">${eleTag}\n        <time>${timeIso}</time>${extTag}\n      </trkpt>`;
  }).join("\n");

  const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`;

  const fullGpx = `${gpxHeader}\n${pointsXml}${gpxFooter}`;
  const blob = new Blob([fullGpx], { type: "application/gpx+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${activity.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
