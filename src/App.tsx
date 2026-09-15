import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { MobileShell } from './components/layout/MobileShell';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { HomeScreen } from './screens/home/HomeScreen';
import { MissionsScreen } from './screens/missions/MissionsScreen';
import { CalendarScreen } from './screens/calendar/CalendarScreen';
import { StatisticsScreen } from './screens/statistics/StatisticsScreen';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { CreateMissionModal } from './screens/createMission/CreateMissionModal';
import { MissionDetailModal } from './screens/missionDetail/MissionDetailModal';
import { DailyBriefingModal } from './screens/briefing/DailyBriefingModal';
import { EveningReviewModal } from './screens/briefing/EveningReviewModal';
import { SystemModal } from './components/rpg/SystemModal';
import { AuthScreens } from './screens/auth/AuthScreens';
import { OnboardingScreen } from './screens/onboarding/OnboardingScreen';
import { notificationService } from './notifications/notificationService';

export const App: React.FC = () => {
  const {
    isAuthenticated,
    hasOnboarded,
    activeTab,
    systemModal,
    setSystemModal,
    missions,
    settings,
  } = useAppStore();

  // Periodic reminder checking (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      notificationService.checkMissionReminders(missions, settings);
    }, 30000);
    return () => clearInterval(interval);
  }, [missions, settings]);

  // Auth gate
  if (!isAuthenticated) {
    return (
      <MobileShell>
        <AuthScreens />
      </MobileShell>
    );
  }

  // Onboarding gate
  if (!hasOnboarded) {
    return (
      <MobileShell>
        <OnboardingScreen />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      {/* Top Header */}
      <Header />

      {/* Main View Router */}
      <main style={{ flex: 1, position: 'relative' }}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'missions' && <MissionsScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'statistics' && <StatisticsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Global Modals */}
      <CreateMissionModal />
      <MissionDetailModal />
      <DailyBriefingModal />
      <EveningReviewModal />
      <SystemModal
        notification={systemModal}
        onDismiss={() => setSystemModal(null)}
      />
    </MobileShell>
  );
};
export default App;
