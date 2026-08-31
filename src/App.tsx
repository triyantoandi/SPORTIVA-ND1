import React, { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { MobileHeader } from "./components/layout/MobileHeader";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { MobileMenuDrawer } from "./components/layout/MobileMenuDrawer";
import { FeedPage } from "./pages/FeedPage";
import { RoutesPage } from "./pages/RoutesPage";
import { ClubsPage } from "./pages/ClubsPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { EventsPage } from "./pages/EventsPage";
import { TrainingPlanPage } from "./pages/TrainingPlanPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { ActivityRecorderModal } from "./components/recorder/ActivityRecorderModal";
import { AICoachModal } from "./components/coach/AICoachModal";
import { ShareCardModal } from "./components/feed/ShareCardModal";
import { RouteFlyover3DModal } from "./components/flyover/RouteFlyover3DModal";
import { SportScienceCalculatorModal } from "./components/calculator/SportScienceCalculatorModal";
import { GpxImportModal } from "./components/gpx/GpxImportModal";
import { LiveBeaconModal } from "./components/beacon/LiveBeaconModal";
import { AuthModal } from "./pages/AuthModal";
import { Activity } from "./types";
import { Smartphone, Monitor, Wifi, Battery, Signal } from "lucide-react";

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isGpxImportOpen, setIsGpxImportOpen] = useState(false);
  const [isBeaconOpen, setIsBeaconOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [shareActivity, setShareActivity] = useState<Activity | null>(null);
  const [flyoverActivity, setFlyoverActivity] = useState<Activity | null>(null);
  const [newPRNotifications, setNewPRNotifications] = useState<any[]>([]);
  const [deviceFrameMode, setDeviceFrameMode] = useState<"phone" | "fluid">("phone");

  const handleActivitySaved = (newActivity: Activity, prBreakEvents: any[]) => {
    if (prBreakEvents && prBreakEvents.length > 0) {
      setNewPRNotifications(prBreakEvents);
    }
    // Switch to feed
    setActiveTab("feed");
  };

  // Get current mobile clock time (e.g. 09:41)
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:p-2 md:p-4 overflow-x-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Desktop Frame Switcher Toolbar (Hidden on actual mobile screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>SPORTIVA MOBILE APP VIEW</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setDeviceFrameMode("phone")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors ${
              deviceFrameMode === "phone"
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Frame</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceFrameMode("fluid")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors ${
              deviceFrameMode === "fluid"
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Width</span>
          </button>
        </div>
      </div>

      {/* Main Mobile App View Container */}
      <div
        className={`w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-all duration-300 relative shadow-2xl ${
          deviceFrameMode === "phone"
            ? "max-w-md rounded-none sm:rounded-[40px] border-0 sm:border-[8px] sm:border-slate-800/90 sm:ring-1 sm:ring-slate-700/50 min-h-[92vh] sm:h-[94vh] overflow-hidden"
            : "max-w-xl rounded-none min-h-screen"
        }`}
      >
        {/* Smartphone Top Notch & Status Bar (Visible in phone frame) */}
        <div className="w-full bg-white/95 dark:bg-slate-900/95 px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <span>{currentTimeStr}</span>
          
          {/* Dynamic Island / Speaker Notch Pill */}
          <div className="w-20 h-4 rounded-full bg-slate-950 flex items-center justify-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80"></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Signal className="w-3.5 h-3.5 text-orange-500" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Mobile Header Bar */}
        <MobileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAICoach={() => setIsAICoachOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenGpxImport={() => setIsGpxImportOpen(true)}
          onOpenBeaconModal={() => setIsBeaconOpen(true)}
          onOpenMenuDrawer={() => setIsMenuDrawerOpen(true)}
        />

        {/* Scrollable Mobile Page Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 min-w-0 space-y-4">
          {activeTab === "feed" && (
            <FeedPage
              onOpenRecorder={() => setIsRecorderOpen(true)}
              onOpenAICoach={() => setIsAICoachOpen(true)}
              onShareClick={(act) => setShareActivity(act)}
              onFlyoverClick={(act) => setFlyoverActivity(act)}
              newPRNotification={newPRNotifications}
            />
          )}

          {activeTab === "routes" && <RoutesPage />}
          {activeTab === "clubs" && <ClubsPage />}
          {activeTab === "challenges" && <ChallengesPage />}
          {activeTab === "events" && <EventsPage />}
          {activeTab === "training" && <TrainingPlanPage onOpenRecorder={() => setIsRecorderOpen(true)} />}
          {activeTab === "leaderboard" && <LeaderboardPage />}
          {activeTab === "profile" && <ProfilePage onOpenAuth={() => setIsAuthOpen(true)} />}
          {activeTab === "admin" && <AdminPage />}
        </main>

        {/* Sticky Mobile Bottom Navigation Dock */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRecorder={() => setIsRecorderOpen(true)}
          onOpenMenuDrawer={() => setIsMenuDrawerOpen(true)}
        />
      </div>

      {/* Mobile Slide-Up Menu Drawer (Hub for all features) */}
      <MobileMenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenGpxImport={() => setIsGpxImportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBeaconModal={() => setIsBeaconOpen(true)}
      />

      {/* GPS Activity Recorder Full-Screen Modal */}
      <ActivityRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onActivitySaved={handleActivitySaved}
      />

      {/* SPORTIVA AI Coach Modal */}
      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
      />

      {/* Sport Science Calculator Modal */}
      <SportScienceCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* GPX/TCX Import Modal */}
      <GpxImportModal
        isOpen={isGpxImportOpen}
        onClose={() => setIsGpxImportOpen(false)}
        onActivityImported={(activity) => {
          handleActivitySaved(activity, []);
        }}
      />

      {/* Live Beacon Safety SOS Modal */}
      <LiveBeaconModal
        isOpen={isBeaconOpen}
        onClose={() => setIsBeaconOpen(false)}
        isRecording={false}
      />

      {/* Social Share Card Generator Modal */}
      <ShareCardModal
        activity={shareActivity}
        onClose={() => setShareActivity(null)}
      />

      {/* 3D Route Flyover Video Generator Modal */}
      <RouteFlyover3DModal
        activity={flyoverActivity}
        onClose={() => setFlyoverActivity(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
