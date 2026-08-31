import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  User, 
  Bot, 
  Gauge, 
  Upload, 
  Radio, 
  Trophy, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  Moon, 
  Sun, 
  LogOut, 
  Lock, 
  Sparkles,
  Flame,
  ChevronRight,
  Shield,
  Layers,
  Share2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { UserRole } from "../../types";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAICoach: () => void;
  onOpenCalculator: () => void;
  onOpenGpxImport: () => void;
  onOpenAuth: () => void;
  onOpenBeaconModal?: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenAICoach,
  onOpenCalculator,
  onOpenGpxImport,
  onOpenAuth,
  onOpenBeaconModal
}) => {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleSelector, setShowRoleSelector] = React.useState(false);

  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "MODERATOR";
  const roles: UserRole[] = ["USER", "CLUB_ADMIN", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm">
          {/* Backdrop click */}
          <div className="flex-1" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Grab Handle */}
            <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm">
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.fullName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      {role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      🔥 {user.stats.currentStreak || 12}d Streak
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="p-4 overflow-y-auto space-y-4 text-slate-900 dark:text-slate-100">
              {/* Pro Feature Spotlight */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/20 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    SPORTIVA ATHLETIC OS PRO
                  </div>
                  <p className="text-[11px] text-orange-100 mt-0.5">
                    Live GPS Telemetry, Audio Splits & AI Coach
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAICoach();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-orange-600 font-extrabold text-xs shadow hover:scale-105 transition-transform"
                >
                  Buka AI
                </button>
              </div>

              {/* Athletic Tools Grid */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1">
                  Fitur Atlet & Analitik
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCalculator();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5 text-left hover:border-orange-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Kalkulator HR</div>
                      <div className="text-[10px] text-slate-400">Race & VDOT</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGpxImport();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5 text-left hover:border-orange-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Impor GPX</div>
                      <div className="text-[10px] text-slate-400">Garmin & Strava</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAICoach();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5 text-left hover:border-orange-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Gemini AI Coach</div>
                      <div className="text-[10px] text-slate-400">Pakar Latihan</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenBeaconModal) onOpenBeaconModal();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2.5 text-left hover:border-orange-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Live Beacon</div>
                      <div className="text-[10px] text-slate-400">Safety & SOS</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Navigation Items List */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1">
                  Navigasi Modul
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800">
                  {[
                    { id: "profile", label: "Profil & Shoe Closet", icon: User, desc: "Statistik, Odometer Sepatu & Sensor" },
                    { id: "training", label: "Program Latihan (Training Plan)", icon: BookOpen, desc: "Jadwal mingguan 5K, 10K, Marathon" },
                    { id: "challenges", label: "Tantangan & Badges PR", icon: Trophy, desc: "Piala bulanan & personal records" },
                    { id: "leaderboard", label: "Leaderboard & Segmen", icon: BarChart3, desc: "Peringkat atlet kota Jember & Nasional" },
                    { id: "events", label: "Event & Registrasi Race", icon: Calendar, desc: "Daftar lomba lari & cycling" },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors ${
                          isActive
                            ? "bg-orange-500 text-white font-bold"
                            : "hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-orange-500"}`} />
                          <div>
                            <div className="text-xs font-bold">{item.label}</div>
                            <div className={`text-[10px] ${isActive ? "text-orange-100" : "text-slate-400"}`}>{item.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      </button>
                    );
                  })}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleNavigate("admin")}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors ${
                        activeTab === "admin"
                          ? "bg-orange-500 text-white font-bold"
                          : "hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className={`w-4 h-4 ${activeTab === "admin" ? "text-white" : "text-amber-500"}`} />
                        <div>
                          <div className="text-xs font-bold">Admin Portal</div>
                          <div className={`text-[10px] ${activeTab === "admin" ? "text-orange-100" : "text-slate-400"}`}>Kelola event & verifikasi segmen</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${activeTab === "admin" ? "text-white" : "text-slate-400"}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Preferences & Account Utilities */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 px-1">
                  Pengaturan & Sistem
                </div>
                <div className="space-y-1.5">
                  {/* Theme Switcher */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {theme === "dark" ? <Moon className="w-4 h-4 text-orange-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span className="text-xs font-semibold">Tampilan {theme === "dark" ? "Mode Gelap (Dark)" : "Mode Terang (Light)"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      Ganti
                    </button>
                  </div>

                  {/* Role Simulator Switcher */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="text-xs font-semibold">Role Akun Simulator</div>
                          <div className="text-[10px] text-slate-400">Saat ini: {role}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRoleSelector(!showRoleSelector)}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20"
                      >
                        Ubah Role
                      </button>
                    </div>

                    {showRoleSelector && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-1.5">
                        {roles.map(r => (
                          <button
                            key={r}
                            onClick={() => {
                              switchRole(r);
                              setShowRoleSelector(false);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left ${
                              role === r 
                                ? "bg-orange-500 text-white" 
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Auth Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Masuk / Ganti Akun</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        logout();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
