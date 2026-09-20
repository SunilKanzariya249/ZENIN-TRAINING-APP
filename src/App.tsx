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
import { PhoneAuthModal } from './components/auth/PhoneAuthModal';
import { AlarmRingingModal } from './components/alarm/AlarmRingingModal';
import { notificationService } from './notifications/notificationService';
import { authService } from './services/authService';
import { syncEngine } from './services/syncEngine';
import { soundService } from './services/soundService';
import { hapticService } from './services/hapticService';
import { Mission } from './types';

export const App: React.FC = () => {
  const {
    isAuthenticated,
    hasOnboarded,
    activeTab,
    systemModal,
    setSystemModal,
    authModalOpen,
    authModalMode,
    setAuthModal,
    missions,
    settings,
    loginUser,
    user,
  } = useAppStore();

  // Supabase Auth listener for automatic session restoration
  useEffect(() => {
    const unsub = authService.onAuthStateChange((cloudUser) => {
      if (cloudUser && (!isAuthenticated || user.isGuest)) {
        loginUser(cloudUser);
      }
    });

    // Initial background flush for queued offline changes
    syncEngine.flushQueue();

    return unsub;
  }, [isAuthenticated, user.isGuest, loginUser]);

  // Periodic reminder and deadline checking (every 10 seconds)
  useEffect(() => {
    const handleDeadline = (mission: Mission) => {
      try {
        soundService.playMissionClear();
        hapticService.heavy();
      } catch {}

      setSystemModal({
        id: `deadline_${mission.id}_${Date.now()}`,
        type: 'system_alert',
        title: 'DEADLINE REACHED',
        subtitle: 'IMMEDIATE ACTION REQUIRED',
        message: `Mission "${mission.title}" deadline has arrived! Complete this mission now to claim +${mission.xpReward} XP.`,
        xp: mission.xpReward,
        missionId: mission.id,
        isDeadlineAlert: true,
        timestamp: new Date().toISOString(),
      });
    };

    // Run immediate evaluation
    notificationService.checkMissionReminders(missions, settings, handleDeadline);

    const interval = setInterval(() => {
      notificationService.checkMissionReminders(missions, settings, handleDeadline);
    }, 10000);

    return () => clearInterval(interval);
  }, [missions, settings, setSystemModal]);

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
      <PhoneAuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModal(false)}
        onSuccess={() => setAuthModal(false)}
      />
      <SystemModal
        notification={systemModal}
        onDismiss={() => setSystemModal(null)}
      />
      <AlarmRingingModal />
    </MobileShell>
  );
};
export default App;
