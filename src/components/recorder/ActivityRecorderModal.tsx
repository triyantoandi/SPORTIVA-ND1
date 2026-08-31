import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Square, 
  X, 
  Flame, 
  Heart, 
  Activity as ActivityIcon, 
  TrendingUp, 
  Lock, 
  Globe, 
  Users, 
  Compass, 
  Zap, 
  Radio, 
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
  Share2,
  Layers,
  Upload
} from "lucide-react";
import confetti from "canvas-confetti";
import { SportType, PrivacyLevel } from "../../types";
import { useGeolocation } from "../../hooks/useGeolocation";
import { LeafletMap } from "../map/LeafletMap";
import { formatDuration, formatPace, formatDistance, getHeartRateZone } from "../../utils/formatters";
import { ActivityService } from "../../firebase/services/activityService";
import { useAuth } from "../../hooks/useAuth";
import { LiveBeaconModal } from "../beacon/LiveBeaconModal";
import { GpxImportModal } from "../gpx/GpxImportModal";

const SPORT_OPTIONS: { type: SportType; icon: string; label: string }[] = [
  { type: "Running", icon: "🏃‍♂️", label: "Running" },
  { type: "Cycling", icon: "🚴‍♂️", label: "Cycling" },
  { type: "Walking", icon: "🚶‍♂️", label: "Walking" },
  { type: "Hiking", icon: "🥾", label: "Hiking" },
  { type: "Trekking", icon: "⛰️", label: "Trekking" },
  { type: "Swimming", icon: "🏊‍♂️", label: "Swimming" },
  { type: "Gym", icon: "🏋️‍♂️", label: "Gym Workout" },
  { type: "HIIT", icon: "⚡", label: "HIIT Cardio" },
  { type: "Badminton", icon: "🏸", label: "Badminton" },
  { type: "Tennis", icon: "🎾", label: "Tennis" },
  { type: "Treadmill", icon: "🏃", label: "Treadmill" },
  { type: "Indoor Cycling", icon: "🚴", label: "Indoor Cycling" }
];

interface ActivityRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivitySaved: (newActivity: any, prBreakEvents: any[]) => void;
}

