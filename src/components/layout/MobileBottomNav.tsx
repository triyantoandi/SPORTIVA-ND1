import React from "react";
import { 
  Activity, 
  Map, 
  Plus, 
  Users, 
  Menu,
  Sparkles,
  Trophy,
  Calendar,
  BookOpen,
  BarChart3,
  User,
  Gauge,
  Upload,
  Radio,
  Bot
} from "lucide-react";
import { motion } from "motion/react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRecorder: () => void;
  onOpenMenuDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenRecorder,
  onOpenMenuDrawer
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 safe-area-pb shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Feed */}
        <button
          type="button"
          onClick={() => setActiveTab("feed")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "feed"
              ? "text-orange-500 font-extrabold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Activity className={`w-5 h-5 transition-transform ${activeTab === "feed" ? "scale-110" : ""}`} />
            {activeTab === "feed" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500"
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Feed</span>
        </button>

        {/* Tab 2: Routes / Explore */}
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "routes"
              ? "text-orange-500 font-extrabold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Map className={`w-5 h-5 transition-transform ${activeTab === "routes" ? "scale-110" : ""}`} />
            {activeTab === "routes" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500"
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Routes</span>
        </button>

        {/* Center: Glowing Floating Record FAB Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={onOpenRecorder}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex flex-col items-center justify-center shadow-xl shadow-orange-500/40 border-4 border-white dark:border-slate-900 active:scale-95 transition-transform group"
            title="Start GPS Activity Recorder"
          >
            <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-white">REC</span>
          </button>
        </div>

        {/* Tab 3: Clubs / Komunitas */}
        <button
          type="button"
          onClick={() => setActiveTab("clubs")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "clubs" || activeTab === "challenges"
              ? "text-orange-500 font-extrabold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${activeTab === "clubs" || activeTab === "challenges" ? "scale-110" : ""}`} />
            {(activeTab === "clubs" || activeTab === "challenges") && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500"
              />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Clubs</span>
        </button>

        {/* Tab 4: More / Menu Hub */}
        <button
          type="button"
          onClick={onOpenMenuDrawer}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "profile" || activeTab === "training" || activeTab === "leaderboard" || activeTab === "events" || activeTab === "admin"
              ? "text-orange-500 font-extrabold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          </div>
          <span className="text-[10px] tracking-tight mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
};
