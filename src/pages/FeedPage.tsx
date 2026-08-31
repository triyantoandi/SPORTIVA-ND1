import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Trophy, 
  TrendingUp, 
  Compass, 
  Filter, 
  Zap, 
  Sparkles, 
  Plus, 
  Calendar,
  Award
} from "lucide-react";
import { Activity } from "../types";
import { ActivityService } from "../firebase/services/activityService";
import { ActivityCard } from "../components/feed/ActivityCard";
import { useAuth } from "../hooks/useAuth";
import { formatDistance, formatDuration, formatPace } from "../utils/formatters";

interface FeedPageProps {
  onOpenRecorder: () => void;
  onOpenAICoach: () => void;
  onShareClick: (activity: Activity) => void;
  onFlyoverClick?: (activity: Activity) => void;
  newPRNotification?: any[];
}

export const FeedPage: React.FC<FeedPageProps> = ({
  onOpenRecorder,
  onOpenAICoach,
  onShareClick,
  onFlyoverClick,
  newPRNotification
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sportFilter, setSportFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"latest" | "most_kudos" | "most_viewed" | "longest_distance">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const sports = ["All", "Running", "Cycling", "Walking", "Hiking", "Swimming", "Gym", "HIIT"];

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const list = await ActivityService.fetchFeed(sportFilter);
      setActivities(list);
      setIsLoading(false);
    };
    load();

    const handleUpdate = () => {
      load();
    };
    window.addEventListener("sportiva_activity_updated", handleUpdate);
    return () => window.removeEventListener("sportiva_activity_updated", handleUpdate);
  }, [sportFilter]);

  // Sort and filter displayed activities
  const processedActivities = activities
    .filter(act => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        act.title.toLowerCase().includes(q) ||
        act.userName.toLowerCase().includes(q) ||
        (act.notes && act.notes.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "most_kudos") {
        return (b.kudosCount || 0) - (a.kudosCount || 0);
      }
      if (sortBy === "most_viewed") {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      if (sortBy === "longest_distance") {
        return b.distanceKm - a.distanceKm;
      }
      return b.createdAt - a.createdAt; // default latest
    });

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Top Banner: Athlete Weekly Summary HUD */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Weekly Volume
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Week 35</span>
            </div>
            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user.stats.currentStreak} Hari Streak</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white leading-snug">
              Semangat, {user.fullName}! 🔥
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              Total <strong className="text-orange-400 font-bold">{user.stats.totalDistanceKm.toFixed(1)} KM</strong> dalam <strong className="text-white font-bold">{user.stats.totalActivities} sesi</strong> latihan.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenRecorder}
              className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-950/40 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              Mulai Rekam GPS
            </button>

            <button
              type="button"
              onClick={onOpenAICoach}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              AI Coach
            </button>
          </div>
        </div>

        {/* Mini 4-Pillar Summary Bar */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-1">
            <div className="text-[9px] uppercase font-bold text-slate-400">Jarak</div>
            <div className="text-sm font-display font-extrabold text-white mt-0.5">
              {formatDistance(user.stats.totalDistanceKm)}
              <span className="text-[9px] font-normal text-slate-400 ml-0.5">KM</span>
            </div>
          </div>
          <div className="p-1">
            <div className="text-[9px] uppercase font-bold text-slate-400">Durasi</div>
            <div className="text-sm font-mono-sport font-extrabold text-orange-400 mt-0.5">
              {formatDuration(user.stats.totalDurationSec)}
            </div>
          </div>
          <div className="p-1">
            <div className="text-[9px] uppercase font-bold text-slate-400">Elevasi</div>
            <div className="text-sm font-mono-sport font-extrabold text-white mt-0.5">
              +{user.stats.totalElevationM}m
            </div>
          </div>
          <div className="p-1">
            <div className="text-[9px] uppercase font-bold text-slate-400">Kalori</div>
            <div className="text-sm font-mono-sport font-extrabold text-white mt-0.5">
              {user.stats.totalCalories}
            </div>
          </div>
        </div>
      </div>

      {/* PR Alert Celebration Banner if triggered */}
      {newPRNotification && newPRNotification.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl">
              🏆
            </div>
            <div>
              <div className="text-sm font-black text-amber-400 uppercase">REKOR PRIBADI BARU TERPECAHKAN!</div>
              <div className="text-xs text-slate-200">
                {newPRNotification.map(p => `${p.distanceCategory}: ${(p.newTimeSec/60).toFixed(2)} min`).join(", ")}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-500 text-slate-950 rounded-full">
            +150 XP
          </span>
        </div>
      )}

      {/* Filter and Search Bar Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sport Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sports.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSportFilter(s)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                sportFilter === s
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {s === "All" ? "🔥 Semua" : s}
            </button>
          ))}
        </div>

        {/* Sort and Search controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="Cari aktivitas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="latest">Terbaru</option>
            <option value="most_kudos">❤️ Terbanyak Kudos</option>
            <option value="most_viewed">👁️ Terbanyak Views</option>
            <option value="longest_distance">📏 Jarak Terjauh</option>
          </select>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold">Memuat aktivitas komunitas...</p>
          </div>
        ) : processedActivities.length > 0 ? (
          processedActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onShareClick={onShareClick}
              onFlyoverClick={onFlyoverClick}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Compass className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Aktivitas Ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan filter olahraga atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={onOpenRecorder}
              className="mt-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Mulai Rekam Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