export const ActivityRecorderModal: React.FC<ActivityRecorderModalProps> = ({
  isOpen,
  onClose,
  onActivitySaved
}) => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<SportType>("Running");
  const [isFinishing, setIsFinishing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pro Features State
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(true);
  const [showBeaconModal, setShowBeaconModal] = useState(false);
  const [showGpxImportModal, setShowGpxImportModal] = useState(false);
  const lastAnnouncedKmRef = useRef(0);

  // Finish Form State
  const [activityTitle, setActivityTitle] = useState("");
  const [activityCaption, setActivityCaption] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [privacy, setPrivacy] = useState<PrivacyLevel>("PUBLIC");
  const [selectedGearId, setSelectedGearId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    trackingState,
    points,
    currentLocation,
    durationSec,
    distanceKm,
    currentSpeedKmh,
    avgSpeedKmh,
    maxSpeedKmh,
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
  } = useGeolocation(selectedSport, 70);

  // Audio Voice Coach Announcements
  const speakText = (text: string) => {
    if (!voiceCoachEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = "id-ID";
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Announce split every 1.0 KM
  useEffect(() => {
    if (trackingState === "recording" && distanceKm >= 1.0) {
      const currentKmInteger = Math.floor(distanceKm);
      if (currentKmInteger > lastAnnouncedKmRef.current) {
        lastAnnouncedKmRef.current = currentKmInteger;
        const mins = Math.floor(avgPaceMinPerKm);
        const secs = Math.round((avgPaceMinPerKm - mins) * 60);
        speakText(`Kilometer ${currentKmInteger} selesai. Pace rata-rata ${mins} menit ${secs} detik per kilometer.`);
      }
    }
  }, [distanceKm, trackingState, avgPaceMinPerKm, voiceCoachEnabled]);

  // Set default title based on time of day
  useEffect(() => {
    if (!activityTitle) {
      const hour = new Date().getHours();
      const timeOfDay = hour < 11 ? "Morning" : hour < 15 ? "Afternoon" : hour < 18 ? "Evening" : "Night";
      setActivityTitle(`${timeOfDay} ${selectedSport}`);
    }
  }, [selectedSport, activityTitle]);

  if (!isOpen) return null;

  const handleStartCountdown = (simulated = false) => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setCountdown(null);
          startTracking(simulated);
          lastAnnouncedKmRef.current = 0;
          speakText(`Memulai sesi ${selectedSport}. GPS aktif.`);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 800);
  };

  const handleFinishPress = () => {
    finishTracking();
    setIsFinishing(true);
    speakText(`Sesi latihan selesai. Total jarak ${distanceKm.toFixed(2)} kilometer.`);
  };

  const handleSaveActivity = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const startTime = new Date(Date.now() - durationSec * 1000).toISOString();
      const endTime = new Date().toISOString();

      const { activity, newPRs } = await ActivityService.saveCompletedActivity({
        sportType: selectedSport,
        title: activityTitle || `${selectedSport} Workout`,
        caption: activityCaption,
        photos: photoUrl ? [photoUrl] : [],
        privacy,
        durationSec: Math.max(durationSec, 1),
        distanceKm,
        avgSpeedKmh,
        maxSpeedKmh: Math.max(maxSpeedKmh, avgSpeedKmh),
        avgPaceMinPerKm,
        elevationGainM,
        caloriesKcal,
        avgHeartRate: heartRate,
        cadence,
        routePoints: points,
        startTime,
        endTime
      });

      if (newPRs.length > 0) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onActivitySaved(activity, newPRs);
      handleCloseModal();
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    cancelTracking();
    setIsFinishing(false);
    setActivityTitle("");
    setActivityCaption("");
    setPhotoUrl("");
    lastAnnouncedKmRef.current = 0;
    onClose();
  };

  const hrZone = getHeartRateZone(heartRate);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center font-bold text-lg">
                {SPORT_OPTIONS.find(s => s.type === selectedSport)?.icon || "🏃‍♂️"}
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  SPORTIVA GPS RECORDER
                  {trackingState === "recording" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {trackingState === "idle" ? "Pilih olahraga & mulai pelacakan" : `${selectedSport} • ${isSimulated ? "Simulated Mode" : "High Precision GPS"}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Coach Toggle */}
              <button
                type="button"
                onClick={() => setVoiceCoachEnabled(!voiceCoachEnabled)}
                className={`p-2 rounded-full border transition-colors ${
                  voiceCoachEnabled 
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/40" 
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
                title={voiceCoachEnabled ? "Audio Voice Coach Aktif (Suara KM Split)" : "Audio Voice Coach Dinonaktifkan"}
              >
                {voiceCoachEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Live Beacon Trigger */}
              <button
                type="button"
                onClick={() => setShowBeaconModal(true)}
                className="p-2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                title="Bagikan Live Beacon Lokasi Darurat"
              >
                <Radio className="w-4 h-4" />
              </button>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Countdown Overlay */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md"
                >
                  <div className="text-8xl font-display font-black text-orange-500 animate-bounce">
                    {countdown}
                  </div>
                  <p className="text-xl font-bold uppercase tracking-widest text-slate-300 mt-4">Bersiap...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* If state is IDLE: Show Sport Selection & Start Controls */}
            {trackingState === "idle" && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                    Pilih Jenis Olahraga
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SPORT_OPTIONS.map(opt => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setSelectedSport(opt.type)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                          selectedSport === opt.type
                            ? "bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-950/30"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <div className="text-sm font-semibold">{opt.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Options Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-orange-400 animate-pulse" />
                      <span className="text-sm font-bold text-white">Sensor & GPS Engine Status</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      GPS Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    SPORTIVA menggunakan High Accuracy Geolocation, Audio Voice Coach (Voice km split), dan Live Beacon untuk keselamatan.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartCountdown(false)}
                      className="flex-1 py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-900/40 transition-all hover:scale-[1.02]"
                    >
                      <Play className="w-6 h-6 fill-white" />
                      START ACTIVITY (GPS)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartCountdown(true)}
                      className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
                      title="Uji coba rute simulasi Alun-Alun Jember tanpa harus berlari di luar ruangan"
                    >
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      Test Demo Simulation
                    </button>
                  </div>
                </div>

                {/* Quick GPX Import Option */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Punya File GPX/TCX dari Garmin atau Strava?</h5>
                      <p className="text-[11px] text-slate-400">Impor langsung file log tanpa perlu merekam manual</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGpxImportModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-orange-400 border border-slate-700"
                  >
                    Impor GPX
                  </button>
                </div>
              </div>
            )}

            {/* If State is RECORDING or PAUSED: Live HUD Dashboard */}
            {(trackingState === "recording" || trackingState === "paused") && (
              <div className="space-y-5">
                {/* Primary Large Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/80 p-5 rounded-3xl border border-slate-800/80 shadow-inner">
                  {/* Distance */}
                  <div className="col-span-2 sm:col-span-1 text-center sm:text-left">
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Distance</div>
                    <div className="text-4xl sm:text-5xl font-display font-extrabold text-white mt-1">
                      {formatDistance(distanceKm)}
                      <span className="text-sm font-normal text-slate-400 ml-1">KM</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-center sm:text-left">
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Time</div>
                    <div className="text-4xl sm:text-5xl font-mono-sport font-extrabold text-orange-400 mt-1">
                      {formatDuration(durationSec)}
                    </div>
                  </div>

                  {/* Pace / Speed */}
                  <div className="text-center sm:text-left">
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      {selectedSport === "Cycling" ? "Speed" : "Pace"}
                    </div>
                    <div className="text-4xl sm:text-5xl font-mono-sport font-extrabold text-white mt-1">
                      {selectedSport === "Cycling" ? avgSpeedKmh.toFixed(1) : formatPace(avgPaceMinPerKm)}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        {selectedSport === "Cycling" ? "km/h" : "/km"}
                      </span>
                    </div>
                  </div>

                  {/* Heart Rate */}
                  <div className="text-center sm:text-left">
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      Heart Rate
                    </div>
                    <div className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-1 flex items-baseline gap-2">
                      {heartRate} <span className="text-xs font-normal text-slate-400">BPM</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${hrZone.color} bg-slate-800`}>
                        Z{hrZone.zone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Stats Strip */}
                <div className={`grid ${selectedSport === "Running" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"} gap-3`}>
                  <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Calories</div>
                      <div className="text-base font-bold font-mono-sport">{caloriesKcal} kcal</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Elevation</div>
                      <div className="text-base font-bold font-mono-sport">+{elevationGainM} m</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <ActivityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Cadence</div>
                      <div className="text-base font-bold font-mono-sport">{cadence} spm</div>
                    </div>
                  </div>

                  {selectedSport === "Running" && (
                    <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Running Power</div>
                        <div className="text-base font-bold font-mono-sport">
                          {Math.round(Math.max(120, avgSpeedKmh > 0 ? (avgSpeedKmh * 21.5 + (elevationGainM > 10 ? 25 : 0)) : 0))} W
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Interactive Map Display */}
                <div className="rounded-2xl overflow-hidden border border-slate-800">
                  <LeafletMap 
                    points={points} 
                    currentLocation={currentLocation} 
                    height="260px"
                    zoom={16}
                  />
                </div>

                {/* Action Controls Toolbar */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {trackingState === "recording" ? (
                    <button
                      type="button"
                      onClick={pauseTracking}
                      className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
                      title="Pause Tracking"
                    >
                      <Pause className="w-7 h-7 fill-slate-950" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resumeTracking}
                      className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-900/30 transition-transform active:scale-95"
                      title="Resume Tracking"
                    >
                      <Play className="w-7 h-7 fill-slate-950 ml-1" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleFinishPress}
                    className="px-8 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-base flex items-center gap-2 shadow-lg shadow-red-950/40 transition-transform active:scale-95"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    FINISH & SAVE
                  </button>
                </div>
              </div>
            )}

            {/* If FINISHING: Activity Review & Save Dialog */}
            {isFinishing && (
              <div className="space-y-5">
                <div className="text-center pb-2">
                  <h4 className="text-xl font-extrabold text-white">🎉 Selesaikan & Simpan Aktivitas</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Total Jarak: <span className="text-orange-400 font-bold">{formatDistance(distanceKm)} KM</span> • Durasi: <span className="text-white font-bold">{formatDuration(durationSec)}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Judul Aktivitas</label>
                    <input
                      type="text"
                      value={activityTitle}
                      onChange={e => setActivityTitle(e.target.value)}
                      placeholder="Contoh: Morning 5K Recovery Run"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan / Caption</label>
                    <textarea
                      rows={3}
                      value={activityCaption}
                      onChange={e => setActivityCaption(e.target.value)}
                      placeholder="Ceritakan bagaimana performa atau cuaca selama berolahraga..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Gear Tracker Selector */}
                  {user.gear && user.gear.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-orange-400" />
                        Pilih Sepatu / Gear yang Digunakan (Odometer)
                      </label>
                      <select
                        value={selectedGearId}
                        onChange={e => setSelectedGearId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Tanpa Gear Khusus</option>
                        {user.gear.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.brand}) - {g.distanceKm}/{g.maxDistanceKm} KM
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">URL Foto (Opsional)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={photoUrl}
                        onChange={e => setPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800")}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded-xl text-slate-300 flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-orange-400" />
                        Sample Photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pengaturan Privasi</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "PUBLIC" as PrivacyLevel, label: "Publik", icon: Globe },
                        { id: "FOLLOWERS_ONLY" as PrivacyLevel, label: "Followers", icon: Users },
                        { id: "PRIVATE" as PrivacyLevel, label: "Hanya Saya", icon: Lock }
                      ].map(p => {
                        const Icon = p.icon;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPrivacy(p.id)}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                              privacy === p.id 
                                ? "bg-orange-500/20 border-orange-500 text-orange-400" 
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsFinishing(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveActivity}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-950/40 disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Publikasikan Aktivitas"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Live Beacon Modal */}
      <LiveBeaconModal
        isOpen={showBeaconModal}
        onClose={() => setShowBeaconModal(false)}
        currentLat={currentLocation?.lat}
        currentLng={currentLocation?.lng}
        isRecording={trackingState === "recording"}
      />

      {/* GPX Import Modal */}
      <GpxImportModal
        isOpen={showGpxImportModal}
        onClose={() => setShowGpxImportModal(false)}
        onActivityImported={(activity) => {
          onActivitySaved(activity, []);
          handleCloseModal();
        }}
      />
    </>
  );
};
