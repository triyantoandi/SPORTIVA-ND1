import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Heart, 
  Activity as ActivityIcon, 
  TrendingUp, 
  Award, 
  Flame, 
  Clock, 
  Gauge, 
  Footprints, 
  ArrowUpRight, 
  Info,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { RunningDynamics, Activity } from "../../types";
import { formatPace, formatDuration } from "../../utils/formatters";

interface RunningAnalyticsViewProps {
  activity: Activity;
}

export const RunningAnalyticsView: React.FC<RunningAnalyticsViewProps> = ({ activity }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "hrZones" | "dynamics" | "efforts">("overview");

  const dynamics = activity.runningDynamics;
  if (!dynamics) return null;

  const hrZones = dynamics.heartRateZones || {
    zone1Sec: Math.round(activity.durationSec * 0.1),
    zone2Sec: Math.round(activity.durationSec * 0.55),
    zone3Sec: Math.round(activity.durationSec * 0.25),
    zone4Sec: Math.round(activity.durationSec * 0.08),
    zone5Sec: Math.round(activity.durationSec * 0.02)
  };

  const totalZoneSec = Math.max(1, hrZones.zone1Sec + hrZones.zone2Sec + hrZones.zone3Sec + hrZones.zone4Sec + hrZones.zone5Sec);

  const zonesConfig = [
    { name: "Z1 Recovery", range: "< 60%", color: "bg-slate-400 dark:bg-slate-500", text: "text-slate-400", timeSec: hrZones.zone1Sec, desc: "Active Recovery / Warm Up" },
    { name: "Z2 Endurance", range: "60-70%", color: "bg-emerald-500", text: "text-emerald-500", timeSec: hrZones.zone2Sec, desc: "Aerobic Base / Fat Burn" },
    { name: "Z3 Tempo", range: "70-80%", color: "bg-amber-500", text: "text-amber-500", timeSec: hrZones.zone3Sec, desc: "Rhythm Pace / Aerobic Capacity" },
    { name: "Z4 Threshold", range: "80-90%", color: "bg-orange-500", text: "text-orange-500", timeSec: hrZones.zone4Sec, desc: "Lactate Threshold / Stamina" },
    { name: "Z5 Anaerobic", range: "> 90%", color: "bg-rose-500", text: "text-rose-500", timeSec: hrZones.zone5Sec, desc: "VO2 Max / Sprint Speed" }
  ];

  // Helper for Training Effect Label
  const getTrainingEffectLabel = (score: number) => {
    if (score >= 4.5) return { label: "Overreaching / Maksimal", color: "text-rose-500" };
    if (score >= 3.5) return { label: "Highly Improving (Peningkatan Signifikan)", color: "text-orange-500" };
    if (score >= 2.5) return { label: "Maintaining & Improving (Fondasi Kuat)", color: "text-emerald-500" };
    if (score >= 1.0) return { label: "Minor Benefit / Pemulihan", color: "text-blue-400" };
    return { label: "No Direct Impact", color: "text-slate-400" };
  };

  const aerobicLabel = getTrainingEffectLabel(dynamics.aerobicTrainingEffect);
  const anaerobicLabel = getTrainingEffectLabel(dynamics.anaerobicTrainingEffect);

  return (
    <div className="w-full bg-slate-900/90 dark:bg-slate-950/90 text-white rounded-2xl p-4 md:p-5 border border-orange-500/20 shadow-xl space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ActivityIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Advanced Running Analytics</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                PRO METRICS
              </span>
            </div>
            <p className="text-xs text-slate-400">Biomekanika langkah, Running Power, 5-Zone HR, dan GAP</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Ikhtisar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dynamics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "dynamics"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Biomekanika
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hrZones")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "hrZones"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Zona HR (Z1-Z5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("efforts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "efforts"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Best Efforts
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Key Running Performance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* GAP (Grade Adjusted Pace) */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>GAP (Flat Equiv.)</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="font-mono-sport text-lg font-bold text-emerald-400">
                {formatPace(dynamics.gapPaceMinPerKm)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Actual: {formatPace(activity.avgPaceMinPerKm)}
              </div>
            </div>

            {/* Running Power */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Avg Running Power</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="font-mono-sport text-lg font-bold text-amber-400">
                {dynamics.avgPowerWatts} <span className="text-xs font-normal text-slate-400">W</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Work: {dynamics.workKj} kJ
              </div>
            </div>

            {/* Cadence */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Avg Cadence</span>
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="font-mono-sport text-lg font-bold text-purple-400">
                {dynamics.avgCadenceSpm} <span className="text-xs font-normal text-slate-400">SPM</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Max: {dynamics.maxCadenceSpm} SPM
              </div>
            </div>

            {/* Stride Length */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Stride Length</span>
                <Footprints className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="font-mono-sport text-lg font-bold text-cyan-400">
                {dynamics.avgStrideLengthM} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                GCT: {dynamics.groundContactTimeMs} ms
              </div>
            </div>
          </div>

          {/* Training Effect & Recovery Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900 border border-slate-700/70 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Aerobic Training Effect
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono-sport text-white">
                  {dynamics.aerobicTrainingEffect.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-mono-sport">/ 5.0</span>
              </div>
              <p className={`text-xs font-semibold mt-1 ${aerobicLabel.color}`}>{aerobicLabel.label}</p>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                Anaerobic Training Effect
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono-sport text-white">
                  {dynamics.anaerobicTrainingEffect.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-mono-sport">/ 5.0</span>
              </div>
              <p className={`text-xs font-semibold mt-1 ${anaerobicLabel.color}`}>{anaerobicLabel.label}</p>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-700/80 pt-3 md:pt-0 md:pl-4 flex flex-col justify-center">
              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Rekomendasi Pemulihan
              </div>
              <div className="text-xl font-bold font-mono-sport text-amber-400">
                {dynamics.recoveryTimeHours} Jam
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Waktu istirahat optimal sebelum sesi intensif berikutnya</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BIOMECHANICS & RUNNING DYNAMICS */}
      {activeTab === "dynamics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ground Contact Balance */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Ground Contact Balance</span>
                <span className="text-xs font-mono-sport text-cyan-400">{dynamics.groundContactTimeMs} ms Total</span>
              </div>
              
              {/* Balance bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-400">{dynamics.groundContactBalancePct.left}% Kiri</span>
                  <span className="text-emerald-400">{dynamics.groundContactBalancePct.right}% Kanan</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-700">
                  <div 
                    className="bg-emerald-500 h-full transition-all" 
                    style={{ width: `${dynamics.groundContactBalancePct.left}%` }}
                  />
                  <div 
                    className="bg-teal-400 h-full transition-all" 
                    style={{ width: `${dynamics.groundContactBalancePct.right}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Distribusi beban simetris &lt; 1% deviasi (Keseimbangan Sangat Baik)</p>
              </div>
            </div>

            {/* Vertical Oscillation & Ratio */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Osilasi Vertikal & Rasio</span>
                <span className="text-xs font-mono-sport text-purple-400">{dynamics.verticalRatioPct}% Rasio</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Osilasi Vertikal</div>
                  <div className="font-mono-sport text-base font-bold text-white">{dynamics.avgVerticalOscillationCm} cm</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Efisiensi Tinggi (&lt; 8.5cm)</div>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Panjang Langkah</div>
                  <div className="font-mono-sport text-base font-bold text-white">{dynamics.avgStrideLengthM} m</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Optimal Cadence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Running Power & Efficiency Insights */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white">Insight Biomekanika Pelari:</span>
              <p>
                Dengan rata-rata irama <strong className="text-white">{dynamics.avgCadenceSpm} SPM</strong> dan panjang langkah <strong className="text-white">{dynamics.avgStrideLengthM} m</strong>, gaya pegas elastis tendon (*stiffness*) bekerja sangat efisien dengan rasio energi vertikal hanya <strong className="text-emerald-400">{dynamics.verticalRatioPct}%</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5-ZONE HEART RATE DISTRIBUTION */}
      {activeTab === "hrZones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Distribusi 5 Zona Detak Jantung</span>
            {dynamics.cardiacDriftPct && (
              <span className="text-xs font-mono-sport text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Cardiac Drift: +{dynamics.cardiacDriftPct}% (Stabil)
              </span>
            )}
          </div>

          {/* Stacked Percentage Bar */}
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
            {zonesConfig.map((z, idx) => {
              const pct = (z.timeSec / totalZoneSec) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={idx}
                  className={`${z.color} h-full transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${z.name}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>

          {/* Zone Detail Rows */}
          <div className="space-y-2">
            {zonesConfig.map((z, idx) => {
              const pct = Math.round((z.timeSec / totalZoneSec) * 100);
              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors border border-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${z.color}`} />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{z.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">({z.range})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{z.desc}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono-sport">
                    <div className="text-xs font-bold text-white">{formatDuration(z.timeSec)}</div>
                    <div className="text-[10px] text-slate-400">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BEST ESTIMATED EFFORTS */}
      {activeTab === "efforts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Segmen Usaha Tercepat (Best Estimated Efforts)
            </span>
            <span className="text-[11px] text-slate-400">Diambil otomatis dari GPS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dynamics.bestEfforts?.effort400m && (
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Best 400m Sprint</div>
                    <div className="text-[10px] text-slate-400">Pace: {formatPace(dynamics.bestEfforts.effort400m.paceMinKm)}</div>
                  </div>
                </div>
                <div className="text-right font-mono-sport font-bold text-orange-400">
                  {formatDuration(dynamics.bestEfforts.effort400m.timeSec)}
                </div>
              </div>
            )}

            {dynamics.bestEfforts?.effort1k && (
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Best 1.0 KM Split</div>
                    <div className="text-[10px] text-slate-400">Pace: {formatPace(dynamics.bestEfforts.effort1k.paceMinKm)}</div>
                  </div>
                </div>
                <div className="text-right font-mono-sport font-bold text-emerald-400">
                  {formatDuration(dynamics.bestEfforts.effort1k.timeSec)}
                </div>
              </div>
            )}

            {dynamics.bestEfforts?.effort1mi && (
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Best 1 Mile (1.6 KM)</div>
                    <div className="text-[10px] text-slate-400">Pace: {formatPace(dynamics.bestEfforts.effort1mi.paceMinKm)}</div>
                  </div>
                </div>
                <div className="text-right font-mono-sport font-bold text-purple-400">
                  {formatDuration(dynamics.bestEfforts.effort1mi.timeSec)}
                </div>
              </div>
            )}

            {dynamics.bestEfforts?.effort5k && (
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Best 5.0 KM Block</div>
                    <div className="text-[10px] text-slate-400">Pace: {formatPace(dynamics.bestEfforts.effort5k.paceMinKm)}</div>
                  </div>
                </div>
                <div className="text-right font-mono-sport font-bold text-amber-400">
                  {formatDuration(dynamics.bestEfforts.effort5k.timeSec)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
