import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Activity, 
  Flame, 
  Zap, 
  Timer, 
  Gauge, 
  Award, 
  X, 
  TrendingUp, 
  Sliders, 
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { formatDuration, formatPace } from "../../utils/formatters";

interface SportScienceCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CalcTab = "hr_zones" | "race_predictor" | "splits_planner" | "vo2max";

export const SportScienceCalculatorModal: React.FC<SportScienceCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<CalcTab>("hr_zones");

  // State for HR Zones
  const [age, setAge] = useState<number>(28);
  const [restingHr, setRestingHr] = useState<number>(55);
  const [customMaxHr, setCustomMaxHr] = useState<number | "">("");
  const [hrFormula, setHrFormula] = useState<"karvonen" | "tanaka" | "standard">("karvonen");

  // State for Race Predictor
  const [inputDistanceKm, setInputDistanceKm] = useState<number>(5);
  const [inputHours, setInputHours] = useState<number>(0);
  const [inputMinutes, setInputMinutes] = useState<number>(23);
  const [inputSeconds, setInputSeconds] = useState<number>(30);

  // State for Splits Planner
  const [targetDistanceKm, setTargetDistanceKm] = useState<number>(21.1); // Half Marathon
  const [targetHours, setTargetHours] = useState<number>(1);
  const [targetMinutes, setTargetMinutes] = useState<number>(45);
  const [targetSeconds, setTargetSeconds] = useState<number>(0);
  const [splitStrategy, setSplitStrategy] = useState<"even" | "negative" | "positive">("negative");

  // State for VO2 Max
  const [cooperMeters, setCooperMeters] = useState<number>(2800);
  const [gender, setGender] = useState<"male" | "female">("male");

  if (!isOpen) return null;

  // 1. Calculate Max HR & HR Zones
  const calculatedMaxHr = useMemo(() => {
    if (typeof customMaxHr === "number" && customMaxHr > 100) return customMaxHr;
    if (hrFormula === "tanaka") return Math.round(208 - 0.7 * age);
    return Math.round(220 - age);
  }, [age, customMaxHr, hrFormula]);

  const hrZones = useMemo(() => {
    const maxHr = calculatedMaxHr;
    const rHr = restingHr;
    const hrr = maxHr - rHr; // Heart Rate Reserve

    const calcZoneBpm = (pct: number) => {
      if (hrFormula === "karvonen") {
        return Math.round(rHr + (hrr * (pct / 100)));
      }
      return Math.round(maxHr * (pct / 100));
    };

    return [
      {
        zone: "Z1",
        name: "Active Recovery",
        pctRange: "50% - 60%",
        minBpm: calcZoneBpm(50),
        maxBpm: calcZoneBpm(60),
        color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
        purpose: "Regenerasi laktat, pemulihan aktif, dan meningkatkan sirkulasi darah kapiler tanpa membebani otot."
      },
      {
        zone: "Z2",
        name: "Aerobic Base / Fat Burn",
        pctRange: "60% - 70%",
        minBpm: calcZoneBpm(60),
        maxBpm: calcZoneBpm(70),
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        purpose: "Membangun kepadatan mitokondria, memperbesar volume jantung, dan melatih efisiensi metabolisme lemak."
      },
      {
        zone: "Z3",
        name: "Aerobic Tempo",
        pctRange: "70% - 80%",
        minBpm: calcZoneBpm(70),
        maxBpm: calcZoneBpm(80),
        color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
        purpose: "Meningkatkan kapasitas penyimpanan glikogen otot dan stamina jarak jauh (Half/Full Marathon pace)."
      },
      {
        zone: "Z4",
        name: "Lactate Threshold",
        pctRange: "80% - 90%",
        minBpm: calcZoneBpm(80),
        maxBpm: calcZoneBpm(90),
        color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
        purpose: "Menunda titik penumpukan asam laktat (Onset of Blood Lactate Accumulation) untuk performa 10K/5K cepat."
      },
      {
        zone: "Z5",
        name: "VO2 Max / Anaerobic",
        pctRange: "90% - 100%",
        minBpm: calcZoneBpm(90),
        maxBpm: maxHr,
        color: "text-red-400 border-red-500/30 bg-red-500/10",
        purpose: "Mengembangkan volume konsumsi oksigen maksimal (VO2 Max) dan kecepatan sprint puncak."
      }
    ];
  }, [calculatedMaxHr, restingHr, hrFormula]);

  // 2. Calculate Race Predictions (Pete Riegel Formula: T2 = T1 * (D2 / D1)^1.06)
  const inputTotalSec = (inputHours * 3600) + (inputMinutes * 60) + inputSeconds;
  const racePredictions = useMemo(() => {
    if (inputTotalSec <= 0 || inputDistanceKm <= 0) return [];

    const targetDistances = [
      { name: "1 KM", dist: 1.0 },
      { name: "3 KM", dist: 3.0 },
      { name: "5 KM", dist: 5.0 },
      { name: "10 KM", dist: 10.0 },
      { name: "15 KM", dist: 15.0 },
      { name: "Half Marathon (21.1K)", dist: 21.0975 },
      { name: "Full Marathon (42.2K)", dist: 42.195 }
    ];

    return targetDistances.map(item => {
      // Riegel's power formula
      const predictedSec = Math.round(inputTotalSec * Math.pow(item.dist / inputDistanceKm, 1.06));
      const paceMinPerKm = (predictedSec / 60) / item.dist;
      const speedKmh = item.dist / (predictedSec / 3600);

      return {
        name: item.name,
        distKm: item.dist,
        timeSec: predictedSec,
        formattedTime: formatDuration(predictedSec),
        pace: formatPace(paceMinPerKm),
        speed: speedKmh.toFixed(1)
      };
    });
  }, [inputTotalSec, inputDistanceKm]);

  // Estimate VDOT score based on 5K / 10K input
  const estimatedVdot = useMemo(() => {
    if (inputTotalSec <= 0 || inputDistanceKm <= 0) return 0;
    const velocityMPerMin = (inputDistanceKm * 1000) / (inputTotalSec / 60);
    // Jack Daniels' VDOT approximation formula
    const vo2 = -4.60 + 0.182258 * velocityMPerMin + 0.000104 * Math.pow(velocityMPerMin, 2);
    const dropDead = 0.8 + 0.1894393 * Math.exp(-0.012778 * (inputTotalSec / 60)) + 0.2989558 * Math.exp(-0.1932605 * (inputTotalSec / 60));
    const vdot = vo2 / dropDead;
    return Math.round(vdot * 10) / 10;
  }, [inputTotalSec, inputDistanceKm]);

  // 3. Pacing Splits Planner
  const targetTotalSec = (targetHours * 3600) + (targetMinutes * 60) + targetSeconds;
  const splitSchedule = useMemo(() => {
    if (targetTotalSec <= 0 || targetDistanceKm <= 0) return [];

    const numKm = Math.ceil(targetDistanceKm);
    const avgPaceSecPerKm = targetTotalSec / targetDistanceKm;
    const splits: { km: number; splitPace: string; splitTime: string; cumulativeTime: string }[] = [];

    let accumulatedSec = 0;

    for (let k = 1; k <= numKm; k++) {
      let paceFactor = 1.0;
      if (splitStrategy === "negative") {
        // Starts 2% slower, ends 2% faster
        const progress = (k - 1) / (numKm - 1 || 1);
        paceFactor = 1.025 - (progress * 0.05);
      } else if (splitStrategy === "positive") {
        const progress = (k - 1) / (numKm - 1 || 1);
        paceFactor = 0.975 + (progress * 0.05);
      }

      const kmFraction = k === numKm && targetDistanceKm % 1 !== 0 ? (targetDistanceKm % 1) : 1.0;
      const thisKmPaceSec = avgPaceSecPerKm * paceFactor;
      const thisKmDurationSec = thisKmPaceSec * kmFraction;
      accumulatedSec += thisKmDurationSec;

      splits.push({
        km: k,
        splitPace: formatPace(thisKmPaceSec / 60),
        splitTime: formatDuration(Math.round(thisKmDurationSec)),
        cumulativeTime: formatDuration(Math.round(accumulatedSec))
      });
    }

    return splits;
  }, [targetTotalSec, targetDistanceKm, splitStrategy]);

  // 4. VO2 Max (Cooper Test: (Meters - 504.9) / 44.73)
  const calculatedVo2Max = useMemo(() => {
    const val = (cooperMeters - 504.9) / 44.73;
    return Math.max(10, Math.round(val * 10) / 10);
  }, [cooperMeters]);

  const fitnessGrade = useMemo(() => {
    if (calculatedVo2Max >= 55) return { label: "Superior / Elite Atlet", color: "text-purple-400 bg-purple-500/20" };
    if (calculatedVo2Max >= 47) return { label: "Excellent / Sangat Baik", color: "text-emerald-400 bg-emerald-500/20" };
    if (calculatedVo2Max >= 42) return { label: "Good / Baik", color: "text-cyan-400 bg-cyan-500/20" };
    if (calculatedVo2Max >= 35) return { label: "Average / Rata-rata", color: "text-amber-400 bg-amber-500/20" };
    return { label: "Perlu Latihan Aerobik", color: "text-orange-400 bg-orange-500/20" };
  }, [calculatedVo2Max]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white flex items-center gap-2">
                SPORT SCIENCE & ATHLETIC CALCULATOR
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  PRO ATHLETE OS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pusat kalkulasi fisiologi atlet, zona detak jantung (HR Zones), VDOT, dan strategi split race
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 overflow-x-auto gap-2">
          {[
            { id: "hr_zones" as CalcTab, label: "Zona Detak Jantung (HR Zones)", icon: Heart },
            { id: "race_predictor" as CalcTab, label: "Prediksi Waktu Lomba & VDOT", icon: Award },
            { id: "splits_planner" as CalcTab, label: "Strategi Split Kilometer", icon: Timer },
            { id: "vo2max" as CalcTab, label: "Kalkulator VO2 Max & Cooper", icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "border-orange-500 text-orange-400 bg-slate-900/60 rounded-t-xl"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: Heart Rate Zones Calculator */}
          {activeTab === "hr_zones" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Parameters Input Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Usia (Tahun)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Resting HR (BPM)</label>
                  <input
                    type="number"
                    value={restingHr}
                    onChange={e => setRestingHr(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Max HR Kustom (BPM)</label>
                  <input
                    type="number"
                    placeholder="Opsional"
                    value={customMaxHr}
                    onChange={e => setCustomMaxHr(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Metode Rumus</label>
                  <select
                    value={hrFormula}
                    onChange={e => setHrFormula(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="karvonen">Karvonen (Heart Rate Reserve)</option>
                    <option value="tanaka">Tanaka (208 - 0.7*Age)</option>
                    <option value="standard">Standard (220 - Age)</option>
                  </select>
                </div>
              </div>

              {/* Max HR Alert Strip */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span className="text-xs font-semibold text-slate-200">
                    Max Heart Rate Dihitung: <strong className="text-orange-400 font-mono text-base ml-1">{calculatedMaxHr} BPM</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Heart Rate Reserve (HRR): {calculatedMaxHr - restingHr} BPM
                </span>
              </div>

              {/* 5 HR Zones Table Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Distribusi 5 Zona Latihan Fisiologis (Garmin / Strava Standard)
                </h4>

                <div className="space-y-2.5">
                  {hrZones.map((z) => (
                    <div
                      key={z.zone}
                      className={`p-4 rounded-2xl border ${z.color} space-y-1.5 transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-sport font-black text-base">{z.zone}</span>
                          <span className="font-bold text-sm text-white">{z.name}</span>
                          <span className="text-[10px] font-mono opacity-75">({z.pctRange})</span>
                        </div>

                        <div className="font-mono font-black text-base text-white">
                          {z.minBpm} - {z.maxBpm} <span className="text-xs font-normal text-slate-400">BPM</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {z.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Race Time Predictor & VDOT */}
          {activeTab === "race_predictor" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Input Benchmark Record */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Masukkan Rekor Lari Terkini Anda (Benchmark)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Jarak Benchmark (KM)</label>
                    <select
                      value={inputDistanceKm}
                      onChange={e => setInputDistanceKm(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="1">1 KM Time Trial</option>
                      <option value="3">3 KM Time Trial</option>
                      <option value="5">5 KM Race</option>
                      <option value="10">10 KM Race</option>
                      <option value="21.0975">Half Marathon (21.1 KM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Jam (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={inputHours}
                      onChange={e => setInputHours(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Menit (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputMinutes}
                      onChange={e => setInputMinutes(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Detik (Seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputSeconds}
                      onChange={e => setInputSeconds(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                  <span className="text-slate-400">
                    Pace Acuan: <strong className="text-white font-mono">{formatPace((inputTotalSec / 60) / inputDistanceKm)}/km</strong>
                  </span>
                  <span className="text-orange-400 font-mono font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Skor VDOT Jack Daniels: {estimatedVdot}
                  </span>
                </div>
              </div>

              {/* Predictions Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hasil Prediksi Waktu Selesai (Riegel's Endurance Formula)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {racePredictions.map(pred => (
                    <div
                      key={pred.name}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{pred.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Pace: <span className="text-orange-400 font-bold">{pred.pace}/km</span> • Speed: {pred.speed} km/h
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-mono-sport font-black text-emerald-400">
                          {pred.formattedTime}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Target Waktu</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Splits Strategy Planner */}
          {activeTab === "splits_planner" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Inputs */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Jarak (KM)</label>
                    <select
                      value={targetDistanceKm}
                      onChange={e => setTargetDistanceKm(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="5">5 KM Fun Run</option>
                      <option value="10">10 KM Race</option>
                      <option value="21.0975">Half Marathon (21.1 KM)</option>
                      <option value="42.195">Full Marathon (42.2 KM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Jam</label>
                    <input
                      type="number"
                      min="0"
                      value={targetHours}
                      onChange={e => setTargetHours(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Menit</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={targetMinutes}
                      onChange={e => setTargetMinutes(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Strategi Pacing</label>
                    <select
                      value={splitStrategy}
                      onChange={e => setSplitStrategy(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="negative">Negative Split (Juara Dunia)</option>
                      <option value="even">Even Pace (Konstan)</option>
                      <option value="positive">Positive Split (Start Cepat)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Split Schedule Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tabel Jadwal Split per Kilometer ({splitSchedule.length} KM)
                  </h4>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    Pace Rata-rata: {formatPace((targetTotalSec / 60) / targetDistanceKm)}/km
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80">
                  {splitSchedule.map(s => (
                    <div key={s.km} className="px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                          {s.km}
                        </span>
                        <span className="text-slate-300 font-semibold">Kilometer {s.km}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-orange-400 font-bold">{s.splitPace}/km</span>
                        <span className="text-slate-400">{s.splitTime}</span>
                        <span className="text-emerald-400 font-bold w-16 text-right">{s.cumulativeTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VO2 Max & Cooper Test */}
          {activeTab === "vo2max" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Cooper 12-Minute Aerobic Field Test
                </h4>
                <p className="text-xs text-slate-300">
                  Tes Cooper mengukur seberapa jauh jarak (dalam meter) yang dapat Anda tempuh saat berlari sekuat tenaga selama tepat 12 menit.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Jarak Tempuh 12 Menit (Meter)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={cooperMeters}
                      onChange={e => setCooperMeters(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="male">Pria (Male)</option>
                      <option value="female">Wanita (Female)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Result Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  ESTIMASI NILAI VO2 MAX FISIOLOGIS
                </span>

                <div className="text-6xl font-display font-black text-orange-400">
                  {calculatedVo2Max} <span className="text-base font-normal text-slate-400">ml/kg/min</span>
                </div>

                <div className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-current">
                  <span className={fitnessGrade.color}>{fitnessGrade.label}</span>
                </div>

                <p className="text-xs text-slate-400 max-w-md mx-auto pt-2 leading-relaxed">
                  VO2 Max adalah indikator standar emas daya tahan kardiovaskular dan efisiensi serapan oksigen tubuh saat berolahraga.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
