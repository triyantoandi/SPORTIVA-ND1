import { formatDistanceToNow, format, parseISO } from "date-fns";

export function formatDuration(seconds: number, detailed: boolean = false): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (detailed) {
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  const paddedMins = mins.toString().padStart(2, "0");
  const paddedSecs = secs.toString().padStart(2, "0");

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}

export function formatPace(paceMinPerKm: number): string {
  if (isNaN(paceMinPerKm) || !isFinite(paceMinPerKm) || paceMinPerKm <= 0 || paceMinPerKm > 60) {
    return "--:--";
  }
  const mins = Math.floor(paceMinPerKm);
  const secs = Math.round((paceMinPerKm - mins) * 60);
  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${paddedSecs}`;
}

export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm) || distanceKm < 0) return "0.00";
  return distanceKm.toFixed(2);
}

export function formatSpeed(speedKmh: number): string {
  if (isNaN(speedKmh) || speedKmh < 0) return "0.0";
  return speedKmh.toFixed(1);
}

export function formatCalories(kcal: number): string {
  return Math.round(kcal || 0).toLocaleString();
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters || 0)} m`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Recently";
  }
}

export function formatFullDate(dateString: string): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    return format(date, "EEEE, d MMMM yyyy • HH:mm");
  } catch {
    return dateString;
  }
}

export function getHeartRateZone(hr: number, maxHr: number = 190): { zone: number; label: string; color: string } {
  const pct = hr / maxHr;
  if (pct < 0.6) return { zone: 1, label: "Zone 1 (Recovery)", color: "text-blue-400" };
  if (pct < 0.7) return { zone: 2, label: "Zone 2 (Aerobic Base)", color: "text-emerald-400" };
  if (pct < 0.8) return { zone: 3, label: "Zone 3 (Tempo)", color: "text-yellow-400" };
  if (pct < 0.9) return { zone: 4, label: "Zone 4 (Threshold)", color: "text-orange-500" };
  return { zone: 5, label: "Zone 5 (Anaerobic Peak)", color: "text-red-500" };
}
