import React, { useState, useEffect } from "react";
import { Trophy, Award, CheckCircle2, Flame, Target, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Challenge } from "../types";
import { ChallengeService } from "../firebase/services/challengeService";
import { useAuth } from "../hooks/useAuth";
import { formatDuration, formatPace } from "../utils/formatters";
import confetti from "canvas-confetti";

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const load = async () => {
      const list = await ChallengeService.fetchChallenges();
      setChallenges(list);
    };
    load();
  }, []);

  const handleJoin = async (challengeId: string) => {
    await ChallengeService.joinChallenge(challengeId);
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isJoined: true, participantCount: c.participantCount + 1 } : c));
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const prs = user.personalRecords;

  const prList = [
    { title: "Fastest 1 KM", data: prs.fastest1k, icon: "⚡" },
    { title: "Fastest 5 KM", data: prs.fastest5k, icon: "🏃" },
    { title: "Fastest 10 KM", data: prs.fastest10k, icon: "🔥" },
    { title: "Half Marathon (21.1K)", data: prs.fastestHalfMarathon, icon: "🏅" },
    { title: "Full Marathon (42.2K)", data: prs.fastestMarathon, icon: "👑" },
    { title: "Longest Distance Run", data: prs.longestRun ? { ...prs.longestRun, timeSec: prs.longestRun.durationSec, paceMinPerKm: (prs.longestRun.durationSec/60)/prs.longestRun.distanceKm } : null, isDist: true, icon: "🗺️" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
          Tantangan Bulanan & Rekor Pribadi (PR) 🏆
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Taklukkan target olahraga komunitas, raih lencana eksklusif, dan lampaui batas rekor terbaik Anda.
        </p>
      </div>

      {/* Personal Records Showcase Trophy Case */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-extrabold text-base text-white">All-Time Personal Records (PR) Cabinet</h3>
          </div>
          <span className="text-xs font-mono text-orange-400 font-bold">Auto-Detected by GPS Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {prList.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-orange-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PR</span>
                </div>
                <div className="text-xs font-bold text-slate-300 mt-2">{item.title}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60">
                {item.data ? (
                  <div>
                    <div className="text-lg font-mono-sport font-extrabold text-orange-400">
                      {item.isDist ? `${item.data.distanceKm} KM` : formatDuration(item.data.timeSec)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Pace: {formatPace(item.data.paceMinPerKm)} /km
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-semibold italic">Belum tercatat</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Community Challenges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Tantangan Komunitas Sedang Berlangsung
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {challenges.map(c => {
            const progressPct = Math.min(100, Math.round(((c.userProgress || 0) / c.targetValue) * 100));

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center text-3xl shrink-0 border border-orange-500/30 shadow-inner">
                      {c.badgeIcon}
                    </div>
                    <div>
                      <h4 className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar if joined */}
                {c.isJoined ? (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Progres Anda:</span>
                      <span className="font-mono text-orange-500 font-bold">
                        {c.userProgress || 0} / {c.targetValue} {c.unit} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Target: {c.targetValue} {c.unit} • {c.participantCount} Peserta Terdaftar</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400">
                    Lencana Eksklusif: {c.badgeIcon}
                  </span>

                  {c.isJoined ? (
                    <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(c.id)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-950/20"
                    >
                      Ikuti Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
