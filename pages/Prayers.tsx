import React, { useState, useEffect } from 'react';
import { getPrayerLog, savePrayerLog, getTodayKey } from '../services/storage';
import { PrayerStatus, PrayerName, PrayerLog } from '../types';
import { Moon, Sun, Sunrise, Sunset, CloudMoon, Flower2, MessageCircle } from 'lucide-react';
import { PrayerTimesWidget } from '../components/PrayerTimesWidget';

const PRAYERS: { key: PrayerName; label: string; icon: any; sunnahLabel: string }[] = [
  { key: 'Fajr', label: 'الفجر', icon: Sunrise, sunnahLabel: 'رغيبة الفجر' },
  { key: 'Dhuhr', label: 'الظهر', icon: Sun, sunnahLabel: 'الرواتب القبلية والبعدية' },
  { key: 'Asr', label: 'العصر', icon: Sun, sunnahLabel: '4 ركعات قبل الفرض' },
  { key: 'Maghrib', label: 'المغرب', icon: Sunset, sunnahLabel: '2 ركعة بعد الفرض' },
  { key: 'Isha', label: 'العشاء', icon: CloudMoon, sunnahLabel: '2 ركعة بعد الفرض' },
];

const STATUSES: { key: PrayerStatus; label: string; color: string; bg: string }[] = [
  { key: 'mosque', label: 'في المسجد/وقتها', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  { key: 'ontime', label: 'حاضر', color: 'text-blue-700', bg: 'bg-blue-100' },
  { key: 'late', label: 'متأخر', color: 'text-orange-700', bg: 'bg-orange-100' },
  { key: 'missed', label: 'فاتتني', color: 'text-red-700', bg: 'bg-red-100' },
];

export const Prayers: React.FC = () => {
  const [log, setLog] = useState<PrayerLog>({
    date: getTodayKey(),
    fajr: 'none', dhuhr: 'none', asr: 'none', maghrib: 'none', isha: 'none',
    fajrSunnah: false, dhuhrSunnah: false, asrSunnah: false, maghribSunnah: false, ishaSunnah: false,
    fajrAdhkar: false, dhuhrAdhkar: false, asrAdhkar: false, maghribAdhkar: false, ishaAdhkar: false,
  });

  useEffect(() => {
    setLog(getPrayerLog(getTodayKey()));
  }, []);

  const handleStatusChange = (prayer: string, status: PrayerStatus) => {
    const newLog = { ...log, [prayer.toLowerCase()]: status };
    setLog(newLog);
    savePrayerLog(newLog);
  };

  const toggleBoolean = (field: keyof PrayerLog) => {
    const newLog = { ...log, [field]: !log[field] };
    setLog(newLog);
    savePrayerLog(newLog);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">جدول الصلوات والعبادات</h2>
        <p className="text-gray-500 dark:text-gray-400">إن الصلاة كانت على المؤمنين كتاباً موقوتاً</p>
      </div>

      {/* Widget added here */}
      <PrayerTimesWidget />

      <div className="space-y-4">
        {PRAYERS.map((p) => {
          const prayerKey = p.key.toLowerCase() as keyof PrayerLog;
          const sunnahKey = `${prayerKey}Sunnah` as keyof PrayerLog;
          const adhkarKey = `${prayerKey}Adhkar` as keyof PrayerLog;
          
          const currentStatus = log[prayerKey] as PrayerStatus;
          
          return (
            <div key={p.key} className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 min-w-[140px]">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
                    <p.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-gray-800 dark:text-white block">{p.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{p.key === 'Asr' ? 'سنة قبلية' : 'رواتب'}</span>
                  </div>
                </div>
                
                {/* Status Selection */}
                <div className="flex flex-wrap gap-2 flex-1 justify-center">
                  {STATUSES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleStatusChange(p.key, s.key)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        currentStatus === s.key 
                          ? `${s.bg} ${s.color} border-transparent shadow-sm scale-105` 
                          : 'bg-transparent border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Extras: Sunnah & Adhkar */}
                <div className="flex items-center gap-2 border-r border-gray-100 dark:border-gray-700 pr-4 mr-2">
                   {/* Sunnah Toggle */}
                   <button 
                     onClick={() => toggleBoolean(sunnahKey)}
                     className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
                       log[sunnahKey] 
                         ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                         : 'bg-gray-50 dark:bg-dark-900 text-gray-400'
                     }`}
                     title={p.sunnahLabel}
                   >
                     <Flower2 size={18} />
                     <span className="text-[9px] font-bold">السنة</span>
                   </button>

                   {/* Adhkar Toggle */}
                   <button 
                     onClick={() => toggleBoolean(adhkarKey)}
                     className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-all ${
                       log[adhkarKey] 
                         ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                         : 'bg-gray-50 dark:bg-dark-900 text-gray-400'
                     }`}
                     title="أذكار بعد الصلاة"
                   >
                     <MessageCircle size={18} />
                     <span className="text-[9px] font-bold">الأذكار</span>
                   </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};