import React, { useState } from "react";
import { Trophy, Medal, MapPin, Flame, ArrowUp, ArrowDown, Sparkles, Filter } from "lucide-react";
import { formatDistance, formatDuration } from "../utils/formatters";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  distanceKm: number;
  elevationM: number;
  activitiesCount: number;
  isCurrentUser?: boolean;
}

export const LeaderboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all_time">("weekly");
  const [metric, setMetric] = useState<"distance" | "elevation">("distance");

  const leaderboardData: LeaderboardUser[] = [
    {
      rank: 1,
      id: "u_1",
      name: "Budi Santoso",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      location: "Jember, Indonesia",
      distanceKm: 84.6,
      elevationM: 820,
      activitiesCount: 7
    },
    {
      rank: 2,
      id: "user_andi_sportiva",
      name: "Andi Prasetyo (You)",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      location: "Jember, Indonesia",
      distanceKm: 68.4,
      elevationM: 540,
      activitiesCount: 6,
      isCurrentUser: true
    },
    {
      rank: 3,
      id: "u_3",
      name: "Siti Rahmawati",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
      location: "Surabaya, Indonesia",
      distanceKm: 52.8,
      elevationM: 310,
      activitiesCount: 5
    },
    {
      rank: 4,
      id: "u_4",
      name: "Reza Mahendra",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      location: "Malang, Indonesia",
      distanceKm: 48.2,
      elevationM: 670,
      activitiesCount: 4
    },
    {
      rank: 5,
      id: "u_5",
      name: "Dian Sastrowardoyo",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
      location: "Jakarta, Indonesia",
      distanceKm: 42.1,
      elevationM: 190,
      activitiesCount: 4
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
          Klasemen & Leaderboard 🏅
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pantau peringkat volume jarak dan akumulasi elevasi tanjakan terbaik di komunitas SPORTIVA.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {(["weekly", "monthly", "all_time"] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                timeframe === tf
                  ? "bg-white dark:bg-slate-800 text-orange-500 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tf.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMetric("distance")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              metric === "distance"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Total Jarak (KM)
          </button>
          <button
            type="button"
            onClick={() => setMetric("elevation")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              metric === "elevation"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Elevasi Tanjakan (m)
          </button>
        </div>
      </div>

      {/* Podium Showcase (Top 3) */}
      <div className="grid grid-cols-3 gap-3 pt-6 items-end">
        {/* 2nd Place */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 text-center space-y-2 shadow-sm order-1">
          <div className="relative inline-block">
            <img
              src={leaderboardData[1].avatarUrl}
              alt={leaderboardData[1].name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto border-2 border-slate-400"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-400 text-slate-950 font-black text-xs">
              #2
            </span>
          </div>
          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-2">
            {leaderboardData[1].name}
          </div>
          <div className="text-sm sm:text-base font-display font-black text-orange-500">
            {metric === "distance" ? `${leaderboardData[1].distanceKm} KM` : `+${leaderboardData[1].elevationM}m`}
          </div>
        </div>

        {/* 1st Place (Champion) */}
        <div className="bg-gradient-to-b from-orange-500/20 to-amber-500/10 dark:from-orange-950/40 dark:to-slate-900 border-2 border-orange-500 rounded-3xl p-5 text-center space-y-2.5 shadow-xl order-2 pb-6">
          <div className="text-2xl animate-bounce">👑</div>
          <div className="relative inline-block">
            <img
              src={leaderboardData[0].avatarUrl}
              alt={leaderboardData[0].name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto border-2 border-orange-500"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
              #1
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {leaderboardData[0].name}
          </div>
          <div className="text-base sm:text-xl font-display font-black text-orange-500">
            {metric === "distance" ? `${leaderboardData[0].distanceKm} KM` : `+${leaderboardData[0].elevationM}m`}
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 text-center space-y-2 shadow-sm order-3">
          <div className="relative inline-block">
            <img
              src={leaderboardData[2].avatarUrl}
              alt={leaderboardData[2].name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto border-2 border-amber-700"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs">
              #3
            </span>
          </div>
          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-2">
            {leaderboardData[2].name}
          </div>
          <div className="text-sm sm:text-base font-display font-black text-orange-500">
            {metric === "distance" ? `${leaderboardData[2].distanceKm} KM` : `+${leaderboardData[2].elevationM}m`}
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboardData.map(u => (
            <div
              key={u.id}
              className={`p-4 flex items-center justify-between transition-colors ${
                u.isCurrentUser ? "bg-orange-500/10 dark:bg-orange-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className={`w-6 text-center font-display font-extrabold text-sm ${
                  u.rank === 1 ? "text-amber-500" : u.rank === 2 ? "text-slate-400" : u.rank === 3 ? "text-amber-700" : "text-slate-400"
                }`}>
                  #{u.rank}
                </span>

                <img
                  src={u.avatarUrl}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />

                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{u.name}</span>
                    {u.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-500 text-white font-bold">YOU</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {u.location} • {u.activitiesCount} Aktivitas
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                  {metric === "distance" ? `${u.distanceKm} KM` : `+${u.elevationM}m`}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {metric === "distance" ? `Elev: +${u.elevationM}m` : `Jarak: ${u.distanceKm} KM`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
