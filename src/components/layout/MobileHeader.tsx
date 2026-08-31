import React, { useState } from "react";
import { 
  Bell, 
  Bot, 
  Flame, 
  Gauge, 
  Upload, 
  Radio, 
  Sparkles,
  BookOpen,
  Trophy,
  BarChart3,
  Calendar,
  Layers,
  Map,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { NotificationService } from "../../firebase/services/notificationService";

interface MobileHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAICoach: () => void;
  onOpenCalculator: () => void;
  onOpenGpxImport: () => void;
  onOpenBeaconModal: () => void;
  onOpenMenuDrawer: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAICoach,
  onOpenCalculator,
  onOpenGpxImport,
  onOpenBeaconModal,
  onOpenMenuDrawer
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = NotificationService.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const quickActionChips = [
    { id: "ai_coach", label: "AI Coach", icon: Bot, action: onOpenAICoach, color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
    { id: "calculator", label: "Kalkulator HR", icon: Gauge, action: onOpenCalculator, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
    { id: "gpx_import", label: "Impor GPX", icon: Upload, action: onOpenGpxImport, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
    { id: "live_beacon", label: "Live Beacon SOS", icon: Radio, action: onOpenBeaconModal, color: "text-red-500 bg-red-500/10 border-red-500/30" },
    { id: "training", label: "Training Plan", icon: BookOpen, action: () => setActiveTab("training"), color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
    { id: "challenges", label: "Tantangan & PR", icon: Trophy, action: () => setActiveTab("challenges"), color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3, action: () => setActiveTab("leaderboard"), color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
    { id: "events", label: "Event Race", icon: Calendar, action: () => setActiveTab("events"), color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
    { id: "routes", label: "Rute Planner", icon: Map, action: () => setActiveTab("routes"), color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30" },
    { id: "profile_gear", label: "Gear Closet", icon: Layers, action: () => setActiveTab("profile"), color: "text-slate-500 bg-slate-500/10 border-slate-500/30" }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 safe-area-pt">
      {/* Top Main Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Left: Avatar & App Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm active:scale-95 transition-transform shrink-0"
          >
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </button>

          <div className="cursor-pointer" onClick={() => setActiveTab("feed")}>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-wider text-slate-900 dark:text-white leading-none">
                SPORTIVA
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 font-mono px-1 py-0.2 rounded bg-orange-500/10">
                ATHLETIC OS
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-500 animate-pulse" />
              <span>{user.stats.currentStreak || 12} Hari Beruntun</span>
            </div>
          </div>
        </div>

        {/* Right: AI Coach Quick Button, Notifications & Theme */}
        <div className="flex items-center gap-1.5">
          {/* Quick AI Coach Icon Button */}
          <button
            type="button"
            onClick={onOpenAICoach}
            className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/30 hover:bg-orange-500/20 active:scale-95 transition-all"
            title="Tanya Gemini AI Coach"
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Tema Gelap/Terang"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              )}
            </button>

            {/* Notification Dropdown Modal */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Notifikasi ({unreadCount})
                  </span>
                  <button
                    onClick={() => {
                      NotificationService.markAllAsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] text-orange-500 font-bold hover:underline"
                  >
                    Tandai Dibaca
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-xl border text-[11px] ${
                        !n.isRead
                          ? "bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-orange-900/40"
                          : "bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Quick Action Chips Bar */}
      <div className="px-3 pb-2 pt-0.5 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {quickActionChips.map(chip => {
          const Icon = chip.icon;
          const isCurrentTab = activeTab === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={chip.action}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                isCurrentTab
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : chip.color
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
