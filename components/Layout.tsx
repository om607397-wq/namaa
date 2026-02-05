import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Book, Wallet, CalendarCheck, ClipboardList, 
  Smartphone, Loader2, Moon, Sun, HeartPulse, Focus, Sprout, Settings, Star, FileText,
  Leaf, MessageCircle, Trophy, LayoutTemplate, CalendarDays, UserCircle, User
} from 'lucide-react';
import { DhikrToast } from './DhikrToast';
import { AIChat } from './AIChat';
import { PrayerNotifier } from './PrayerNotifier';
import { getAppSettings, saveAppSettings, getEnabledFeatures, getProfile } from '../services/storage';
import { FeatureId } from '../types';

interface NavItem {
  id: FeatureId | 'dashboard' | 'daily' | 'weekly' | 'full-quran' | 'customize' | 'history' | 'profile';
  to: string;
  label: string;
  icon: any;
  special?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', to: '/', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'profile', to: '/profile', label: 'إنجازاتي', icon: UserCircle },
  { id: 'history', to: '/history', label: 'السجل', icon: CalendarDays },
  { id: 'ramadan', to: '/ramadan', label: 'رمضان', icon: Star, special: true },
  { id: 'football', to: '/football', label: 'كرة القدم', icon: Trophy, special: false },
  { id: 'prayers', to: '/prayers', label: 'الصلوات', icon: Moon },
  { id: 'adhkar', to: '/adhkar', label: 'الأذكار', icon: MessageCircle },
  { id: 'study', to: '/study', label: 'المذاكرة', icon: BookOpen },
  { id: 'focus', to: '/focus', label: 'التركيز', icon: Focus },
  { id: 'quran', to: '/quran', label: 'القرآن (ورد)', icon: Book },
  { id: 'quran', to: '/full-quran', label: 'المصحف', icon: FileText },
  { id: 'habits', to: '/habits', label: 'عادات', icon: HeartPulse },
  { id: 'finance', to: '/finance', label: 'المصروف', icon: Wallet },
  { id: 'screentime', to: '/screentime', label: 'موبايلي', icon: Smartphone },
  { id: 'tasbeeh', to: '/tasbeeh', label: 'السبحة', icon: Loader2 },
  { id: 'journaling', to: '/daily', label: 'يوميات', icon: CalendarCheck },
  { id: 'journaling', to: '/weekly', label: 'أسبوعي', icon: ClipboardList },
  { id: 'customize', to: '/onboarding', label: 'تخصيص الواجهة', icon: LayoutTemplate },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureId[] | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Theme
    const settings = getAppSettings();
    setIsDark(settings.darkMode);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Features
    const features = getEnabledFeatures();
    setEnabledFeatures(features);

    // Profile Avatar
    const profile = getProfile();
    setAvatar(profile.avatar);

