import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Play, 
  Calendar as CalendarIcon, 
  Clock, 
  Flame, 
  Heart, 
  Zap, 
  ChevronRight, 
  Award, 
  Dumbbell, 
  Sparkles, 
  AlertCircle,
  FileText,
  Activity as ActivityIcon,
  RotateCcw
} from "lucide-react";
import { WorkoutDay, Activity } from "../../types";
import { formatDuration, formatPace, formatDistance, formatCalories } from "../../utils/formatters";
import confetti from "canvas-confetti";
import { soundFX } from "../../utils/audioFx";

export interface ScheduledWorkoutItem extends WorkoutDay {
  planId?: string;
  planTitle?: string;
  weekNumber?: number;
  workoutIndex?: number;
  dateStr: string; // YYYY-MM-DD
  isPast?: boolean;
  isToday?: boolean;
}

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: ScheduledWorkoutItem | null;
  matchedActivity?: Activity | null;
  onToggleComplete: (workout: ScheduledWorkoutItem) => void;
  onOpenRecorder?: (preset?: { sportType?: string; targetDistance?: number; title?: string }) => void;
  onReschedule?: (workout: ScheduledWorkoutItem, newDate: string) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isOpen,
  onClose,
  workout,
  matchedActivity,
  onToggleComplete,
  onOpenRecorder,
  onReschedule
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedNewDate, setSelectedNewDate] = useState("");
  const [coachNotes, setCoachNotes] = useState("");

  if (!isOpen || !workout) return null;

  const targetKm = workout.targetDistanceKm || workout.distanceKm || 0;
  const targetMin = workout.targetDurationMin || workout.durationMin || 0;
  const isCompleted = !!workout.isCompleted;

  const handleToggle = () => {
    onToggleComplete(workout);
    if (!isCompleted) {
      soundFX.playMilestone();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleStartRecorder = () => {
    if (onOpenRecorder) {
      onClose();
      onOpenRecorder({
        sportType: "Running",
        targetDistance: targetKm > 0 ? targetKm : undefined,
        title: workout.title
      });
    }
  };

  const handleSaveReschedule = () => {
    if (selectedNewDate && onReschedule) {
      onReschedule(workout, selectedNewDate);
      setShowReschedule(false);
    }
  };

  // Structured Workout Phase Generator (sport science intervals)
  const getWorkoutPhases = (type: string, title: string, dist: number, dur: number) => {
    const t = (type + " " + title).toLowerCase();
    if (t.includes("interval") || t.includes("speed")) {
      return [
        { phase: "Pemanasan (Warm-up)", duration: "10-15 Min", desc: "Easy jog zona 1-2 + 4x dynamic drills (A-skips, butt kicks) & 2x short strides." },
        { phase: "Sesi Inti (Main Intervals)", duration: `${dist || 5} KM Total`, desc: "Pace target 5K/10K race pace dengan rest recovery jog di antara repetisi." },
        { phase: "Pendinginan (Cool-down)", duration: "10 Min", desc: "Jalan santai dan stretching statis untuk membuang akumulasi asam laktat." }
      ];
    }
    if (t.includes("tempo") || t.includes("threshold")) {
      return [
        { phase: "Pemanasan (Warm-up)", duration: "15 Min", desc: "Easy jog bertahap meningkatkan denyut jantung ke zona 2." },
        { phase: "Sesi Inti (Tempo Block)", duration: `${Math.round(dist * 0.7) || 4} KM`, desc: "Lactate Threshold Pace (Comfortably Hard, ~85-90% HR Max). Jaga irama nafas teratur." },
        { phase: "Pendinginan (Cool-down)", duration: "10 Min", desc: "Easy jog santai dan hidrasi elektrolit." }
      ];
    }
    if (t.includes("long run") || t.includes("endurance")) {
      return [
        { phase: "Pemanasan (Warm-up)", duration: "5 Min", desc: "Dynamic stretching dan mulai dengan ritme sangat santai di 1 km pertama." },
        { phase: "Sesi Inti (Aerobic Base)", duration: `${dist || 10} KM`, desc: "Pertahankan Zona 2 (Conversational Pace). Konsumsi gel energi / air per 45 menit." },
        { phase: "Pendinginan (Cool-down)", duration: "5 Min", desc: "Jalan santai 400m + foam rolling & elevasi kaki." }
      ];
    }
    if (t.includes("recovery") || t.includes("easy")) {
      return [
        { phase: "Sesi Pemulihan", duration: `${dist || 4} KM / ${dur || 30} Min`, desc: "Fokus pada aliran darah dan relaksasi otot. Jangan tergoda menambah kecepatan." }
      ];
    }
    return [
      { phase: "Struktur Latihan", duration: `${dist ? `${dist} KM` : `${dur} Min`}`, desc: workout.description || "Latihan terarah sesuai panduan periodisasi SPORTIVA." }
    ];
  };

  const phases = getWorkoutPhases(workout.workoutType || "", workout.title, targetKm, targetMin);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className={`p-6 pb-5 border-b border-slate-100 dark:border-slate-800 relative ${
          isCompleted 
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" 
            : workout.isPast 
            ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent"
            : "bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent"
        }`}>
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : workout.isPast
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30"
            }`}>
              {isCompleted ? "✓ SESI SELESAI" : workout.isPast ? "⚠ TERLEWAT / JADWAL LAMPAU" : "🗓 TERJADWAL"}
            </span>

            {workout.planTitle && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[200px]">
                {workout.planTitle}
              </span>
            )}
          </div>

          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
            {workout.title}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-orange-500" />
              <strong className="text-slate-700 dark:text-slate-300">
                {new Date(workout.dateStr + "T00:00:00").toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </strong>
            </span>
            {workout.weekNumber && (
              <span>Minggu ke-{workout.weekNumber}</span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Target Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Target Jarak
              </span>
              <span className="text-lg font-mono-sport font-black text-orange-500 mt-0.5 block">
                {targetKm > 0 ? `${targetKm} KM` : "--"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Target Durasi
              </span>
              <span className="text-lg font-mono-sport font-black text-amber-500 mt-0.5 block">
                {targetMin > 0 ? `${targetMin} Min` : "--"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Tipe Latihan
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 block truncate">
                {workout.workoutType || "Run"}
              </span>
            </div>
          </div>

          {/* Description */}
          {workout.description && (
            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Petunjuk Sesi Latihan</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                {workout.description}
              </p>
            </div>
          )}

          {/* Structured Phases */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Dumbbell className="w-4 h-4 text-orange-500" />
              <span>Rincian & Tahapan Latihan Sport Science</span>
            </h4>

            <div className="space-y-2">
              {phases.map((ph, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{ph.phase}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {ph.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ph.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched Real GPS Activity (if recorded on this date) */}
          {matchedActivity ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ActivityIcon className="w-4 h-4" />
                  <span>Aktivitas Nyata Terekam (GPS Log)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  TERHUBUNG KE AKTIVITAS
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  {matchedActivity.title}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Jarak Nyata</span>
                    <span className="font-mono-sport font-black text-emerald-500 text-xs">
                      {formatDistance(matchedActivity.distanceKm)} KM
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Durasi</span>
                    <span className="font-mono-sport font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {formatDuration(matchedActivity.durationSec)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Pace Rata2</span>
                    <span className="font-mono-sport font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {formatPace(matchedActivity.avgPaceMinPerKm)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Kalori</span>
                    <span className="font-mono-sport font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {formatCalories(matchedActivity.caloriesKcal)} kcal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-500">
              <span className="text-[11px]">Belum ada data GPS terhubung untuk tanggal ini.</span>
              {onOpenRecorder && (
                <button
                  type="button"
                  onClick={handleStartRecorder}
                  className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Mulai Lari Sekarang
                </button>
              )}
            </div>
          )}

          {/* Reschedule Drawer */}
          {showReschedule ? (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                Pilih Tanggal Baru untuk Sesi Ini:
              </span>
              <div className="flex items-center gap-2">
                <input 
                  type="date"
                  value={selectedNewDate || workout.dateStr}
                  onChange={(e) => setSelectedNewDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveReschedule}
                  className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500"
                >
                  Simpan Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="px-2.5 py-1.5 rounded-xl text-slate-500 text-xs hover:text-slate-800 dark:hover:text-white"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            onReschedule && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewDate(workout.dateStr);
                    setShowReschedule(true);
                  }}
                  className="text-[11px] text-orange-500 hover:underline font-semibold flex items-center gap-1 ml-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pindah Tanggal / Jadwalkan Ulang</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isCompleted
                ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20"
            }`}
          >
            {isCompleted ? (
              <>
                <Circle className="w-4 h-4" />
                <span>Batalkan Status Selesai</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tandai Sesi Selesai (✓)</span>
              </>
            )}
          </button>

          {onOpenRecorder && (
            <button
              type="button"
              onClick={handleStartRecorder}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Mulai Lari</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
