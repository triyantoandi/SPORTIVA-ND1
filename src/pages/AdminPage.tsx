import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity as ActivityIcon, 
  Users, 
  Database, 
  Server, 
  Lock,
  Search
} from "lucide-react";
import { AdminService } from "../firebase/services/notificationService";
import { ReportItem } from "../types";

export const AdminPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(AdminService.getReports());

  const handleAction = (reportId: string, action: "reviewed" | "dismissed" | "actioned") => {
    AdminService.updateReportStatus(reportId, action);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action } : r));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-orange-500" />
          <span>SPORTIVA Security & Admin Moderation Console</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pantau integritas GPS anti-cheat, laporan komunitas, validasi leaderboard, dan sistem kesehatan platform.
        </p>
      </div>

      {/* System Infrastructure Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Database</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono-sport font-black text-emerald-400">FIRESTORE 100%</div>
          <div className="text-[10px] text-slate-400">Rules Deployed & Secured</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Coach Engine</span>
            <Server className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-mono-sport font-black text-orange-400">GEMINI API PROXY</div>
          <div className="text-[10px] text-slate-400">Sport Science Models Online</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Anti-Cheat Status</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-mono-sport font-black text-white">ACTIVE (v2.4)</div>
          <div className="text-[10px] text-slate-400">Teleport & Speed Heuristics</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-mono-sport font-black text-amber-400">
            {reports.filter(r => r.status === "pending").length} Reports
          </div>
          <div className="text-[10px] text-slate-400">Awaiting Admin Action</div>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Antrean Flagging GPS & Laporan Komunitas
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports.map(r => (
            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    {r.targetType}
                  </span>
                  <span className="text-xs text-slate-400">
                    Dilaporkan oleh: <strong>{r.reporterName}</strong>
                  </span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                    r.status === "pending" ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
                  }`}>
                    {r.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {r.targetTitle}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {r.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {r.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(r.id, "dismissed")}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      Abaikan / Valid
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(r.id, "actioned")}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/20"
                    >
                      Diskualifikasi & Hapus
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold italic">
                    Telah diproses ({r.status})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
