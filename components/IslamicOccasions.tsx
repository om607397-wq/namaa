import React, { useState, useEffect } from 'react';
import { Moon, MapPin, Loader2, RefreshCw } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type CountdownStatus = 'locating' | 'calculating' | 'ready' | 'error';
type Phase = 'before' | 'during';

export const IslamicOccasions: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState<CountdownStatus>('locating');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [phase, setPhase] = useState<Phase>('before');

  useEffect(() => {
    initCountdown();
  }, []);

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        initCountdown(); // Recalculate if time passed
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const initCountdown = () => {
    setStatus('locating');
    
    if (!navigator.geolocation) {
      fallbackCalculation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus('calculating');
        try {
          const { latitude, longitude } = position.coords;
          await fetchRamadanDates(latitude, longitude);
        } catch (error) {
          console.error(error);
          fallbackCalculation();
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        fallbackCalculation();
      }
    );
  };

  const fetchRamadanDates = async (lat: number, lng: number) => {
    try {
      const year = new Date().getFullYear();
      const response = await fetch(
        `https://api.aladhan.com/v1/calendar/${year}?latitude=${lat}&longitude=${lng}&method=2`
      );
      
      if (!response.ok) throw new Error("Failed to fetch calendar");
      
      const data = await response.json();
      const monthsData = data.data; 
      const allDays = Object.values(monthsData).flat() as any[];

      // Find Start of Ramadan (Month 9, Day 1)
      const ramadanStartDay = allDays.find((d: any) => 
        d.date.hijri.month.number === 9 && d.date.hijri.day === "01"
      );
      
      // Find End of Ramadan (Shawwal 1)
      const shawwalStartDay = allDays.find((d: any) => 
        d.date.hijri.month.number === 10 && d.date.hijri.day === "01"
      );

      if (!ramadanStartDay) {
         fallbackCalculation();
         return;
      }

      const parseApiDate = (dateStr: string) => {
        const [d, m, y] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d); 
      };

      const startDate = parseApiDate(ramadanStartDay.date.gregorian.date);
      const endDate = shawwalStartDay ? parseApiDate(shawwalStartDay.date.gregorian.date) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      setLocationName(ramadanStartDay.meta.timezone?.split('/')[1] || "موقعك");
      determinePhaseAndTarget(startDate, endDate);
      setStatus('ready');

    } catch (e) {
      fallbackCalculation();
    }
  };

  const fallbackCalculation = () => {
    // Fallback: Astronomical calculation for 2025
    const startDate = new Date('2025-02-28T00:00:00');
    const endDate = new Date('2025-03-30T00:00:00');
    setLocationName("توقيت عالمي");
    determinePhaseAndTarget(startDate, endDate);
    setStatus('ready'); 
  };

  const determinePhaseAndTarget = (start: Date, end: Date) => {
    const now = new Date();
    if (now < start) {
      setPhase('before');
      setTargetDate(start);
    } else {
      setPhase('during');
      setTargetDate(end);
    }
  };

  if (status === 'locating' || status === 'calculating') {
    return (
      <div className="w-full h-32 rounded-3xl bg-[#322342] flex items-center justify-center text-white gap-3 animate-pulse mb-8 border border-white/10">
        <Loader2 className="animate-spin text-emerald-400" size={24} />
        <p className="text-sm font-bold opacity-80">
          جاري ضبط العداد حسب موقعك...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
       {/* Header with Title and Location */}
       <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
             <div className="bg-[#322342] p-2 rounded-xl text-amber-400 shadow-sm border border-white/5">
                <Moon size={20} fill="currentColor" />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white font-kufi">
                   {phase === 'before' ? 'العد التنازلي لرمضان' : 'متبقي على نهاية الشهر'}
                </h2>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                   <MapPin size={10} />
                   <span>حسب توقيت {locationName}</span>
                </div>
             </div>
          </div>
          <button onClick={initCountdown} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
             <RefreshCw size={16} />
          </button>
       </div>

       {/* The Boxes Container - Exactly like screenshot */}
       <div className="grid grid-cols-4 gap-2 md:gap-4" dir="ltr">
          {/* Days */}
          <TimeBox value={timeLeft.days} label="يوم" isSeconds={false} hasMoon={true} />
          
          {/* Hours */}
          <TimeBox value={timeLeft.hours} label="ساعة" isSeconds={false} hasMoon={true} moonPos="left" />
          
          {/* Minutes */}
          <TimeBox value={timeLeft.minutes} label="دقيقة" isSeconds={false} />
          
          {/* Seconds - Green Color */}
          <TimeBox value={timeLeft.seconds} label="ثوانٍ" isSeconds={true} />
       </div>
    </div>
  );
};

const TimeBox: React.FC<{ 
  value: number; 
  label: string; 
  isSeconds: boolean; 
  hasMoon?: boolean;
  moonPos?: 'left' | 'right'; 
}> = ({ value, label, isSeconds, hasMoon, moonPos = 'right' }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative bg-[#322342] aspect-[4/5] rounded-2xl flex items-center justify-center shadow-lg border border-white/5 overflow-hidden group">
         {/* Value */}
         <span className={`text-4xl md:text-6xl font-bold font-sans z-10 ${isSeconds ? 'text-[#6ee7b7]' : 'text-white'}`}>
            {value}
         </span>
         
         {/* Decorative Moon from Screenshot */}
         {hasMoon && (
            <div className={`absolute bottom-2 ${moonPos === 'right' ? 'right-2' : 'left-2'}`}>
               <Moon size={16} className="text-amber-400 fill-amber-400 opacity-80" />
            </div>
         )}
         
         {/* Top Star Decoration */}
         {isSeconds && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
         )}
      </div>
      
      {/* Label Pill */}
      <div className="bg-[#322342] py-2 rounded-lg text-center shadow-md border border-white/5">
         <span className={`text-xs md:text-sm font-bold ${isSeconds ? 'text-[#6ee7b7]' : 'text-white'}`}>
            {label}
         </span>
      </div>
    </div>
  );
};
