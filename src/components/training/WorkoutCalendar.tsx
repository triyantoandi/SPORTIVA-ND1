import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Download, 
  Activity as ActivityIcon, 
  TrendingUp,
  Award,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Zap,
  BarChart2,
  Gauge,
  CalendarDays
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid 
} from "recharts";
import { TrainingPlan, WorkoutDay, Activity } from "../../types";
import { ScheduledWorkoutItem, WorkoutDetailModal } from "./WorkoutDetailModal";
import { CustomWorkoutModal } from "./CustomWorkoutModal";
import { ActivityService } from "../../firebase/services/activityService";
import { formatDistance } from "../../utils/formatters";

export interface WorkoutCalendarProps {
  plan: TrainingPlan;
  startDate: string; // YYYY-MM-DD
  onUpdateStartDate: (newDate: string) => void;
  onToggleWorkout: (planId: string, weekNum: number, dayIdx: number) => void;
  onOpenRecorder?: (preset?: { sportType?: string; targetDistance?: number; title?: string }) => void;
  customWorkouts: (WorkoutDay & { customDate: string; id?: string })[];
  onAddCustomWorkout: (workout: WorkoutDay & { customDate: string }) => void;
}

type FilterStatus = "all" | "completed" | "pending" | "missed";
type CalendarViewMode = "month" | "week";

