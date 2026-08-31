import React, { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
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
import { AuthModal } from "./pages/AuthModal";
import { Activity } from "./types";

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isGpxImportOpen, setIsGpxImportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [shareActivity, setShareActivity] = useState<Activity | null>(null);
  const [flyoverActivity, setFlyoverActivity] = useState<Activity | null>(null);
  const [newPRNotifications, setNewPRNotifications] = useState<any[]>([]);

  const handleActivitySaved = (newActivity: Activity, prBreakEvents: any[]) => {
    if (prBreakEvents && prBreakEvents.length > 0) {
      setNewPRNotifications(prBreakEvents);
    }
    // Switch to feed
    setActiveTab("feed");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenRecorder={() => setIsRecorderOpen(true)}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenGpxImport={() => setIsGpxImportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
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
      </div>

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
