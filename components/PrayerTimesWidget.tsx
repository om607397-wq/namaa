import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, Sunrise, Sun, Sunset, CloudMoon, Moon, Navigation } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const PRAYER_ICONS: Record<string, any> = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon, // Using Moon for Isha instead of CloudMoon for cleaner look
};

export const PrayerTimesWidget: React.FC = () => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [location, setLocation] = useState<string>('جاري تحديد الموقع...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocation('تعذر تحديد الموقع');
          setLoading(false);
          setError(true);
        }
      );
    } else {
      setLocation('المتصفح لا يدعم الموقع');
      setLoading(false);
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (times) {
      const interval = setInterval(() => calculateNextPrayer(times), 1000);
      return () => clearInterval(interval);
    }
  }, [times]);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const date = new Date();
      const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      
      const response = await fetch(`https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lng}&method=2`);
      const data = await response.json();
      
      if (data.code === 200) {
        setTimes(data.data.timings);
        setLocation(data.data.meta.timezone.split('/')[1].replace('_', ' '));
        calculateNextPrayer(data.data.timings);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setLoading(false);
    }
  };

  const calculateNextPrayer = (timings: PrayerTimes) => {
    const now = new Date();
    const timeNow = now.getHours() * 60 + now.getMinutes();
    
    // Sort prayers by time
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    let foundNext = false;

    for (const prayer of prayerOrder) {
      const timeStr = timings[prayer as keyof PrayerTimes];
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;

      if (prayerTimeMinutes > timeNow) {
        setNextPrayer(prayer);
        
        // Calculate diff
        const diffMinutes = prayerTimeMinutes - timeNow;
        const diffH = Math.floor(diffMinutes / 60);
        const diffM = diffMinutes % 60;
        setTimeToNext(`${diffH > 0 ? `${diffH} ساعة و ` : ''}${diffM} دقيقة`);
        
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      setNextPrayer('Fajr');
      setTimeToNext('غداً'); // Simplified for "tomorrow" logic
    }
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  };

  if (loading) return (
    <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center h-32 animate-pulse">
       <div className="flex items-center gap-2 text-emerald-600">
         <Loader2 className="animate-spin" /> جاري جلب مواقيت الصلاة...
       </div>
    </div>
  );

  if (error || !times) return (
    <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900 flex items-center gap-4">
       <Navigation className="text-red-500" />
       <div>
         <h3 className="font-bold text-red-700 dark:text-red-400">تفعيل الموقع مطلوب</h3>
         <p className="text-xs text-red-600 dark:text-red-500">يرجى السماح بالوصول للموقع لعرض مواقيت الصلاة الدقيقة.</p>
       </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-[2rem] p-1 shadow-lg overflow-hidden relative mb-8">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl"></div>

      <div className="bg-black/20 backdrop-blur-md rounded-[1.8rem] p-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-6">
           <div className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-300" />
              <span className="text-sm font-bold opacity-90">{location}</span>
           </div>
           <div className="text-left">
              <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold mb-0.5">الصلاة القادمة</p>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-black">{PRAYER_NAMES[nextPrayer || '']}</span>
                 <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">بعد {timeToNext}</span>
              </div>
           </div>
        </div>

        {/* Times Grid */}
        <div className="grid grid-cols-5 gap-2">
           {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
             const isNext = nextPrayer === prayer;
             const Icon = PRAYER_ICONS[prayer];
             
             return (
               <div 
                 key={prayer} 
                 className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${
                    isNext 
                      ? 'bg-white text-emerald-900 shadow-lg scale-105 z-10' 
                      : 'bg-white/5 text-emerald-100 hover:bg-white/10'
                 }`}
               >
                 <Icon size={isNext ? 20 : 16} className={`mb-1 ${isNext ? 'text-emerald-600' : 'opacity-70'}`} />
                 <span className={`text-[10px] font-bold mb-0.5 ${isNext ? '' : 'opacity-70'}`}>
                    {PRAYER_NAMES[prayer]}
                 </span>
                 <span className={`font-mono font-bold ${isNext ? 'text-sm' : 'text-xs'}`}>
                    {formatTime(times[prayer as keyof PrayerTimes])}
                 </span>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
