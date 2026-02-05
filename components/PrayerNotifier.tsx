import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

export const PrayerNotifier: React.FC = () => {
  const { showToast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    // Check permission on mount
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // We don't auto-request on mount to avoid being annoying, 
      // but we track status. Requesting is done via Settings or button.
    }

    const interval = setInterval(checkPrayerTimes, 60000); // Check every minute
    checkPrayerTimes(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      showToast('تم تفعيل تنبيهات الصلاة بنجاح ✅', 'success');
      new Notification('نماء', { body: 'تم تفعيل التنبيهات. سنقوم بتذكيرك بأوقات الصلاة.' });
    }
  };

  const checkPrayerTimes = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const date = new Date();
        const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        
        const response = await fetch(`https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = await response.json();
        
        if (data.code === 200) {
          processTimings(data.data.timings);
        }
      } catch (err) {
        console.error("Error fetching prayer times for notification", err);
      }
    });
  };

  const processTimings = (timings: any) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'الفجر', key: 'Fajr' },
      { name: 'الظهر', key: 'Dhuhr' },
      { name: 'العصر', key: 'Asr' },
      { name: 'المغرب', key: 'Maghrib' },
      { name: 'العشاء', key: 'Isha' },
    ];

    prayers.forEach(prayer => {
      const timeStr = timings[prayer.key];
      const [h, m] = timeStr.split(':').map(Number);
      const prayerTime = h * 60 + m;
      
      const diff = prayerTime - currentTime;

      // Notify 15 minutes before
      if (diff === 15) {
        sendNotification(`اقتربت صلاة ${prayer.name}`, `باقي 15 دقيقة على الأذان. استعد للقاء الله.`);
      }
      
      // Notify exactly on time
      if (diff === 0) {
        sendNotification(`حان وقت صلاة ${prayer.name}`, `حي على الصلاة، حي على الفلاح.`);
      }
    });
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: '/vite.svg', // Ensure this path matches your public icon
        dir: 'rtl'
      });
    } else {
      // Fallback to in-app toast if permission not granted
      showToast(`${title}: ${body}`, 'info');
    }
  };

  // Hidden component logic, but exposes a global way to request permission if needed via context or events later.
  // For now, it runs silently. We can render nothing or a debug element.
  return null; 
};

// Export permission requester to be used in Settings
export const requestNotificationPermission = async () => {
  return await Notification.requestPermission();
};