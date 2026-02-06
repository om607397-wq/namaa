import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, Sunrise, Sun, Sunset, CloudMoon, Moon, Navigation, Edit3, Check } from 'lucide-react';
import { getLocationConfig, saveLocationConfig } from '../services/storage';
import { LocationConfig } from '../types';

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
  Isha: Moon, 
};

// List of Major Egyptian Cities
const CITIES = [
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الجيزة', lat: 30.0131, lng: 31.2089 },
  { name: 'المنصورة', lat: 31.0409, lng: 31.3785 },
  { name: 'طنطا', lat: 30.7865, lng: 31.0004 },
  { name: 'الزقازيق', lat: 30.5765, lng: 31.5041 },
  { name: 'بورسعيد', lat: 31.2653, lng: 32.3026 },
  { name: 'السويس', lat: 29.9668, lng: 32.5498 },
  { name: 'الفيوم', lat: 29.3084, lng: 30.8428 },
  { name: 'بني سويف', lat: 29.0661, lng: 31.0994 },
  { name: 'المنيا', lat: 28.1010, lng: 30.7559 },
  { name: 'أسيوط', lat: 27.1783, lng: 31.1859 },
  { name: 'سوهاج', lat: 26.5590, lng: 31.6957 },
  { name: 'قنا', lat: 26.1551, lng: 32.7160 },
  { name: 'الأقصر', lat: 25.6872, lng: 32.6396 },
  { name: 'أسوان', lat: 24.0889, lng: 32.8998 },
  { name: 'الغردقة', lat: 27.2579, lng: 33.8116 },
  { name: 'شرم الشيخ', lat: 27.9158, lng: 34.3299 },
  { name: 'مطروح', lat: 31.3543, lng: 27.2373 },
  { name: 'دمياط', lat: 31.4175, lng: 31.8144 },
];

export const PrayerTimesWidget: React.FC = () => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('جاري تحديد الموقع...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Location Selection State
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  useEffect(() => {
    initLocation();
  }, []);

  useEffect(() => {
    if (times) {
      const interval = setInterval(() => calculateNextPrayer(times), 1000);
      return () => clearInterval(interval);
    }
  }, [times]);

  const initLocation = () => {
    // 1. Try to get saved location preference first
    const savedLocation = getLocationConfig();
    
    if (savedLocation && savedLocation.isManual) {
      fetchPrayerTimes(savedLocation.lat, savedLocation.lng, savedLocation.name);
    } else {
      // 2. Fallback to Geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchPrayerTimes(position.coords.latitude, position.coords.longitude, null);
          },
          () => {
            // Geolocation failed -> Default to Cairo or Show Error
            // Better to default to Cairo for Egypt audience if blocked
            const cairo = CITIES.find(c => c.name === 'القاهرة')!;
            fetchPrayerTimes(cairo.lat, cairo.lng, 'القاهرة (تلقائي)');
          }
        );
      } else {
        setError(true);
        setLoading(false);
      }
    }
  };

  const handleCitySelect = (city: typeof CITIES[0]) => {
    const config: LocationConfig = {
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      isManual: true
    };
    saveLocationConfig(config);
    fetchPrayerTimes(city.lat, city.lng, city.name);
    setIsSelectingLocation(false);
  };

  const handleUseGPS = () => {
    setLoading(true);
    setIsSelectingLocation(false);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear manual preference
          const config: LocationConfig = {
             name: 'موقعي (GPS)',
             lat: position.coords.latitude,
             lng: position.coords.longitude,
             isManual: false
          };
          saveLocationConfig(config);
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude, null);
        },
        () => {
          alert('تعذر الوصول للموقع. تأكد من تفعيل GPS في المتصفح.');
          setLoading(false);
        }
      );
    }
  };

  const fetchPrayerTimes = async (lat: number, lng: number, manualName: string | null) => {
    setLoading(true);
    setError(false);
    try {
      const date = new Date();
      const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      
      const response = await fetch(`https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lng}&method=5`);
      const data = await response.json();
      
      if (data.code === 200) {
        setTimes(data.data.timings);
        
        if (manualName) {
          setLocationName(manualName);
        } else {
          // Try to clean up the API timezone name
          const apiTimezone = data.data.meta.timezone.split('/')[1]?.replace('_', ' ') || 'موقعك الحالي';
          setLocationName(apiTimezone);
        }
        
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
    
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let foundNext = false;

    for (const prayer of prayerOrder) {
      const timeStr = timings[prayer as keyof PrayerTimes];
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;

      if (prayerTimeMinutes > timeNow) {
        setNextPrayer(prayer);
        const diffMinutes = prayerTimeMinutes - timeNow;
        const diffH = Math.floor(diffMinutes / 60);
        const diffM = diffMinutes % 60;
        setTimeToNext(`${diffH > 0 ? `${diffH} س و ` : ''}${diffM} د`);
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      setNextPrayer('Fajr');
      setTimeToNext('غداً');
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

  if (isSelectingLocation) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white">اختر مدينتك</h3>
            <button onClick={() => setIsSelectingLocation(false)} className="text-gray-400 hover:text-gray-600">إغلاق</button>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <button 
              onClick={handleUseGPS} 
              className="col-span-2 md:col-span-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
               <Navigation size={16} /> استخدام موقعي الحالي (GPS)
            </button>
            {CITIES.map(city => (
              <button 
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className="p-2 rounded-lg bg-gray-50 dark:bg-dark-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 text-sm font-medium transition-colors border border-transparent hover:border-emerald-200"
              >
                {city.name}
              </button>
            ))}
         </div>
      </div>
    );
  }

  if (loading) return (
    <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center h-32 animate-pulse mb-8">
       <div className="flex items-center gap-2 text-emerald-600">
         <Loader2 className="animate-spin" /> جاري جلب المواقيت...
       </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-[2rem] p-1 shadow-lg overflow-hidden relative mb-8 group">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl"></div>

      <div className="bg-black/20 backdrop-blur-md rounded-[1.8rem] p-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-6">
           <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors" onClick={() => setIsSelectingLocation(true)}>
              <MapPin size={16} className="text-emerald-300" />
              <span className="text-sm font-bold opacity-90">{locationName}</span>
              <Edit3 size={14} className="text-emerald-300/50" />
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
                    {formatTime(times ? times[prayer as keyof PrayerTimes] : '00:00')}
                 </span>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};