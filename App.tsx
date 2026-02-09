import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Study } from './pages/Study';
import { Quran } from './pages/Quran';
import { FullQuran } from './pages/FullQuran';
import { Finance } from './pages/Finance';
import { DailyReview } from './pages/DailyReview';
import { WeeklyReview } from './pages/WeeklyReview';
import { ScreenTime } from './pages/ScreenTime';
import { Tasbeeh } from './pages/Tasbeeh';
import { Prayers } from './pages/Prayers';
import { Habits } from './pages/Habits';
import { Focus } from './pages/Focus';
import { Settings } from './pages/Settings';
import { Ramadan } from './pages/Ramadan';
import { Football } from './pages/Football';
import { Adhkar } from './pages/Adhkar';
import { ViewAdhkar } from './pages/ViewAdhkar';
import { TodoList } from './pages/TodoList';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { subscribeToAuth, downloadDataFromCloud, uploadDataToCloud } from './services/cloud';
import { getTodayKey, hasConfiguredFeatures } from './services/storage';
import { SplashScreen } from './components/SplashScreen';
import { TimerProvider } from './context/TimerContext';
import { ToastProvider } from './context/ToastContext';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

const AppContent: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ramadan" element={<Ramadan />} />
        <Route path="/football" element={<Football />} />
        <Route path="/prayers" element={<Prayers />} />
        <Route path="/adhkar" element={<Adhkar />} />
        <Route path="/adhkar/:type" element={<ViewAdhkar />} />
        <Route path="/todo" element={<TodoList />} />
        <Route path="/study" element={<Study />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/quran" element={<Quran />} />
        <Route path="/full-quran" element={<FullQuran />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/screentime" element={<ScreenTime />} />
        <Route path="/tasbeeh" element={<Tasbeeh />} />
        <Route path="/daily" element={<DailyReview />} />
        <Route path="/weekly" element={<WeeklyReview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Component to watch for date changes (midnight) and trigger refresh
const DayWatcher: React.FC = () => {
  useEffect(() => {
    let lastDate = getTodayKey();
    
    const interval = setInterval(() => {
      const currentDate = getTodayKey();
      if (currentDate !== lastDate) {
        console.log("Day changed! Refreshing to reset views...");
        lastDate = currentDate;
        // Reloading page ensures all components fetch new data for the new "Today" key
        window.location.reload(); 
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
  return null;
};

// Auto-Save Component
const AutoSaveHandler: React.FC<{ user: any }> = ({ user }) => {
  useEffect(() => {
    if (!user) return;
    
    // Save data every 60 seconds automatically if logged in
    const interval = setInterval(() => {
       uploadDataToCloud().catch(err => console.error("Auto-save failed silently", err));
    }, 60000);

    // Also save on visibility change (user leaves tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        uploadDataToCloud().catch(err => console.error("Exit-save failed silently", err));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  return null;
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // 1. Check Firebase Auth State
    const unsubscribe = subscribeToAuth(async (u) => {
      setUser(u);
      
      if (u) {
        // 2. If User exists, Try to download data immediately
        try {
          console.log("User found, syncing data...");
          await downloadDataFromCloud();
          console.log("Data sync complete.");
        } catch (error) {
          console.error("Failed to sync on startup:", error);
        }
        
        // 3. Check if user needs onboarding (no features configured locally after sync)
        if (!hasConfiguredFeatures()) {
           setNeedsOnboarding(true);
        } else {
           setNeedsOnboarding(false);
        }
      }
      
      setAuthLoading(false);
      setDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // While showing splash, we are also waiting for auth & data in background
  if (showSplash) {
    // Pass callback to remove splash when animation is done
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // If splash is done but we are still checking auth/data (rare, but possible on slow connection)
  if (authLoading || !dataLoaded) {
    return <SplashScreen onFinish={() => {}} />; // Keep showing splash
  }

  // Auth Guard: If no user, show Login
  if (!user) {
    return <Login />;
  }

  // New User Guard: Show Onboarding if no configuration found
  if (needsOnboarding) {
    return (
      <HashRouter>
        <Onboarding onComplete={() => setNeedsOnboarding(false)} />
      </HashRouter>
    );
  }

  // If user is authenticated and onboarded, show the App
  return (
    <ToastProvider>
      <TimerProvider>
        <HashRouter>
          <DayWatcher />
          <AutoSaveHandler user={user} />
          <AppContent />
        </HashRouter>
      </TimerProvider>
    </ToastProvider>
  );
};

export default App;