const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const WEEKDAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const FULL_WEEKDAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// Helper to compute Training Load (TSS/TRIMP approximation)
export const calculateWorkoutLoad = (distanceKm: number, durationMin: number, workoutType?: string): number => {
  const baseDur = durationMin > 0 ? durationMin : (distanceKm * 6); // estimate ~6 min/km
  const type = (workoutType || "").toLowerCase();
  
  let intensityFactor = 1.0;
  if (type.includes("interval") || type.includes("speed") || type.includes("vo2")) {
    intensityFactor = 1.5;
  } else if (type.includes("tempo") || type.includes("threshold")) {
    intensityFactor = 1.3;
  } else if (type.includes("long run") || type.includes("marathon")) {
    intensityFactor = 1.15;
  } else if (type.includes("recovery") || type.includes("easy")) {
    intensityFactor = 0.75;
  } else if (type.includes("strength") || type.includes("cross")) {
    intensityFactor = 1.1;
  }

  return Math.round(baseDur * intensityFactor * 1.1);
};

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  plan,
  startDate,
  onUpdateStartDate,
  onToggleWorkout,
  onOpenRecorder,
  customWorkouts,
  onAddCustomWorkout
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Selected workout modal
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkoutItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModalInitialDate, setCustomModalInitialDate] = useState<string>(todayStr);

  // Load real recorded GPS activities
  const localActivities = useMemo(() => {
    return ActivityService.getLocalActivities();
  }, []);

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    localActivities.forEach(act => {
      if (act.createdAt) {
        const d = act.createdAt.split("T")[0];
        const arr = map.get(d) || [];
        arr.push(act);
        map.set(d, arr);
      }
    });
    return map;
  }, [localActivities]);

  // Project scheduled workouts onto dates
  const allScheduledWorkouts = useMemo(() => {
    const list: ScheduledWorkoutItem[] = [];
    if (!startDate) return list;

    const start = new Date(startDate + "T00:00:00");
    const startDayOfWeek = start.getDay(); // 0 = Sun, 1 = Mon ...
    const mondayOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
    const planMonday = new Date(start);
    planMonday.setDate(start.getDate() + mondayOffset);

    const weeks = plan.weeks || [];
    weeks.forEach(week => {
      const weekIndex = week.weekNumber - 1;
      (week.workouts || []).forEach((wo, dayIdx) => {
        const dow = wo.dayOfWeek || (dayIdx + 1);
        const dayOffset = (weekIndex * 7) + (dow - 1);
        
        const wDate = new Date(planMonday);
        wDate.setDate(planMonday.getDate() + dayOffset);
        
        const dateStr = wDate.toISOString().split("T")[0];
        const isPast = dateStr < todayStr && !wo.isCompleted;
        const isToday = dateStr === todayStr;

        list.push({
          ...wo,
          planId: plan.id,
          planTitle: plan.title,
          weekNumber: week.weekNumber,
          workoutIndex: dayIdx,
          dateStr,
          isPast,
          isToday
        });
      });
    });

    customWorkouts.forEach((cwo, idx) => {
      const isPast = cwo.customDate < todayStr && !cwo.isCompleted;
      const isToday = cwo.customDate === todayStr;

      list.push({
        ...cwo,
        planTitle: "Latihan Kustom Mandiri",
        workoutIndex: -1 - idx,
        dateStr: cwo.customDate,
        isPast,
        isToday
      });
    });

    return list;
  }, [plan, startDate, customWorkouts, todayStr]);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, ScheduledWorkoutItem[]>();
    allScheduledWorkouts.forEach(wo => {
      const arr = map.get(wo.dateStr) || [];
      arr.push(wo);
      map.set(wo.dateStr, arr);
    });
    return map;
  }, [allScheduledWorkouts]);

  // Overall Statistics & Monthly Training Load
  const monthStats = useMemo(() => {
    let plannedDist = 0;
    let completedDist = 0;
    let plannedLoad = 0;
    let completedLoad = 0;
    let plannedCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let missedCount = 0;

    allScheduledWorkouts.forEach(wo => {
      const wDate = new Date(wo.dateStr + "T00:00:00");
      if (wDate.getFullYear() === currentYear && wDate.getMonth() === currentMonth) {
        plannedCount += 1;
        const dist = wo.targetDistanceKm || wo.distanceKm || 0;
        const dur = wo.targetDurationMin || wo.durationMin || 0;
        const load = calculateWorkoutLoad(dist, dur, wo.workoutType);
        
        plannedDist += dist;
        plannedLoad += load;

        if (wo.isCompleted) {
          completedCount += 1;
          completedDist += dist;
          completedLoad += load;
        } else if (wo.isPast) {
          missedCount += 1;
        } else {
          pendingCount += 1;
        }
      }
    });

    const completionRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;
    const loadAdherence = plannedLoad > 0 ? Math.round((completedLoad / plannedLoad) * 100) : 0;

    let fatigueStatus = "Optimal";
    let fatigueColor = "text-emerald-500";
    if (loadAdherence < 40 && plannedCount > 0) {
      fatigueStatus = "Under-training / Pemulihan";
      fatigueColor = "text-amber-500";
    } else if (loadAdherence >= 80 && loadAdherence <= 110) {
      fatigueStatus = "Peak Zone / Beban Optimal";
      fatigueColor = "text-emerald-400";
    } else if (loadAdherence > 110) {
      fatigueStatus = "Overreaching / Beban Tinggi";
      fatigueColor = "text-orange-500";
    }

    return {
      plannedDist,
      completedDist,
      plannedLoad,
      completedLoad,
      plannedCount,
      completedCount,
      pendingCount,
      missedCount,
      completionRate,
      loadAdherence,
      fatigueStatus,
      fatigueColor
    };
  }, [allScheduledWorkouts, currentYear, currentMonth]);

  // Generate Month Grid Matrix (grouped by week rows)
  const monthWeeks = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let startDay = firstDayOfMonth.getDay(); // 0 = Sun
    let startOffset = startDay === 0 ? 6 : startDay - 1;

    const allDays: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Prepend previous month
    for (let i = startOffset; i > 0; i--) {
      const d = new Date(currentYear, currentMonth, 1 - i);
      allDays.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        isCurrentMonth: false
      });
    }

    // Current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(currentYear, currentMonth, i);
      allDays.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        isCurrentMonth: true
      });
    }

    // Pad remaining to finish full 7-day weeks
    const rem = allDays.length % 7;
    if (rem > 0) {
      const needed = 7 - rem;
      for (let i = 1; i <= needed; i++) {
        const d = new Date(currentYear, currentMonth + 1, i);
        allDays.push({
          date: d,
          dateStr: d.toISOString().split("T")[0],
          isCurrentMonth: false
        });
      }
    }

    const weeks: {
      weekIndex: number;
      weekLabel: string;
      days: { date: Date; dateStr: string; isCurrentMonth: boolean }[];
      plannedKm: number;
      completedKm: number;
      plannedLoad: number;
      completedLoad: number;
      completedCount: number;
      totalCount: number;
    }[] = [];

    for (let i = 0; i < allDays.length; i += 7) {
      const slice = allDays.slice(i, i + 7);
      const weekIdx = Math.floor(i / 7);

      let plannedKm = 0;
      let completedKm = 0;
      let plannedLoad = 0;
      let completedLoad = 0;
      let completedCount = 0;
      let totalCount = 0;

      slice.forEach(day => {
        const wos = workoutsByDate.get(day.dateStr) || [];
        wos.forEach(w => {
          totalCount += 1;
          const dist = w.targetDistanceKm || w.distanceKm || 0;
          const dur = w.targetDurationMin || w.durationMin || 0;
          const load = calculateWorkoutLoad(dist, dur, w.workoutType);

          plannedKm += dist;
          plannedLoad += load;

          if (w.isCompleted) {
            completedCount += 1;
            completedKm += dist;
            completedLoad += load;
          }
        });
      });

      const startD = slice[0].date;
      const endD = slice[6].date;
      const weekLabel = `${startD.getDate()} ${INDONESIAN_MONTHS[startD.getMonth()].slice(0, 3)} - ${endD.getDate()} ${INDONESIAN_MONTHS[endD.getMonth()].slice(0, 3)}`;

      weeks.push({
        weekIndex: weekIdx,
        weekLabel,
        days: slice,
        plannedKm,
        completedKm,
        plannedLoad,
        completedLoad,
        completedCount,
        totalCount
      });
    }

    return weeks;
  }, [currentYear, currentMonth, workoutsByDate]);

  // Weekly Load Trend Chart Data
  const weeklyLoadChartData = useMemo(() => {
    return monthWeeks.map((wk, idx) => ({
      name: `W${idx + 1}`,
      label: wk.weekLabel,
      plannedLoad: wk.plannedLoad,
      completedLoad: wk.completedLoad,
      plannedKm: wk.plannedKm,
      completedKm: wk.completedKm
    }));
  }, [monthWeeks]);

  const filterWorkout = (wo: ScheduledWorkoutItem) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return wo.isCompleted;
    if (filterStatus === "pending") return !wo.isCompleted && !wo.isPast;
    if (filterStatus === "missed") return wo.isPast && !wo.isCompleted;
    return true;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const handleExportICS = () => {
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SPORTIVA Workout Calendar//ID",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:SPORTIVA Training Schedule",
      "X-WR-TIMEZONE:Asia/Jakarta"
    ];

    allScheduledWorkouts.forEach((wo, idx) => {
      const cleanDate = wo.dateStr.replace(/-/g, "");
      const title = `${wo.isCompleted ? "[✓ SELESAI] " : "[PENDING] "}${wo.title} (${wo.targetDistanceKm || wo.distanceKm || 5}KM)`;
      const desc = `${wo.description || ""}\\n\\nTipe: ${wo.workoutType || "Run"}\\nProgram: ${plan.title}`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:sportiva-workout-${wo.dateStr}-${idx}@sportiva.app`,
        `DTSTAMP:${cleanDate}T060000Z`,
        `DTSTART;VALUE=DATE:${cleanDate}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        `STATUS:${wo.isCompleted ? "CONFIRMED" : "TENTATIVE"}`,
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SPORTIVA_${plan.title.replace(/\s+/g, "_")}_Calendar.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="workout-calendar-root" className="space-y-6 animate-fadeIn">
      {/* SECTION 1: Training Load HUD & Monthly Analytics Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                <Gauge className="w-3 h-3" />
                TRAINING LOAD & ADHERENCE
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {plan.title} • {INDONESIAN_MONTHS[currentMonth]} {currentYear}
              </span>
            </div>
            <h3 className="text-2xl font-display font-black text-white">
              Beban Latihan Mingguan & Bulanan (Training Load)
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Memvisualisasikan skor beban latihan (TSS/TRIMP) yang telah diselesaikan (Completed) vs. yang masih pending/terjadwal untuk mencegah overtraining dan mengoptimalkan periodisasi.
            </p>
          </div>

          {/* Program Start Date Anchor */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700 self-start lg:self-auto">
            <CalendarIcon className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold leading-none">
                Tanggal Mulai Program:
              </span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => onUpdateStartDate(e.target.value)}
                className="bg-transparent border-none text-white text-xs font-mono font-bold focus:outline-none cursor-pointer mt-0.5 p-0"
              />
            </div>
          </div>
        </div>

        {/* 4 Load Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Monthly Training Load Score (TSS) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Beban Latihan Bulan Ini
              </span>
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono-sport font-black text-orange-400">
                {monthStats.completedLoad}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {monthStats.plannedLoad} Load
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, monthStats.loadAdherence)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
              <span>Realisasi: {monthStats.loadAdherence}%</span>
              <span className={monthStats.fatigueColor}>{monthStats.fatigueStatus.split("/")[0]}</span>
            </div>
          </div>

          {/* Card 2: Completed vs Pending Sessions */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Status Sesi Latihan
              </span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono-sport font-black text-emerald-400">
                {monthStats.completedCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {monthStats.plannedCount} Selesai
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1">
              <div className="flex items-center gap-1 text-orange-400">
                <Circle className="w-2.5 h-2.5" />
                <span>{monthStats.pendingCount} Pending</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>{monthStats.missedCount} Terlewat</span>
              </div>
            </div>
          </div>

          {/* Card 3: Monthly Mileage (KM) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Volume Jarak Bulanan
              </span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono-sport font-black text-cyan-400">
                {formatDistance(monthStats.completedDist)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {formatDistance(monthStats.plannedDist)} KM
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, monthStats.plannedDist > 0 ? (monthStats.completedDist / monthStats.plannedDist) * 100 : 0)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">Target volume bulanan program</p>
          </div>

          {/* Card 4: GPS Tracking Integration */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                GPS Tracker Sync
              </span>
              <ActivityIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono-sport font-black text-purple-400">
                {localActivities.length}
              </span>
              <span className="text-xs text-slate-400">Aktivitas Terhubung</span>
            </div>
            <p className="text-[10px] text-purple-300/80 font-medium">
              Data GPS otomatis memvalidasi sesi kalender
            </p>
          </div>
        </div>

        {/* Weekly Training Load Progression Mini-Chart */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-slate-200">
                Distribusi Beban Latihan per Minggu (Weekly Training Load)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Completed Load
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/40 border border-orange-500" />
                Pending / Planned Load
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLoadChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "11px" }}
                  formatter={(val: any, name: string) => [
                    `${val} pts`,
                    name === "completedLoad" ? "Beban Terealisasi" : "Beban Terencana"
                  ]}
                  labelFormatter={(lbl, items) => {
                    const item = items[0]?.payload;
                    return item ? `${item.name} (${item.label})` : lbl;
                  }}
                />
                <Bar dataKey="completedLoad" fill="#10b981" radius={[4, 4, 0, 0]} name="completedLoad" />
                <Bar dataKey="plannedLoad" fill="#f97316" fillOpacity={0.35} radius={[4, 4, 0, 0]} name="plannedLoad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2: Calendar Controls & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleGoToday}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
            {INDONESIAN_MONTHS[currentMonth]} {currentYear}
          </h3>
        </div>

        {/* Right Toolbar: View Mode Switcher, Status Filters, & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle: Monthly Grid vs. Weekly Breakdown */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === "month"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Grid Bulanan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === "week"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Fokus Mingguan</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                filterStatus === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("completed")}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                filterStatus === "completed"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ✓ Selesai
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("pending")}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                filterStatus === "pending"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🗓 Pending
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("missed")}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                filterStatus === "missed"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ⚠ Terlewat
            </button>
          </div>

          {/* Add Custom Workout */}
          <button
            type="button"
            onClick={() => {
              setCustomModalInitialDate(todayStr);
              setIsCustomModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sesi</span>
          </button>

          {/* Export to ICS */}
          <button
            type="button"
            onClick={handleExportICS}
            className="px-3.5 py-1.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Download iCalendar file untuk Google Calendar / Apple Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor (.ics)</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: Main Calendar Grid (Month View) */}
      {viewMode === "month" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
          {/* Weekday Header Columns + Weekly Load Summary Header Column */}
          <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-center">
            {WEEKDAY_NAMES.map((wd, i) => (
              <div 
                key={wd} 
                className={`py-3 text-xs font-bold uppercase tracking-wider ${
                  i >= 5 ? "text-orange-500 dark:text-orange-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {wd}
              </div>
            ))}
            <div className="py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-900/80 border-l border-slate-200 dark:border-slate-800">
              Weekly Load 📊
            </div>
          </div>

          {/* Month Weeks Rows */}
          {monthWeeks.map((week) => (
            <div 
              key={week.weekIndex}
              className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800/80 divide-x divide-slate-100 dark:divide-slate-800/80"
            >
              {/* 7 Day Cells */}
              {week.days.map(({ date, dateStr, isCurrentMonth }, dayIdx) => {
                const isToday = dateStr === todayStr;
                const dayWorkouts = (workoutsByDate.get(dateStr) || []).filter(filterWorkout);
                const dayActivities = activitiesByDate.get(dateStr) || [];
                const hasEvents = dayWorkouts.length > 0 || dayActivities.length > 0;

                return (
                  <div
                    key={dayIdx}
                    className={`min-h-[115px] sm:min-h-[135px] p-2 relative flex flex-col justify-between transition-colors group ${
                      !isCurrentMonth 
                        ? "bg-slate-50/40 dark:bg-slate-950/30 text-slate-300 dark:text-slate-600" 
                        : isToday 
                        ? "bg-orange-500/5 dark:bg-orange-500/5 text-slate-900 dark:text-white" 
                        : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                          : isCurrentMonth
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-600"
                      }`}>
                        {date.getDate()}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomModalInitialDate(dateStr);
                          setIsCustomModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-opacity"
                        title={`Tambah sesi di ${dateStr}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Workout Cards in this Day */}
                    <div className="space-y-1.5 my-1 flex-1 overflow-hidden">
                      {dayWorkouts.map((wo, wIdx) => {
                        const isCompleted = !!wo.isCompleted;
                        const isPast = wo.isPast;
                        const targetKm = wo.targetDistanceKm || wo.distanceKm || 0;
                        const targetMin = wo.targetDurationMin || wo.durationMin || 0;
                        const loadScore = calculateWorkoutLoad(targetKm, targetMin, wo.workoutType);

                        return (
                          <div
                            key={wIdx}
                            onClick={() => {
                              setSelectedWorkout(wo);
                              setIsDetailOpen(true);
                            }}
                            className={`p-1.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-xs flex items-start gap-1.5 ${
                              isCompleted
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
                                : isPast
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300"
                                : "bg-orange-500/10 border-orange-500/30 text-orange-900 dark:text-orange-200"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-orange-500" />
                              )}
                            </div>

                            <div className="truncate flex-1">
                              <div className="text-[11px] font-bold leading-tight truncate">
                                {wo.title}
                              </div>
                              <div className="text-[9px] font-mono opacity-85 mt-0.5 flex items-center justify-between">
                                <span>{targetKm > 0 ? `${targetKm} KM` : `${targetMin}m`}</span>
                                <span className="font-semibold px-1 rounded bg-slate-200/50 dark:bg-slate-800/50">
                                  {loadScore} TSS
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* GPS Synced Activities Badge */}
                      {dayActivities.map((act) => (
                        <div
                          key={act.id}
                          className="p-1 px-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono flex items-center justify-between gap-1 truncate"
                          title={`Aktivitas Terbaca: ${act.title} (${act.distanceKm} KM)`}
                        >
                          <span className="truncate font-semibold flex items-center gap-1">
                            <ActivityIcon className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span className="truncate">{act.title}</span>
                          </span>
                          <span className="font-bold shrink-0">{formatDistance(act.distanceKm)}k</span>
                        </div>
                      ))}
                    </div>

                    {!hasEvents && isCurrentMonth && (
                      <div className="text-[9px] text-slate-300 dark:text-slate-700 font-mono text-center pb-0.5 opacity-40">
                        --
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 8th Column: Weekly Training Load Summary Card */}
              <div className="p-3 bg-slate-50/60 dark:bg-slate-950/70 flex flex-col justify-between text-xs space-y-2 border-l border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>MINGGU {week.weekIndex + 1}</span>
                    <span className="text-orange-500">{week.completedCount}/{week.totalCount} Sesi</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {week.weekLabel}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-slate-400">Mileage:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        {week.completedKm.toFixed(1)} / {week.plannedKm.toFixed(1)} KM
                      </strong>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, week.plannedKm > 0 ? (week.completedKm / week.plannedKm) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-slate-400">Load (TSS):</span>
                      <strong className="text-orange-500 font-bold">
                        {week.completedLoad} / {week.plannedLoad}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, week.plannedLoad > 0 ? (week.completedLoad / week.plannedLoad) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedWeekIndex(week.weekIndex);
                    setViewMode("week");
                  }}
                  className="w-full py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                >
                  <span>Detail Minggu</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: Weekly Detailed Focus View (Week Mode) */}
      {viewMode === "week" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          {/* Week Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 font-mono">
                WEEKLY LOAD BREAKDOWN & SCHEDULE
              </span>
              <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mt-0.5">
                Minggu ke-{selectedWeekIndex + 1}: {monthWeeks[selectedWeekIndex]?.weekLabel || "Jadwal Latihan"}
              </h3>
            </div>

            {/* Week Nav Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedWeekIndex === 0}
                onClick={() => setSelectedWeekIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Minggu Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={selectedWeekIndex >= monthWeeks.length - 1}
                onClick={() => setSelectedWeekIndex(prev => Math.min(monthWeeks.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold text-xs flex items-center gap-1"
              >
                <span>Minggu Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7 Days Expanded Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {monthWeeks[selectedWeekIndex]?.days.map(({ date, dateStr }, dayIdx) => {
              const dayWorkouts = (workoutsByDate.get(dateStr) || []).filter(filterWorkout);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayIdx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isToday
                      ? "bg-orange-500/5 border-orange-500 shadow-md shadow-orange-500/5"
                      : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {FULL_WEEKDAYS[dayIdx]}
                    </div>
                    <div className="text-base font-mono font-black text-slate-900 dark:text-white">
                      {date.getDate()} {INDONESIAN_MONTHS[date.getMonth()].slice(0, 3)}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayWorkouts.length > 0 ? (
                      dayWorkouts.map((wo, idx) => {
                        const isCompleted = !!wo.isCompleted;
                        const dist = wo.targetDistanceKm || wo.distanceKm || 0;
                        const dur = wo.targetDurationMin || wo.durationMin || 0;
                        const load = calculateWorkoutLoad(dist, dur, wo.workoutType);

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedWorkout(wo);
                              setIsDetailOpen(true);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] space-y-1.5 ${
                              isCompleted
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                isCompleted ? "bg-emerald-500 text-white" : "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                              }`}>
                                {isCompleted ? "✓ SELESAI" : "PENDING"}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                {load} TSS
                              </span>
                            </div>

                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {wo.title}
                            </div>

                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {dist > 0 ? `${dist} KM` : `${dur} Min`} • {wo.workoutType || "Run"}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-24 flex flex-col items-center justify-center text-center p-2 text-slate-400">
                        <span className="text-[11px] italic">Hari Istirahat / Rest</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomModalInitialDate(dateStr);
                            setIsCustomModalOpen(true);
                          }}
                          className="mt-2 text-[10px] text-orange-500 font-bold hover:underline"
                        >
                          + Tambah Sesi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: Status Legend & Quick Action Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700 dark:text-slate-300">Keterangan Visual:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Completed (Selesai Tuntas)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Pending (Terjadwal / Akan Datang)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Missed (Terlewat / Belum Dicentang)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">GPS Activity Sync</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Klik sesi pada kalender untuk membuka rincian tahapan & beban latihan.
        </div>
      </div>

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        workout={selectedWorkout}
        matchedActivity={selectedWorkout ? (activitiesByDate.get(selectedWorkout.dateStr)?.[0] || null) : null}
        onToggleComplete={(wo) => {
          if (wo.planId && wo.weekNumber && wo.workoutIndex !== undefined && wo.workoutIndex >= 0) {
            onToggleWorkout(wo.planId, wo.weekNumber, wo.workoutIndex);
            setSelectedWorkout(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
          }
        }}
        onOpenRecorder={onOpenRecorder}
      />

      {/* Custom Workout Modal */}
      <CustomWorkoutModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialDate={customModalInitialDate}
        onAddWorkout={onAddCustomWorkout}
      />
    </div>
  );
};
