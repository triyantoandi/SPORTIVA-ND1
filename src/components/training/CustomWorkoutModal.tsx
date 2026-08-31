import React, { useState } from "react";
import { X, Calendar, Dumbbell, Clock, Flame, Sparkles, PlusCircle } from "lucide-react";
import { WorkoutDay } from "../../types";

interface CustomWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onAddWorkout: (workout: WorkoutDay & { customDate: string }) => void;
}

export const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onAddWorkout
}) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("");
  const [workoutType, setWorkoutType] = useState("Interval");
  const [distanceKm, setDistanceKm] = useState<string>("5.0");
  const [durationMin, setDurationMin] = useState<string>("30");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddWorkout({
      title: title.trim(),
      workoutType,
      targetDistanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      targetDurationMin: durationMin ? parseInt(durationMin, 10) : undefined,
      durationMin: durationMin ? parseInt(durationMin, 10) : undefined,
      description: description.trim() || `Latihan mandiri ${workoutType}`,
      customDate: date,
      isCompleted: false
    });

    onClose();
  };

  const WORKOUT_TYPES = [
    "Interval",
    "Base Run",
    "Tempo",
    "Long Run",
    "Recovery",
    "Aerobic Walk",
    "Strength & Core",
    "Cycling",
    "Rest Day"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base">Tambah Sesi Latihan Baru</h3>
              <p className="text-[11px] text-slate-400">Jadwalkan latihan kustom ke kalender</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
              Tanggal Sesi
            </label>
            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
              Judul Sesi Latihan
            </label>
            <input 
              type="text"
              required
              placeholder="Contoh: Speed Interval 6x400m"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                Kategori Latihan
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              >
                {WORKOUT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                Target Jarak (KM)
              </label>
              <input 
                type="number"
                step="0.1"
                placeholder="5.0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
              Target Durasi (Menit)
            </label>
            <input 
              type="number"
              placeholder="30"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
              Catatan / Instruksi Latihan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Warm up 1km, fokus cadence 175-180 spm, cooldown 500m."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20"
            >
              Simpan Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
