import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Play, 
  Award, 
  Zap, 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon,
  Layers,
  BarChart3,
  TrendingUp,
  Flame,
  Dumbbell,
  Target,
  ArrowRight
} from "lucide-react";
import { TrainingPlan, WorkoutDay } from "../types";
import { INITIAL_TRAINING_PLANS } from "../firebase/services/seedService";
import { WorkoutCalendar } from "../components/training/WorkoutCalendar";
import confetti from "canvas-confetti";
import { soundFX } from "../utils/audioFx";

interface TrainingPlanPageProps {
  onOpenRecorder?: (preset?: { sportType?: string; targetDistance?: number; title?: string }) => void;
}

type TabType = "calendar" | "curriculum" | "analytics";

const STORAGE_KEY_CUSTOM_WORKOUTS = "sportiva_custom_training_workouts";
const STORAGE_KEY_START_DATE = "sportiva_plan_start_date";

export const TrainingPlanPage: React.FC<TrainingPlanPageProps> = ({ onOpenRecorder }) => {
  const [plans, setPlans] = useState<TrainingPlan[]>(() => {
    try {
      const saved = localStorage.getItem("sportiva_active_plans");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_TRAINING_PLANS;
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>(INITIAL_TRAINING_PLANS[0]?.id || "plan_5k_beginner");
  const [activeTab, setActiveTab] = useState<TabType>("calendar");

  // Calculate default start date (Monday of 2 weeks ago so user sees rich past/current/future sessions)
  const [startDate, setStartDate] = useState<string>(() => {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY_START_DATE);
      if (savedDate) return savedDate;
    } catch (e) {}

    const d = new Date();
    // Monday of current week minus 7 days
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const startMon = new Date(d.setDate(diff));
    return startMon.toISOString().split("T")[0];
  });

  // Custom User Scheduled Workouts
  const [customWorkouts, setCustomWorkouts] = useState<(WorkoutDay & { customDate: string; id?: string })[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_WORKOUTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("sportiva_active_plans", JSON.stringify(plans));
    } catch (e) {}
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_START_DATE, startDate);
    } catch (e) {}
  }, [startDate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_WORKOUTS, JSON.stringify(customWorkouts));
    } catch (e) {}
  }, [customWorkouts]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const activeWeeks = selectedPlan?.weeks || [];

  const handleToggleWorkout = (planId: string, weekNum: number, dayIdx: number) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId || !p.weeks) return p;
      const weeks = [...p.weeks];
      const targetWeekIndex = weeks.findIndex(w => w.weekNumber === weekNum);
      if (targetWeekIndex === -1) return p;

      const targetWeek = { ...weeks[targetWeekIndex] };
      const workouts = [...targetWeek.workouts];
      if (workouts[dayIdx]) {
        workouts[dayIdx] = { ...workouts[dayIdx], isCompleted: !workouts[dayIdx].isCompleted };
      }
      targetWeek.workouts = workouts;
      weeks[targetWeekIndex] = targetWeek;
      return { ...p, weeks };
    }));

    soundFX.playMilestone();
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.65 }
    });
  };

  const handleAddCustomWorkout = (workout: WorkoutDay & { customDate: string }) => {
    setCustomWorkouts(prev => [
      ...prev,
      { ...workout, id: `custom_${Date.now()}` }
    ]);
  };

  const allWorkouts = activeWeeks.flatMap(w => w.workouts || []);
  const completedCount = allWorkouts.filter(wo => wo.isCompleted).length;
  const totalWorkouts = allWorkouts.length || 1;
  const progressPercent = Math.round((completedCount / totalWorkouts) * 100);

  const totalDistance = allWorkouts.reduce((acc, wo) => acc + (wo.targetDistanceKm || wo.distanceKm || 0), 0);
  const completedDistance = allWorkouts
    .filter(wo => wo.isCompleted)
    .reduce((acc, wo) => acc + (wo.targetDistanceKm || wo.distanceKm || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              SPORT SCIENCE PERIODIZATION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white mt-1">
            Program Latihan & Kalender Sesi 📋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Lacak jadwal latihan terstruktur harian vs. realisasi latihan nyata dengan panduan periodisasi berbasis sport science untuk mencapai performa puncak.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 text-xs font-bold self-start sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === "calendar"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Tampilan Kalender</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("curriculum")}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === "curriculum"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kurikulum Mingguan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === "analytics"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analitik Kepatuhan</span>
          </button>
        </div>
      </div>

      {/* Plan Selection Carousel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => {
          const isSelected = p.id === selectedPlanId;
          const planWeeks = p.weeks || [];
          const planAll = planWeeks.flatMap(w => w.workouts || []);
          const planDone = planAll.filter(w => w.isCompleted).length;
          const planPct = planAll.length ? Math.round((planDone / planAll.length) * 100) : 0;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? "bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500 shadow-lg shadow-orange-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute transform rotate-45 bg-orange-500 text-white font-black text-[8px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center tracking-widest">
                    AKTIF
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {p.sportType || "Running"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    {p.level || p.targetLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.durationWeeks} Minggu
                  </span>
                </div>

                <h3 className="text-base font-display font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Progres: <strong className="text-slate-900 dark:text-white font-mono">{planDone}/{planAll.length || 1} ({planPct}%)</strong>
                </div>
                <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full rounded-full transition-all"
                    style={{ width: `${planPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Tab Content */}
      {activeTab === "calendar" && (
        <WorkoutCalendar
          plan={selectedPlan}
          startDate={startDate}
          onUpdateStartDate={setStartDate}
          onToggleWorkout={handleToggleWorkout}
          onOpenRecorder={onOpenRecorder}
          customWorkouts={customWorkouts}
          onAddCustomWorkout={handleAddCustomWorkout}
        />
      )}

      {activeTab === "curriculum" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 font-mono">
                WEEK-BY-WEEK CURRICULUM
              </span>
              <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mt-0.5">
                {selectedPlan.title}
              </h3>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Sesi Tuntas</span>
                <span className="text-sm font-mono-sport font-black text-orange-500">
                  {completedCount}/{totalWorkouts} Sesi ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Weeks & Daily Workouts List */}
          <div className="space-y-6">
            {activeWeeks.map(week => (
              <div key={week.weekNumber} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-orange-500" />
                    <span>Minggu Ke-{week.weekNumber}: {week.focus || "Latihan Terjadwal"}</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(week.workouts || []).map((wo, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleWorkout(selectedPlan.id, week.weekNumber, idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                        wo.isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-orange-500/40"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {wo.day || `Hari ${wo.dayOfWeek || idx + 1}`}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {wo.targetDistanceKm ? `${wo.targetDistanceKm} KM` : wo.distanceKm ? `${wo.distanceKm} KM` : `${wo.targetDurationMin || wo.durationMin || 30} Min`}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {wo.title}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {wo.description}
                        </p>
                      </div>

                      <button type="button" className="mt-0.5 ml-2">
                        {wo.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 font-mono">
              SPORT SCIENCE COMPLIANCE & RECOVERY
            </span>
            <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mt-0.5">
              Analitik Kepatuhan & Volume Periodisasi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Volume Jarak Terlaksana
              </span>
              <div className="text-2xl font-mono-sport font-black text-emerald-500">
                {completedDistance.toFixed(1)} / {totalDistance.toFixed(1)} KM
              </div>
              <p className="text-xs text-slate-400">
                Tingkat pencapaian target mileage: {totalDistance ? Math.round((completedDistance / totalDistance) * 100) : 0}%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Distribusi Fase Latihan
              </span>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Aerobic Base (Zona 2):</span>
                  <strong className="font-mono text-emerald-500">70% Volume</strong>
                </div>
                <div className="flex justify-between">
                  <span>Threshold & Tempo:</span>
                  <strong className="font-mono text-amber-500">20% Volume</strong>
                </div>
                <div className="flex justify-between">
                  <span>Speed / VO2 Max:</span>
                  <strong className="font-mono text-red-500">10% Volume</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rekomendasi Pemulihan (Recovery)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Jaga kualitas tidur 7-8 jam per malam dan konsumsi nutrisi karbohidrat kompleks + protein dalam 30 menit pasca sesi latihan berat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
