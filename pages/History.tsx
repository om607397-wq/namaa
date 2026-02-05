import React, { useState, useEffect } from 'react';
import { calculateDailyScore } from '../services/storage';
import { Calendar, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export const History: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<{ date: number; score: number }[]>([]);

  useEffect(() => {
    generateMonthData();
  }, [currentDate]);

  const generateMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // Sunday - Saturday : 0 - 6
    
    // In Arab world, week starts Saturday or Sunday. Let's assume Saturday for display logic later if needed,
    // but standard Grid usually works with Sunday (0) or Monday (1).
    // Let's create an array representing the grid cells.
    
    const data = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      // Construct date string YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const score = calculateDailyScore(dateStr);
      data.push({ date: i, score });
    }
    setDays(data);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-gray-100 dark:bg-dark-700 text-gray-400';
    if (score < 50) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
    if (score < 80) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600';
    return 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none';
  };

  const monthName = currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       <div className="text-center">
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
           <Calendar className="text-emerald-600" /> سجل الإنجاز
         </h2>
         <p className="text-gray-500 dark:text-gray-400">تاريخك يحكي قصة التزامك.</p>
       </div>

       <div className="bg-white dark:bg-dark-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
             <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors">
               <ChevronRight />
             </button>
             <h3 className="text-xl font-bold text-gray-800 dark:text-white">{monthName}</h3>
             <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors">
               <ChevronLeft />
             </button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-2 text-center text-sm text-gray-400 font-bold">
             {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-3">
             {/* Spacers for start of month (assuming Sunday start for simplicity of standard JS Date) */}
             {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`}></div>
             ))}

             {days.map((day) => (
                <div 
                  key={day.date}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 ${getScoreColor(day.score)}`}
                >
                   <span className="font-bold text-lg">{day.date}</span>
                   {day.score > 0 && (
                     <div className="flex items-center gap-0.5 mt-1">
                        <span className="text-[10px] font-bold">{day.score}</span>
                        {day.score >= 80 && <Star size={8} fill="currentColor" />}
                     </div>
                   )}
                </div>
             ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-500 dark:text-gray-400">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-dark-700"></div> لا بيانات</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-200"></div> متوسط</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-200"></div> جيد</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> ممتاز</div>
          </div>
       </div>
    </div>
  );
};