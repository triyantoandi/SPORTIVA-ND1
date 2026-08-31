import React, { useEffect, useRef, useState, useMemo } from "react";
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Video, 
  Download, 
  Camera, 
  Volume2, 
  VolumeX, 
  Layers, 
  Compass, 
  Maximize2, 
  Sparkles, 
  Zap, 
  Mountain, 
  Clock, 
  Gauge, 
  CheckCircle2,
  Film
} from "lucide-react";
import { Activity, GPSPoint } from "../../types";
import { formatDistance, formatDuration, formatPace } from "../../utils/formatters";
import { soundFX } from "../../utils/audioFx";

interface RouteFlyover3DModalProps {
  activity: Activity | null;
  onClose: () => void;
}

type AspectRatio = "9:16" | "1:1" | "16:9";
type CameraMode = "chase" | "orbit" | "topdown" | "isometric";
type ThemeMode = "cyber" | "sunset" | "alpine" | "clean";

interface Milestone {
  index: number;
  type: "start" | "finish" | "km" | "max_speed" | "max_elev";
  label: string;
  sublabel?: string;
  point: GPSPoint;
  distanceKm: number;
}

export const RouteFlyover3DModal: React.FC<RouteFlyover3DModalProps> = ({ activity, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0); // 0.0 to 1.0
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2); // 1x, 2x, 4x, 8x
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [cameraMode, setCameraMode] = useState<CameraMode>("chase");
  const [themeMode, setThemeMode] = useState<ThemeMode>("cyber");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);

  // Video Export Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Animation Loop Refs
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const progressRef = useRef<number>(0);
  const cameraAngleRef = useRef<number>(0);

  // Normalize and validate route points
  const rawPoints = useMemo(() => {
    if (!activity) return [];
    if (activity.routePoints && activity.routePoints.length >= 2) {
      return activity.routePoints;
    }
    // Fallback: Synthesize mock athletic route if routePoints empty
    const baseLat = -7.7956;
    const baseLng = 110.3695;
    const dist = activity.distanceKm || 5.0;
    const count = 60;
    const pts: GPSPoint[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = (dist / 20) * (0.8 + 0.2 * Math.sin(t * 3));
      pts.push({
        lat: baseLat + Math.sin(t) * r * 0.08,
        lng: baseLng + Math.cos(t) * r * 0.08 + (i * 0.0005),
        elevation: 120 + Math.sin(t * 2) * 35 + Math.cos(t * 4) * 15,
        speed: 10 + Math.sin(t * 3) * 4 + Math.random() * 2,
        heartRate: 145 + Math.floor(Math.sin(t) * 25),
        timestamp: (activity.createdAt || Date.now()) + i * 30000
      });
    }
    return pts;
  }, [activity]);

  // Generate Milestones (KM splits, max speed, peak elevation)
  const milestones = useMemo<Milestone[]>(() => {
    if (!rawPoints || rawPoints.length < 2) return [];
    const list: Milestone[] = [];
    
    // Start
    list.push({
      index: 0,
      type: "start",
      label: "START",
      sublabel: "0.00 KM",
      point: rawPoints[0],
      distanceKm: 0
    });

    // Find max speed & peak elevation points
    let maxSpeed = -1;
    let maxSpeedIdx = 0;
    let maxElev = -9999;
    let maxElevIdx = 0;

    rawPoints.forEach((p, idx) => {
      if ((p.speed || 0) > maxSpeed) {
        maxSpeed = p.speed || 0;
        maxSpeedIdx = idx;
      }
      if ((p.elevation || 0) > maxElev) {
        maxElev = p.elevation || 0;
        maxElevIdx = idx;
      }
    });

    // KM Splits
    const totalDist = activity?.distanceKm || 5.0;
    const numKm = Math.floor(totalDist);
    for (let k = 1; k <= numKm; k++) {
      const idx = Math.min(
        rawPoints.length - 1,
        Math.floor((k / totalDist) * (rawPoints.length - 1))
      );
      list.push({
        index: idx,
        type: "km",
        label: `KM ${k}`,
        sublabel: activity?.splits?.[k - 1] ? `${formatPace(activity.splits[k - 1].paceMinPerKm)}/km` : "Split",
        point: rawPoints[idx],
        distanceKm: k
      });
    }

    if (maxSpeedIdx > 0 && maxSpeedIdx < rawPoints.length - 1 && maxSpeed > 12) {
      list.push({
        index: maxSpeedIdx,
        type: "max_speed",
        label: "TOP SPEED",
        sublabel: `${(maxSpeed * (activity?.sportType === 'Cycling' ? 1 : 1)).toFixed(1)} km/h`,
        point: rawPoints[maxSpeedIdx],
        distanceKm: (maxSpeedIdx / rawPoints.length) * totalDist
      });
    }

    if (maxElevIdx > 0 && maxElevIdx < rawPoints.length - 1) {
      list.push({
        index: maxElevIdx,
        type: "max_elev",
        label: "SUMMIT PEAK",
        sublabel: `+${Math.round(maxElev)}m Alt`,
        point: rawPoints[maxElevIdx],
        distanceKm: (maxElevIdx / rawPoints.length) * totalDist
      });
    }

    // Finish
    list.push({
      index: rawPoints.length - 1,
      type: "finish",
      label: "FINISH LINE",
      sublabel: `${formatDistance(activity?.distanceKm || 0)} KM`,
      point: rawPoints[rawPoints.length - 1],
      distanceKm: activity?.distanceKm || 0
    });

    return list;
  }, [rawPoints, activity]);

  // Sync mute with soundFX
  useEffect(() => {
    soundFX.setMuted(isMuted);
  }, [isMuted]);

  // Pre-calculate Bounding Box & Normalized 2D/3D points
  const normalizedPoints = useMemo(() => {
    if (rawPoints.length === 0) return [];
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let minElev = Infinity, maxElev = -Infinity;

    rawPoints.forEach(p => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
      const el = p.elevation || 100;
      if (el < minElev) minElev = el;
      if (el > maxElev) maxElev = el;
    });

    const latSpan = Math.max(maxLat - minLat, 0.0001);
    const lngSpan = Math.max(maxLng - minLng, 0.0001);
    const elevSpan = Math.max(maxElev - minElev, 10);

    return rawPoints.map(p => ({
      x: ((p.lng - minLng) / lngSpan - 0.5) * 800,
      y: -((p.lat - minLat) / latSpan - 0.5) * 800,
      z: (((p.elevation || 100) - minElev) / elevSpan) * 160,
      speed: p.speed || 10,
      heartRate: p.heartRate || 150,
      orig: p
    }));
  }, [rawPoints]);

  // Current interpolated runner metrics based on progress
  const currentMetrics = useMemo(() => {
    if (normalizedPoints.length === 0 || !activity) {
      return { distKm: 0, pace: "0:00", speedKmh: 0, elevM: 0, hr: 140, timeSec: 0 };
    }
    const totalCount = normalizedPoints.length;
    const exactIdx = progressRef.current * (totalCount - 1);
    const idx0 = Math.floor(exactIdx);
    const idx1 = Math.min(totalCount - 1, idx0 + 1);
    const fract = exactIdx - idx0;

    const p0 = normalizedPoints[idx0];
    const p1 = normalizedPoints[idx1];

    const currentDist = (activity.distanceKm || 5.0) * progressRef.current;
    const currentDuration = (activity.durationSec || 1800) * progressRef.current;
    const currentSpeed = p0.speed * (1 - fract) + p1.speed * fract;
    const currentElev = (p0.orig.elevation || 100) * (1 - fract) + (p1.orig.elevation || 100) * fract;
    const currentHr = Math.round(p0.heartRate * (1 - fract) + p1.heartRate * fract);

    // Calculate instantaneous pace
    const paceMinKm = currentSpeed > 1 ? 60 / currentSpeed : activity.avgPaceMinPerKm;

    return {
      distKm: currentDist,
      pace: formatPace(paceMinKm),
      speedKmh: currentSpeed,
      elevM: Math.round(currentElev),
      hr: currentHr,
      timeSec: Math.round(currentDuration)
    };
  }, [normalizedPoints, playbackProgress, activity]);

  // Main 3D Canvas Rendering Engine
  const renderFrame = (progress: number, cameraAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || normalizedPoints.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background Gradient Themes
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (themeMode === "cyber") {
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(0.5, "#0b1222");
      bgGrad.addColorStop(1, "#030712");
    } else if (themeMode === "sunset") {
      bgGrad.addColorStop(0, "#1f0d26");
      bgGrad.addColorStop(0.4, "#3b1732");
      bgGrad.addColorStop(0.8, "#180e29");
      bgGrad.addColorStop(1, "#0b0514");
    } else if (themeMode === "alpine") {
      bgGrad.addColorStop(0, "#081c15");
      bgGrad.addColorStop(0.5, "#1b4332");
      bgGrad.addColorStop(1, "#081c15");
    } else {
      // Clean Minimalist
      bgGrad.addColorStop(0, "#f8fafc");
      bgGrad.addColorStop(0.5, "#f1f5f9");
      bgGrad.addColorStop(1, "#e2e8f0");
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 3D Perspective Projection Setup
    const totalPoints = normalizedPoints.length;
    const currentFloatIdx = progress * (totalPoints - 1);
    const currIdx = Math.floor(currentFloatIdx);
    const currFract = currentFloatIdx - currIdx;
    const nextIdx = Math.min(totalPoints - 1, currIdx + 1);

    const currPos = {
      x: normalizedPoints[currIdx].x * (1 - currFract) + normalizedPoints[nextIdx].x * currFract,
      y: normalizedPoints[currIdx].y * (1 - currFract) + normalizedPoints[nextIdx].y * currFract,
      z: normalizedPoints[currIdx].z * (1 - currFract) + normalizedPoints[nextIdx].z * currFract
    };

    // Calculate heading (tangent of movement)
    const dx = normalizedPoints[nextIdx].x - normalizedPoints[currIdx].x;
    const dy = normalizedPoints[nextIdx].y - normalizedPoints[currIdx].y;
    const heading = Math.atan2(dy, dx);

    // Camera dynamic rotation based on mode
    let camYaw = 0;
    let camPitch = 0.85; // ~48 deg tilt
    let camDist = 380;
    let camFov = 450;

    if (cameraMode === "chase") {
      camYaw = heading - Math.PI / 2 + Math.sin(cameraAngle * 0.5) * 0.15;
      camPitch = 0.95;
      camDist = 320;
    } else if (cameraMode === "orbit") {
      camYaw = cameraAngle;
      camPitch = 0.8;
      camDist = 420;
    } else if (cameraMode === "topdown") {
      camYaw = 0;
      camPitch = 0.15;
      camDist = 650;
      camFov = 650;
    } else if (cameraMode === "isometric") {
      camYaw = Math.PI / 4;
      camPitch = 0.75;
      camDist = 480;
    }

    // 3D Projector function (World XYZ -> Screen XY with depth)
    const project = (x: number, y: number, z: number) => {
      // Translate relative to camera target (smooth tracking around athlete)
      const relX = x - currPos.x;
      const relY = y - currPos.y;
      const relZ = z - currPos.z;

      // Rotate around Yaw (Z-axis)
      const cosYaw = Math.cos(camYaw);
      const sinYaw = Math.sin(camYaw);
      const rx = relX * cosYaw - relY * sinYaw;
      const ry = relX * sinYaw + relY * cosYaw;

      // Rotate around Pitch (X-axis)
      const cosPitch = Math.cos(camPitch);
      const sinPitch = Math.sin(camPitch);
      const py = ry * cosPitch - relZ * sinPitch;
      const pz = ry * sinPitch + relZ * cosPitch + camDist;

      // Perspective divide
      const scale = camFov / Math.max(pz, 40);
      const screenX = width / 2 + rx * scale;
      const screenY = height / 2 + py * scale;

      return { x: screenX, y: screenY, z: pz, scale, visible: pz > 10 };
    };

    // 1. Draw 3D Ground Contour Grid & Shadow Matrix
    ctx.save();
    ctx.lineWidth = 1;
    const gridCols = themeMode === "clean" ? "rgba(100, 116, 139, 0.15)" : "rgba(255, 255, 255, 0.05)";
    ctx.strokeStyle = gridCols;

    const gridSize = 140;
    const gridRadius = 4;
    const centerGridX = Math.floor(currPos.x / gridSize) * gridSize;
    const centerGridY = Math.floor(currPos.y / gridSize) * gridSize;

    for (let gx = -gridRadius; gx <= gridRadius; gx++) {
      const worldX = centerGridX + gx * gridSize;
      const pStart = project(worldX, centerGridY - gridRadius * gridSize, -10);
      const pEnd = project(worldX, centerGridY + gridRadius * gridSize, -10);
      if (pStart.visible && pEnd.visible) {
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }
    }
    for (let gy = -gridRadius; gy <= gridRadius; gy++) {
      const worldY = centerGridY + gy * gridSize;
      const pStart = project(centerGridX - gridRadius * gridSize, worldY, -10);
      const pEnd = project(centerGridX + gridRadius * gridSize, worldY, -10);
      if (pStart.visible && pEnd.visible) {
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Draw Full Ghost Track (Inactive Full Route)
    ctx.save();
    ctx.beginPath();
    let ghostStarted = false;
    for (let i = 0; i < totalPoints; i++) {
      const pt = normalizedPoints[i];
      const p = project(pt.x, pt.y, pt.z);
      if (p.visible) {
        if (!ghostStarted) {
          ctx.moveTo(p.x, p.y);
          ghostStarted = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = themeMode === "clean" ? "rgba(148, 163, 184, 0.3)" : "rgba(255, 255, 255, 0.15)";
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Draw 3D Elevation Ribbon Wall (Extruded vertical wall below completed track)
    const activeCount = Math.max(2, Math.floor(currentFloatIdx) + 1);
    ctx.save();
    for (let i = 0; i < activeCount - 1; i++) {
      const ptA = normalizedPoints[i];
      const ptB = normalizedPoints[i + 1];

      const topA = project(ptA.x, ptA.y, ptA.z);
      const topB = project(ptB.x, ptB.y, ptB.z);
      const botA = project(ptA.x, ptA.y, -10);
      const botB = project(ptB.x, ptB.y, -10);

      if (topA.visible && topB.visible && botA.visible && botB.visible) {
        ctx.beginPath();
        ctx.moveTo(topA.x, topA.y);
        ctx.lineTo(topB.x, topB.y);
        ctx.lineTo(botB.x, botB.y);
        ctx.lineTo(botA.x, botA.y);
        ctx.closePath();

        const ribbonGrad = ctx.createLinearGradient(0, topA.y, 0, botA.y);
        if (themeMode === "cyber") {
          ribbonGrad.addColorStop(0, "rgba(249, 115, 22, 0.45)");
          ribbonGrad.addColorStop(1, "rgba(6, 182, 212, 0.02)");
        } else if (themeMode === "sunset") {
          ribbonGrad.addColorStop(0, "rgba(236, 72, 153, 0.5)");
          ribbonGrad.addColorStop(1, "rgba(245, 158, 11, 0.02)");
        } else if (themeMode === "alpine") {
          ribbonGrad.addColorStop(0, "rgba(16, 185, 129, 0.5)");
          ribbonGrad.addColorStop(1, "rgba(20, 83, 45, 0.02)");
        } else {
          ribbonGrad.addColorStop(0, "rgba(249, 115, 22, 0.35)");
          ribbonGrad.addColorStop(1, "rgba(249, 115, 22, 0.02)");
        }
        ctx.fillStyle = ribbonGrad;
        ctx.fill();
      }
    }
    ctx.restore();

    // 4. Draw Glowing Active GPS Path (Neon Polyline)
    ctx.save();
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < activeCount; i++) {
      const pt = normalizedPoints[i];
      const p = project(pt.x, pt.y, pt.z);
      if (p.visible) {
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }
    // Add current fractional head
    const currScreenPos = project(currPos.x, currPos.y, currPos.z);
    if (currScreenPos.visible && started) {
      ctx.lineTo(currScreenPos.x, currScreenPos.y);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Glow layers
    if (themeMode !== "clean") {
      ctx.shadowBlur = 16;
      ctx.shadowColor = themeMode === "sunset" ? "#ec4899" : themeMode === "alpine" ? "#10b981" : "#f97316";
    }

    ctx.lineWidth = 6;
    ctx.strokeStyle = themeMode === "sunset" ? "#ec4899" : themeMode === "alpine" ? "#10b981" : "#f97316";
    ctx.stroke();

    // Core bright neon center line
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();

    // 5. Draw Milestones along the route (Start, Finish, KM markers)
    milestones.forEach(m => {
      const pt = normalizedPoints[m.index];
      if (!pt) return;
      const p = project(pt.x, pt.y, pt.z);
      const isPassed = m.index <= currIdx;
      if (!p.visible) return;

      ctx.save();
      // Drop line to ground
      const pGround = project(pt.x, pt.y, -10);
      if (pGround.visible) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pGround.x, pGround.y);
        ctx.strokeStyle = isPassed ? "rgba(249, 115, 22, 0.4)" : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Pin Bubble
      const pinSize = Math.max(12, 18 * p.scale);
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10, pinSize, 0, Math.PI * 2);
      ctx.fillStyle = m.type === "start" ? "#10b981" : m.type === "finish" ? "#ef4444" : m.type === "max_speed" ? "#06b6d4" : "#f97316";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Pin Text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(9, Math.floor(10 * p.scale))}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const shortText = m.type === "start" ? "🚩" : m.type === "finish" ? "🏁" : m.type === "max_speed" ? "⚡" : m.type === "max_elev" ? "🏔️" : `${m.distanceKm}K`;
      ctx.fillText(shortText, p.x, p.y - 10);

      // Label card on top
      if (p.scale > 0.6) {
        ctx.font = `bold ${Math.max(10, Math.floor(11 * p.scale))}px Inter, sans-serif`;
        ctx.fillStyle = themeMode === "clean" ? "#0f172a" : "#ffffff";
        ctx.fillText(m.label, p.x, p.y - 10 - pinSize - 6);
        if (m.sublabel) {
          ctx.font = `normal ${Math.max(8, Math.floor(9 * p.scale))}px Inter, sans-serif`;
          ctx.fillStyle = themeMode === "clean" ? "#64748b" : "#94a3b8";
          ctx.fillText(m.sublabel, p.x, p.y - 10 - pinSize + 6);
        }
      }
      ctx.restore();
    });

    // 6. Draw 3D Athlete Drone / Moving Beacon Marker at current position
    if (currScreenPos.visible) {
      ctx.save();
      // Drop Shadow on ground
      const groundPos = project(currPos.x, currPos.y, -10);
      if (groundPos.visible) {
        ctx.beginPath();
        ctx.ellipse(groundPos.x, groundPos.y, 14 * groundPos.scale, 6 * groundPos.scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fill();
      }

      // Pulsing Radar Rings
      const pulseRadius = (16 + (Date.now() % 1000) / 40) * currScreenPos.scale;
      ctx.beginPath();
      ctx.arc(currScreenPos.x, currScreenPos.y, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.8 - (Date.now() % 1000) / 1200})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heading Direction Cone
      const coneTip = project(
        currPos.x + Math.cos(heading) * 30,
        currPos.y + Math.sin(heading) * 30,
        currPos.z
      );
      if (coneTip.visible) {
        ctx.beginPath();
        ctx.moveTo(currScreenPos.x, currScreenPos.y);
        ctx.lineTo(coneTip.x, coneTip.y);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Drone Avatar Core Body
      ctx.beginPath();
      ctx.arc(currScreenPos.x, currScreenPos.y, 12 * currScreenPos.scale, 0, Math.PI * 2);
      ctx.fillStyle = "#f97316";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#f97316";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Inner Core
      ctx.beginPath();
      ctx.arc(currScreenPos.x, currScreenPos.y, 5 * currScreenPos.scale, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
    }
  };

  // Animation Loop
  useEffect(() => {
    let lastMilestoneTriggered = -1;

    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying && !isRecording) {
        // Base route animation duration: ~24 seconds at 1x
        const durationSec = 22 / playbackSpeed;
        progressRef.current += delta / durationSec;

        if (progressRef.current >= 1.0) {
          progressRef.current = 1.0;
          setIsPlaying(false);
          soundFX.playFanfare();
        }

        // Camera rotation
        cameraAngleRef.current += delta * 0.4;
        setPlaybackProgress(progressRef.current);

        // Check Milestone trigger for sound effects & banner
        const currMilestone = milestones.find(m => {
          const mProgress = m.index / (normalizedPoints.length - 1);
          return Math.abs(progressRef.current - mProgress) < 0.02;
        });

        if (currMilestone && currMilestone.index !== lastMilestoneTriggered) {
          lastMilestoneTriggered = currMilestone.index;
          setActiveMilestone(currMilestone);
          soundFX.playMilestone();
          setTimeout(() => setActiveMilestone(null), 3000);
        }
      }

      renderFrame(progressRef.current, cameraAngleRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, cameraMode, themeMode, normalizedPoints, milestones, isRecording]);

  // Video Recording Flow (MediaRecorder WebM / MP4)
  const handleStartRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordingProgress(0);
    setRecordedBlobUrl(null);
    recordedChunksRef.current = [];

    // Reset to beginning for clean recording
    progressRef.current = 0;
    cameraAngleRef.current = 0;
    setPlaybackProgress(0);

    if (typeof MediaRecorder === "undefined") {
      alert("Browser/lingkungan ini tidak mendukung MediaRecorder.");
      setIsRecording(false);
      return;
    }

    const stream = canvas.captureStream(60); // 60 FPS
    let mimeType = "video/webm;codecs=vp9";
    try {
      if (typeof MediaRecorder.isTypeSupported === "function" && !MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
    } catch (e) {
      mimeType = "video/webm";
    }

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000 // 6 Mbps high quality
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setIsRecording(false);
        soundFX.playFanfare();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);

      // Programmatic recording loop (exact 18 seconds record duration)
      const recordTotalDurationSec = 16;
      let recordTime = 0;
      const recordIntervalMs = 1000 / 60;

      const recordTimer = setInterval(() => {
        recordTime += recordIntervalMs / 1000;
        const progress = Math.min(1.0, recordTime / recordTotalDurationSec);
        progressRef.current = progress;
        cameraAngleRef.current += 0.02;
        setPlaybackProgress(progress);
        setRecordingProgress(Math.round(progress * 100));

        renderFrame(progress, cameraAngleRef.current);

        if (progress >= 1.0) {
          clearInterval(recordTimer);
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }
      }, recordIntervalMs);

    } catch (err) {
      console.error("Recording error:", err);
      setIsRecording(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedBlobUrl || !activity) return;
    const a = document.createElement("a");
    a.href = recordedBlobUrl;
    a.download = `SPORTIVA_3D_Flyover_${activity.title.replace(/\s+/g, "_")}.webm`;
    a.click();
  };

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activity) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `SPORTIVA_3D_Poster_${activity.distanceKm}KM.png`;
    a.click();
    soundFX.playMilestone();
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    progressRef.current = val;
    setPlaybackProgress(val);
    renderFrame(val, cameraAngleRef.current);
  };

  const handleRestart = () => {
    progressRef.current = 0;
    setPlaybackProgress(0);
    setIsPlaying(true);
    soundFX.playWhoosh();
  };

  if (!activity) return null;

  // Aspect ratio canvas sizing
  const canvasWidth = aspectRatio === "9:16" ? 720 : aspectRatio === "1:1" ? 800 : 1280;
  const canvasHeight = aspectRatio === "9:16" ? 1280 : aspectRatio === "1:1" ? 800 : 720;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base font-display">SPORTIVA 3D Route Flyover</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Relive 3D
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activity.title} • {formatDistance(activity.distanceKm)} KM {activity.sportType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left / Center: Interactive 3D Video Canvas & HUD */}
          <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Aspect Ratio Sized Canvas Frame */}
            <div 
              ref={containerRef}
              className={`relative rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-950 flex items-center justify-center transition-all ${
                aspectRatio === "9:16" ? "h-[480px] sm:h-[540px] aspect-[9/16]" : aspectRatio === "1:1" ? "h-[420px] sm:h-[480px] aspect-square" : "w-full aspect-video"
              }`}
            >
              {/* Native HTML5 3D Render Canvas */}
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-full object-cover"
              />

              {/* Dynamic HUD Overlays (Top: Athlete Badge & Sportiva Watermark) */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg">
                  <img
                    src={activity.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                    alt={activity.userName}
                    className="w-7 h-7 rounded-full object-cover border border-orange-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{activity.userName}</div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-1 font-mono-sport">
                      <span>{activity.sportType}</span> • <span>{formatDistance(activity.distanceKm)} KM</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-white border border-white/20 uppercase">
                  SPORTIVA 3D
                </div>
              </div>

              {/* Dynamic Milestone Popover Banner */}
              {activeMilestone && (
                <div className="absolute top-20 inset-x-6 flex justify-center pointer-events-none animate-bounce">
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-2 rounded-2xl shadow-2xl border border-white/30 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider">{activeMilestone.label}</div>
                      {activeMilestone.sublabel && (
                        <div className="text-[11px] font-medium text-orange-100">{activeMilestone.sublabel}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic HUD Overlays (Bottom Strip: Live Odometer & Speedometer) */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-xl grid grid-cols-4 gap-2 text-white pointer-events-none">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Distance</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono-sport text-orange-400">
                    {currentMetrics.distKm.toFixed(2)} <span className="text-[10px] text-slate-300">KM</span>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Pace</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono-sport">
                    {currentMetrics.pace} <span className="text-[10px] text-slate-400">/km</span>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Altitude</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono-sport text-emerald-400">
                    {currentMetrics.elevM} <span className="text-[10px] text-slate-300">m</span>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Elapsed</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono-sport text-cyan-300">
                    {formatDuration(currentMetrics.timeSec)}
                  </div>
                </div>
              </div>

              {/* Recording Overlay Indicator */}
              {isRecording && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-30">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
                      {recordingProgress}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold flex items-center gap-2 justify-center text-orange-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      Merekam 3D Relive Video...
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Menggabungkan 60 FPS flight camera & HUD metrics</p>
                  </div>
                </div>
              )}
            </div>

            {/* Playback Scrubbing Bar */}
            <div className="w-full mt-4 flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md shadow-orange-600/20"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                title="Restart Flyover"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={playbackProgress}
                onChange={handleScrub}
                className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="text-xs font-mono-sport font-bold text-slate-300 min-w-[70px] text-right">
                {Math.round(playbackProgress * 100)}% Complete
              </div>
            </div>
          </div>

          {/* Right Sidebar: Camera, Themes, Aspect Ratio & Export Controls */}
          <div className="lg:col-span-4 p-5 space-y-5 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 overflow-y-auto">
            
            {/* Speed Multiplier & SFX Audio */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Flight Speed</span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{isMuted ? "SFX Muted" : "SFX Active"}</span>
                </button>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      playbackSpeed === spd
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Camera View Angle Modes */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-orange-500" />
                <span>3D Camera Flight Mode</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "chase", label: "Drone Chase", icon: Zap },
                  { id: "orbit", label: "3D Orbit", icon: RotateCcw },
                  { id: "isometric", label: "Isometric 2.5D", icon: Layers },
                  { id: "topdown", label: "Bird's Eye Topo", icon: Mountain },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCameraMode(item.id as CameraMode)}
                      className={`p-2.5 rounded-2xl text-left border transition-all flex items-center gap-2 ${
                        cameraMode === item.id
                          ? "bg-orange-500/10 border-orange-500 text-orange-400"
                          : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Sky & Terrain Theme */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Terrain & Sky Atmosphere</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cyber", label: "Cyber Dark Neon", color: "bg-cyan-500" },
                  { id: "sunset", label: "Sunset Glow", color: "bg-pink-500" },
                  { id: "alpine", label: "Alpine Satellite", color: "bg-emerald-500" },
                  { id: "clean", label: "Clean Studio", color: "bg-slate-300" },
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id as ThemeMode)}
                    className={`p-2.5 rounded-2xl text-left border transition-all flex items-center gap-2 ${
                      themeMode === theme.id
                        ? "bg-slate-800 border-orange-500 text-white shadow-sm"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${theme.color}`} />
                    <span className="text-xs font-bold truncate">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Switcher (Story vs Feed vs Cinema) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-orange-500" />
                <span>Aspect Ratio (Video Format)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "9:16", label: "9:16 Story" },
                  { id: "1:1", label: "1:1 Square" },
                  { id: "16:9", label: "16:9 Cinema" },
                ].map(ar => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as AspectRatio)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      aspectRatio === ar.id
                        ? "bg-orange-500 text-white border-orange-400"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export & Download Action Buttons */}
            <div className="pt-2 space-y-2.5 border-t border-slate-800">
              {recordedBlobUrl ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Video 3D Siap Diunduh!
                  </div>
                  <button
                    onClick={handleDownloadVideo}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Download className="w-4 h-4" /> Unduh Video (.webm)
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartRecording}
                  disabled={isRecording}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20 transition-all disabled:opacity-50"
                >
                  <Video className="w-4 h-4" /> Rekam & Ekspor Video 3D
                </button>
              )}

              <button
                onClick={handleSnapshot}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Camera className="w-4 h-4 text-orange-400" /> Simpan Poster 3D HD (.png)
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
