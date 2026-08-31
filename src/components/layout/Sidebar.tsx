import React from "react";
import { 
  Activity, 
  Map, 
  Users, 
  Trophy, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  User, 
  ShieldCheck, 
  Sparkles,
  Compass
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "MODERATOR";

  const navigationItems = [
    { id: "feed", label: "Aktivitas Feed", icon: Activity },
    { id: "routes", label: "Route Planner", icon: Map },
    { id: "clubs", label: "Komunitas Club", icon: Users },
    { id: "challenges", label: "Tantangan & PR", icon: Trophy },
    { id: "events", label: "Event & Race", icon: Calendar },
    { id: "training", label: "Training Plan", icon: BookOpen },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
    { id: "profile", label: "Profil Atlet", icon: User }
  ];

  if (isAdmin) {
    navigationItems.push({ id: "admin", label: "Admin Portal", icon: ShieldCheck });
  }

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 space-y-6 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-orange-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pro Athletic Badge Banner */}
        <div className="mt-auto p-4 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white space-y-2 shadow-xl shadow-orange-950/20">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>SPORTIVA PRO</span>
          </div>
          <p className="text-xs text-orange-100 leading-relaxed font-medium">
            Akses Advanced AI Heart Rate Analytics & Segments KOM Tracking tanpa batas.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
        {[
          { id: "feed", label: "Feed", icon: Activity },
          { id: "routes", label: "Routes", icon: Map },
          { id: "clubs", label: "Clubs", icon: Users },
          { id: "challenges", label: "Badges", icon: Trophy },
          { id: "profile", label: "Profile", icon: User }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-orange-500 font-bold"
                  : "text-slate-500 dark:text-slate-400 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-orange-500 scale-110" : ""}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
