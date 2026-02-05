import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineStatus: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg border border-white/10 animate-in slide-in-from-bottom-4">
      <WifiOff size={14} className="text-red-400" />
      <span>أنت غير متصل بالإنترنت (الوضع المحلي مفعل)</span>
    </div>
  );
};