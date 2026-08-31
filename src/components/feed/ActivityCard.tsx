import React, { useState, useMemo } from "react";
import { Heart, MessageSquare, Share2, MapPin, Award, AlertTriangle, ChevronDown, ChevronUp, Send, Film, Zap, Gauge, TrendingUp, Activity as ActivityIcon } from "lucide-react";
import { Activity, Comment } from "../../types";
import { LeafletMap } from "../map/LeafletMap";
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from "../../utils/formatters";
import { ActivityService } from "../../firebase/services/activityService";
import { PaceChart, ElevationChart, SplitsTable } from "../charts/SportCharts";
import { RunningAnalyticsView } from "../running/RunningAnalyticsView";
import { computeRunningDynamics } from "../../utils/runningAnalytics";

interface ActivityCardProps {
  activity: Activity;
  onShareClick: (activity: Activity) => void;
  onFlyoverClick?: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onShareClick, onFlyoverClick }) => {
  const [kudosCount, setKudosCount] = useState(activity.kudosCount || 0);
  const [isKudoed, setIsKudoed] = useState(activity.hasUserKudoed || false);
  const [showDetails, setShowDetails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(activity.commentCount || 0);

  // Compute or retrieve running dynamics for Running/Treadmill activities
  const enrichedActivity = useMemo(() => {
    if ((activity.sportType === "Running" || activity.sportType === "Treadmill") && !activity.runningDynamics) {
      const dynamics = computeRunningDynamics({
        points: activity.routePoints || [],
        durationSec: activity.durationSec,
        distanceKm: activity.distanceKm,
        avgPaceMinKm: activity.avgPaceMinPerKm,
        avgSpeedKmh: activity.avgSpeedKmh,
        elevationGainM: activity.elevationGainM,
        avgHeartRate: activity.avgHeartRate,
        maxHeartRate: activity.maxHeartRate,
        cadence: activity.cadence,
        splits: activity.splits
      });
      return {
        ...activity,
        runningDynamics: dynamics,
        gapPaceMinPerKm: dynamics.gapPaceMinPerKm
      };
    }
    return activity;
  }, [activity]);

  const dynamics = enrichedActivity.runningDynamics;
  const isRunning = activity.sportType === "Running" || activity.sportType === "Treadmill";

  const handleKudos = async () => {
    const nextKudoed = !isKudoed;
    setIsKudoed(nextKudoed);
    setKudosCount(prev => (nextKudoed ? prev + 1 : Math.max(0, prev - 1)));
    await ActivityService.toggleKudos(activity.id);
  };

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      const comms = await ActivityService.fetchComments(activity.id);
      setComments(comms);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const comm = await ActivityService.addComment(activity.id, newCommentText.trim());
    setComments(prev => [...prev, comm]);
    setCommentCount(prev => prev + 1);
    setNewCommentText("");
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header: Athlete Info */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={activity.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
            alt={activity.userName}
            className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/30"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{activity.userName}</span>
              {activity.isFlaggedSuspicious && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Flagged
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{formatRelativeTime(activity.createdAt)}</span>
              {activity.userLocation && (
                <span className="flex items-center gap-0.5">
                  • <MapPin className="w-3 h-3" /> {activity.userLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          {activity.sportType}
        </span>
      </div>

      {/* Activity Title & Caption */}
      <div className="px-5 pb-3">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
          {activity.title}
        </h3>
        {activity.caption && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {activity.caption}
          </p>
        )}
      </div>

      {/* Primary Key Metrics Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-y border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Distance</div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatDistance(activity.distanceKm)} <span className="text-xs font-semibold text-slate-400">KM</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Pace</div>
          <div className="text-xl sm:text-2xl font-mono-sport font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatPace(activity.avgPaceMinPerKm)} <span className="text-xs font-semibold text-slate-400">/km</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Time</div>
          <div className="text-xl sm:text-2xl font-mono-sport font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatDuration(activity.durationSec)}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Elevation</div>
          <div className="text-xl sm:text-2xl font-mono-sport font-extrabold text-slate-900 dark:text-white mt-0.5">
            +{activity.elevationGainM} <span className="text-xs font-semibold text-slate-400">m</span>
          </div>
        </div>
      </div>

      {/* Running Pro Metrics Mini-Bar */}
      {isRunning && dynamics && (
        <div className="px-5 py-2 bg-orange-500/5 dark:bg-orange-950/20 border-b border-orange-500/10 flex items-center justify-between overflow-x-auto gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-mono-sport text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-400 font-sans text-[11px]">GAP:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPace(dynamics.gapPaceMinPerKm)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono-sport text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-400 font-sans text-[11px]">Power:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{dynamics.avgPowerWatts}W</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono-sport text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Gauge className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-slate-400 font-sans text-[11px]">Cadence:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{dynamics.avgCadenceSpm} SPM</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono-sport text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-slate-400 font-sans text-[11px]">Aerobic TE:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{dynamics.aerobicTrainingEffect.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Map or Photo Display */}
      <div className="relative group">
        {activity.routePoints && activity.routePoints.length > 0 ? (
          <>
            <LeafletMap points={activity.routePoints} height="260px" interactive={false} />
            {onFlyoverClick && (
              <button
                type="button"
                onClick={() => onFlyoverClick(activity)}
                className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-orange-600 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 hover:border-orange-500 transition-all group-hover:scale-105"
                title="Putar Animasi 3D Flyover Relive"
              >
                <Film className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
                <span>3D Flyover</span>
              </button>
            )}
          </>
        ) : activity.photos && activity.photos.length > 0 ? (
          <img
            src={activity.photos[0]}
            alt={activity.title}
            className="w-full h-64 object-cover"
          />
        ) : null}
      </div>

      {/* Collapsible Deep Analytics (Running Analytics, Pace Chart, Elevation Profile & Splits) */}
      {showDetails && (
        <div className="p-5 space-y-4 bg-slate-50/70 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800">
          {isRunning && dynamics && (
            <RunningAnalyticsView activity={enrichedActivity} />
          )}

          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Grafik Pace & Elevasi Rute</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaceChart splits={activity.splits} />
              <ElevationChart splits={activity.splits} rawPoints={activity.routePoints} />
            </div>
          </div>

          {activity.splits && activity.splits.length > 0 && (
            <SplitsTable splits={activity.splits} />
          )}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleKudos}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isKudoed
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Heart className={`w-4 h-4 ${isKudoed ? "fill-red-500 text-red-500" : ""}`} />
            <span>{kudosCount} Kudos</span>
          </button>

          <button
            type="button"
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentCount} Comments</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onFlyoverClick && (
            <button
              type="button"
              onClick={() => onFlyoverClick(activity)}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/20 transition-all flex items-center gap-1.5"
              title="Putar Animasi 3D Flyover Relive"
            >
              <Film className="w-3.5 h-3.5" />
              <span>3D Flyover</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            {showDetails 
              ? "Tutup Analitik" 
              : isRunning 
                ? "🏃 Running Analytics & Splits" 
                : "View Splits & Charts"}
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onShareClick(activity)}
            className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
            title="Generate SPORTIVA Share Card"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2.5 text-xs">
                <img
                  src={c.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                  alt={c.userName}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="flex-1 bg-white dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{c.userName}</span>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Berikan ucapan selamat atau komentar..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Kirim
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
