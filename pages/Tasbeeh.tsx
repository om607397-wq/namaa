import React, { useState, useEffect } from 'react';
import { TasbeehLog, DhikrType } from '../types';
import { getTasbeehLog, saveTasbeehLog, getTodayKey, getTotalTasbeeh } from '../services/storage';
import { RotateCcw, Award, Sparkles } from 'lucide-react';

const DHIKR_OPTIONS: DhikrType[] = [
  'سبحان الله',
  'الحمد لله',
  'الله أكبر',
  'لا إله إلا الله',
  'أستغفر الله',
  'لا حول ولا قوة إلا بالله'
];

export const Tasbeeh: React.FC = () => {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrType>('سبحان الله');
  const [dailyTotal, setDailyTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const todayLog = getTasbeehLog(getTodayKey());
    setDailyTotal(todayLog.count);
    setGrandTotal(getTotalTasbeeh());
  };

  const handleTap = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Save to storage (debounced logic simulated by saving directly for simplicity here as simple writes are fast)
    const todayLog = getTasbeehLog(getTodayKey());
    saveTasbeehLog({
      ...todayLog,
      count: todayLog.count + 1,
      favoriteDhikr: selectedDhikr // Simplistic: just overwrites last used
    });
    
    setDailyTotal(prev => prev + 1);
    setGrandTotal(prev => prev + 1);
  };

  const handleReset = () => {
    if (confirm('هل تريد تصفير العداد الحالي؟ لن يتم حذف المجموع الكلي.')) {
      setCount(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
       <div className="text-center">
         <h2 className="text-2xl font-bold text-gray-800 mb-2">مسبحتك الإلكترونية</h2>
         <p className="text-gray-500">ألا بذكر الله تطمئن القلوب</p>
       </div>

       {/* Main Counter */}
       <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-6">
             <select 
               value={selectedDhikr}
               onChange={e => setSelectedDhikr(e.target.value as DhikrType)}
               className="bg-white/20 text-white border-none rounded-full px-4 py-2 outline-none font-bold text-center w-full max-w-xs backdrop-blur-sm cursor-pointer"
             >
               {DHIKR_OPTIONS.map(d => <option key={d} value={d} className="text-gray-800">{d}</option>)}
             </select>

             <div className="text-8xl font-mono font-bold tracking-wider my-4">
               {count}
             </div>

             <button 
               onClick={handleTap}
               className="w-24 h-24 bg-white text-emerald-600 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-gray-50"
             >
               <Sparkles size={40} fill="currentColor" />
             </button>

             <button 
               onClick={handleReset}
               className="absolute top-4 left-4 text-white/70 hover:text-white p-2"
               title="تصفير العداد"
             >
               <RotateCcw size={20} />
             </button>
          </div>
       </div>

       {/* Stats */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
             <p className="text-gray-500 text-sm mb-1">مجموع اليوم</p>
             <h3 className="text-3xl font-bold text-emerald-600">{dailyTotal}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
             <p className="text-gray-500 text-sm mb-1">المجموع الكلي</p>
             <h3 className="text-3xl font-bold text-teal-600 flex items-center justify-center gap-2">
               {grandTotal} <Award size={20} />
             </h3>
          </div>
       </div>
    </div>
  );
};