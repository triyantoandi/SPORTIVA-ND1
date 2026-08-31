import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Split } from "../../types";

interface ElevationChartProps {
  splits?: Split[];
  rawPoints?: { altitude?: number | null }[];
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ splits = [], rawPoints = [] }) => {
  let data: { name: string; elevation: number }[] = [];

  if (splits.length > 0) {
    let currentElev = 80;
    data = splits.map((s, idx) => {
      currentElev += s.elevationChangeM;
      return {
        name: `KM ${idx + 1}`,
        elevation: currentElev
      };
    });
  } else if (rawPoints.length > 0) {
    data = rawPoints.map((p, idx) => ({
      name: `${idx + 1}`,
      elevation: p.altitude || 80
    }));
  }

  if (data.length === 0) {
    data = [
      { name: "KM 1", elevation: 82 },
      { name: "KM 2", elevation: 89 },
      { name: "KM 3", elevation: 101 },
      { name: "KM 4", elevation: 124 },
      { name: "KM 5", elevation: 114 },
      { name: "KM 6", elevation: 98 },
      { name: "KM 7", elevation: 84 }
    ];
  }

  return (
    <div className="w-full h-56 bg-slate-900/40 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Elevation Profile</span>
        <span className="text-xs text-orange-400 font-mono font-medium">Gain: ~82 m</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 10', 'dataMax + 10']} tickLine={false} unit="m" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value: any) => [`${value} m`, "Elevation"]}
          />
          <Area type="monotone" dataKey="elevation" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorElev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PaceChart: React.FC<{ splits?: Split[] }> = ({ splits = [] }) => {
  const data = (splits.length > 0 ? splits : [
    { splitNumber: 1, paceMinPerKm: 5.17 },
    { splitNumber: 2, paceMinPerKm: 5.23 },
    { splitNumber: 3, paceMinPerKm: 5.30 },
    { splitNumber: 4, paceMinPerKm: 5.40 },
    { splitNumber: 5, paceMinPerKm: 5.33 },
    { splitNumber: 6, paceMinPerKm: 5.20 },
    { splitNumber: 7, paceMinPerKm: 5.13 }
  ]).map(s => ({
    name: `KM ${s.splitNumber}`,
    pace: s.paceMinPerKm
  }));

  return (
    <div className="w-full h-56 bg-slate-900/40 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pace Trend</span>
        <span className="text-xs text-orange-400 font-mono font-medium">Avg: 5:18 /km</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4713" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ff4713" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 0.5', 'dataMax + 0.5']} tickLine={false} unit="m" reversed />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value: any) => [`${Number(value).toFixed(2)} min/km`, "Pace"]}
          />
          <Area type="monotone" dataKey="pace" stroke="#ff4713" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPace)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SplitsTable: React.FC<{ splits: Split[] }> = ({ splits }) => {
  if (!splits || splits.length === 0) return null;

  // Find fastest split
  const minPace = Math.min(...splits.map(s => s.paceMinPerKm));

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
        <span>Automatic Kilometer Splits</span>
        <span className="text-xs font-normal text-slate-500">1.0 KM Interval</span>
      </h4>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400">
            <th className="pb-2">KM</th>
            <th className="pb-2">Pace</th>
            <th className="pb-2">Split Time</th>
            <th className="pb-2">Elevation</th>
            <th className="pb-2 text-right">Heart Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono-sport text-xs md:text-sm">
          {splits.map((s) => {
            const isFastest = s.paceMinPerKm === minPace;
            const mins = Math.floor(s.paceMinPerKm);
            const secs = Math.round((s.paceMinPerKm - mins) * 60);
            const paceStr = `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;

            const splitMins = Math.floor(s.timeSec / 60);
            const splitSecs = s.timeSec % 60;
            const timeStr = `${splitMins}:${splitSecs < 10 ? '0' : ''}${splitSecs}`;

            return (
              <tr key={s.splitNumber} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isFastest ? 'bg-orange-500/10' : ''}`}>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{s.splitNumber}</span>
                  {isFastest && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500 text-white font-sans font-bold">PR</span>
                  )}
                </td>
                <td className={`py-2.5 font-bold ${isFastest ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200'}`}>{paceStr}</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-300">{timeStr}</td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {s.elevationChangeM > 0 ? `+${s.elevationChangeM}m` : `${s.elevationChangeM}m`}
                </td>
                <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-300">
                  {s.avgHeartRate ? `${s.avgHeartRate} bpm` : '--'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
