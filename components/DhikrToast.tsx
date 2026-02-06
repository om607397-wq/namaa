import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Heart } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { getAppSettings } from '../services/storage';

const { useLocation } = ReactRouterDOM;

const DHIKR_LIST = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "سبحان الله وبحمده",
  "أستغفر الله",
  "اللهم صل وسلم على نبينا محمد",
  "لا حول ولا قوة إلا بالله"
];

// 3 minutes
const INTERVAL_MS = 3 * 60 * 1000;

export const DhikrToast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentDhikr, setCurrentDhikr] = useState('');
  const location = useLocation();

  useEffect(() => {
    const settings = getAppSettings();
    if (!settings.dhikrEnabled) return;

    const interval = setInterval(() => {
      // Don't show in Study or Quran (focus modes)
      if (location.pathname === '/study' || location.pathname === '/full-quran') return;

      const randomDhikr = DHIKR_LIST[Math.floor(Math.random() * DHIKR_LIST.length)];
      setCurrentDhikr(randomDhikr);
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 15000);

    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
        
        {/* Card Content */}
        <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-[90vw]">
           
           {/* Icon Box */}
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Sparkles className="text-white animate-pulse" size={20} />
           </div>

           {/* Text */}
           <div className="flex-1 text-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block mb-0.5">تذكير</span>
              <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">{currentDhikr}</p>
           </div>

           {/* Actions */}
           <div className="flex gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 mr-1">
              <button 
                onClick={() => setVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all"
                title="إخفاء"
              >
                <X size={14} />
              </button>
              <button 
                onClick={() => setVisible(false)}
                className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 flex items-center justify-center transition-all"
                title="تم الذكر"
              >
                <Check size={14} strokeWidth={3} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};