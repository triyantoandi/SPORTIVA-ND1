import React, { useState } from "react";
import { 
  Plus, 
  Bell, 
  Bot, 
  Moon, 
  Sun, 
  Shield, 
  Flame, 
  User, 
  LogOut, 
  ChevronDown,
  Lock,
  Gauge,
  Upload
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { NotificationService } from "../../firebase/services/notificationService";
import { UserRole } from "../../types";

interface NavbarProps {
  onOpenRecorder: () => void;
  onOpenAICoach: () => void;
  onOpenAuth?: () => void;
  onOpenCalculator?: () => void;
  onOpenGpxImport?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRecorder,
  onOpenAICoach,
  onOpenAuth,
  onOpenCalculator,
  onOpenGpxImport,
  activeTab,
  setActiveTab
}) => {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const notifications = NotificationService.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roles: UserRole[] = ["USER", "CLUB_ADMIN", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("feed")}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-500/20">
            S
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-wider text-slate-900 dark:text-white">
              SPORTIVA
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-orange-500 ml-2 font-mono">
              ATHLETIC OS
            </span>
          </div>
        </div>

        {/* Center: Quick Tools (Calculator & GPX) & Streak */}
        <div className="hidden md:flex items-center gap-2">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              title="Kalkulator Heart Rate Zones & Race Predictor"
            >
              <Gauge className="w-3.5 h-3.5 text-orange-500" />
              <span>Kalkulator Atlet</span>
            </button>
          )}

          {onOpenGpxImport && (
            <button
              type="button"
              onClick={onOpenGpxImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              title="Impor file GPX/TCX Garmin & Strava"
            >
              <Upload className="w-3.5 h-3.5 text-orange-500" />
              <span>Impor GPX</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold ml-2">
            <Flame className="w-4 h-4 fill-orange-500 animate-pulse" />
            <span>{user.stats.currentStreak || 12} Day Streak</span>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* AI Coach Trigger */}
          <button
            type="button"
            onClick={onOpenAICoach}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 text-orange-600 dark:text-orange-400 text-xs font-bold hover:scale-105 transition-all shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Coach</span>
          </button>

          {/* Record CTA */}
          <button
            type="button"
            onClick={onOpenRecorder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold shadow-lg shadow-orange-900/30 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Notifikasi ({unreadCount})
                  </h4>
                  <button
                    onClick={() => {
                      NotificationService.markAllAsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-orange-500 font-semibold hover:underline"
                  >
                    Tandai Dibaca
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        !n.isRead
                          ? "bg-orange-50/70 dark:bg-slate-800/80 border-orange-200 dark:border-orange-900/40"
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

          {/* Role Preview Pill / Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700"
              title="Role Simulator"
            >
              <Shield className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulasi Akun Role
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      role === r
                        ? "bg-orange-500 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar & Account Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-500 shadow-md hover:scale-105 transition-transform"
            >
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {user.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {user.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Lihat Profil Lengkap</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Ganti / Masuk Akun Email</span>
                </button>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