    const handleStorage = () => {
       setEnabledFeatures(getEnabledFeatures());
       setAvatar(getProfile().avatar);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    const settings = getAppSettings();
    saveAppSettings({ ...settings, darkMode: newMode });
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Filter Nav Items
  const navItems = ALL_NAV_ITEMS.filter(item => {
    if (item.id === 'dashboard') return true;
    if (item.id === 'customize') return true;
    if (item.id === 'profile') return true;
    if (item.id === 'history') {
       if (enabledFeatures && !enabledFeatures.includes('history')) return false; 
       return true; 
    }
    if (!enabledFeatures) return true;
    
    if (item.to === '/full-quran' && enabledFeatures.includes('quran')) return true;
    if ((item.to === '/daily' || item.to === '/weekly') && enabledFeatures.includes('journaling')) return true;

    return enabledFeatures.includes(item.id as FeatureId);
  });

  const getTitle = () => {
    const item = navItems.find(i => i.to === location.pathname);
    if (location.pathname === '/settings') return 'الإعدادات';
    if (location.pathname === '/onboarding') return 'تخصيص الواجهة';
    if (location.pathname.startsWith('/adhkar')) return 'الأذكار';
    return item ? item.label : 'نماء';
  };

  // Check if current page requires full screen (no padding)
  const isFullScreenPage = location.pathname === '/full-quran';

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gray-50 dark:bg-dark-950 text-gray-800 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <DhikrToast />
      <AIChat />
      <PrayerNotifier />
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 h-screen sticky top-0 p-6 shadow-xl z-20 overflow-y-auto custom-scrollbar">
        
        {/* Namaa Branding */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="relative group cursor-pointer">
             <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 rounded-full transition-opacity"></div>
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg relative z-10 text-white">
               <Sprout size={28} strokeWidth={2.5} />
             </div>
          </div>
          <div>
             <h1 className="text-3xl font-black tracking-tight text-emerald-900 dark:text-emerald-100">
               نمـــاء
             </h1>
             <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400 font-bold tracking-[0.2em] uppercase">رحلة النمو</p>
          </div>
        </div>

        <NavLink to="/profile" className="mb-6 flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 transition-colors group">
           <div className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-emerald-400 transition-colors">
              {avatar ? (
                <img src={avatar} alt="Me" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
              )}
           </div>
           <div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block group-hover:text-emerald-500">الملف الشخصي</span>
              <span className="text-sm font-black text-gray-800 dark:text-white">إنجازاتي</span>
           </div>
        </NavLink>

        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  item.special 
                    ? isActive 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30' 
                        : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                    : isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-900 hover:translate-x-1'
                }`
              }
            >
              <item.icon 
                size={20} 
                className={item.special && !location.pathname.includes(item.to) ? 'animate-pulse' : ''} 
                strokeWidth={2} 
              />
              <span className={item.special ? 'font-black tracking-wide' : ''}>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-gray-100 dark:bg-dark-900 text-gray-900 dark:text-white font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-900'
              }`
            }
          >
            <Settings size={20} />
            الإعدادات
          </NavLink>
        </nav>

        <div className="mt-6 flex items-center justify-between px-2">
           <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-900 transition-colors"
            title="تبديل الوضع"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono">Namaa v2.4</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-[100dvh] overflow-hidden relative z-10 ${isFullScreenPage ? 'bg-black' : ''}`}>
        
        {/* Mobile Header - Hidden in Full Screen Mode to maximize space */}
        {!isFullScreenPage && (
          <header className="md:hidden bg-white/90 dark:bg-dark-950/90 backdrop-blur-md p-4 flex-shrink-0 shadow-sm flex items-center justify-between border-b border-gray-100 dark:border-gray-800 z-30">
             <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                  <Sprout size={18} />
                </div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">{getTitle()}</h1>
             </div>
             
             <div className="flex items-center gap-2">
               <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-900 rounded-lg">
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
               </button>
             </div>
          </header>
        )}

        {/* Scrollable Content Area - Conditional Padding */}
        <div className={`flex-1 w-full max-w-6xl mx-auto overflow-y-auto custom-scrollbar ${isFullScreenPage ? 'p-0 pb-0' : 'p-4 md:p-8 pb-32 md:pb-8'}`}>
          {children}
        </div>
        
        {/* Desktop Footer (Only visible on Desktop and NOT full screen) */}
        {!isFullScreenPage && (
          <footer className="hidden md:block py-4 text-center text-gray-400 dark:text-gray-500 text-sm border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-dark-950/50 flex-shrink-0">
             <div className="flex items-center justify-center gap-2 mb-1">
               <Leaf size={14} className="text-emerald-500" />
               <span>نماء .. لتزهر أيامك</span>
             </div>
          </footer>
        )}
      </main>

      {/* Mobile Bottom Navigation - Hidden in Full Screen Mode */}
      {!isFullScreenPage && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-dark-950 border-t border-gray-200 dark:border-gray-800 z-[100] safe-area-bottom shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center overflow-x-auto px-2 py-2 gap-2 snap-x scroll-smooth no-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[70px] shrink-0 snap-center ${
                    item.special
                      ? isActive 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40 -translate-y-1' 
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-800/30'
                      : isActive 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'text-gray-400 dark:text-gray-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={22} strokeWidth={isActive || item.special ? 2.5 : 2} />
                    <span className={`text-[10px] whitespace-nowrap ${item.special ? 'font-black' : 'font-bold'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
             <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[70px] shrink-0 snap-center ${
                    isActive ? 'text-gray-800 dark:text-white bg-gray-100 dark:bg-dark-800' : 'text-gray-400 dark:text-gray-500'
                  }`
                }
              >
                <Settings size={22} strokeWidth={2} />
                <span className="text-[10px] font-bold whitespace-nowrap">الإعدادات</span>
              </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
};