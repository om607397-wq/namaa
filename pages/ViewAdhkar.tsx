import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, BookOpen, Check } from 'lucide-react';
import { DhikrItem } from '../data/adhkarData'; 
import { getAdhkarByCategory } from '../services/storage';

const TITLES: Record<string, string> = {
  'morning': 'أذكار الصباح',
  'evening': 'أذكار المساء',
  'post_prayer': 'أذكار بعد الصلاة',
  'sleep': 'أذكار النوم',
  'waking': 'أذكار الاستيقاظ',
  'home_enter': 'أذكار دخول المنزل',
  'home_exit': 'أذكار الخروج من المنزل',
  'bathroom_enter': 'أذكار دخول الخلاء',
  'bathroom_exit': 'أذكار الخروج من الخلاء',
  'food': 'أذكار الطعام',
  'clothes': 'أذكار اللباس',
  'travel': 'أذكار الركوب والسفر',
  'rain': 'أذكار المطر',
  'wind': 'أذكار الرياح',
  'fear': 'أذكار الخوف',
  'relief': 'أذكار تفريج الهم',
  'provision': 'أذكار الرزق',
  'istighfar': 'أذكار الاستغفار',
  'tasbeeh': 'أذكار التسبيح والتهليل',
  'salawat': 'أذكار الصلاة على النبي ﷺ',
  'general': 'أذكار الذكر المطلق',
  'illness': 'أذكار المرض',
  'anger': 'أذكار الغضب',
  'istikhara': 'أذكار الاستخارة',
  'distress': 'أذكار الكرب',
  'gratitude': 'أذكار الشكر',
  'dua': 'أذكار الدعاء'
};

export const ViewAdhkar: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const categoryKey = type || 'general';
  const title = TITLES[categoryKey] || 'الأذكار';
  
  const [adhkarList, setAdhkarList] = useState<DhikrItem[]>([]);

  useEffect(() => {
    // Load directly from file via storage helper
    const list = getAdhkarByCategory(categoryKey);
    setAdhkarList(list);
  }, [categoryKey]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-screen pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 z-20 mb-6 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
         <div className="flex items-center gap-3">
            <Link to="/adhkar" className="p-2 bg-gray-100 dark:bg-dark-700 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
               <h2 className="text-xl font-bold text-gray-800 dark:text-white font-kufi">{title}</h2>
               <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{adhkarList.length} ذكر</p>
            </div>
         </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {adhkarList.length > 0 ? (
          adhkarList.map((item, index) => (
            <div key={index} className="relative group">
               <DhikrCard item={item} />
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد أذكار في هذا القسم حالياً.</p>
          </div>
        )}
      </div>

      {/* Completion Note */}
      {adhkarList.length > 0 && (
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>تقبل الله منك صالح الأعمال</p>
        </div>
      )}
    </div>
  );
};

// Interactive Card Component
const DhikrCard: React.FC<{ item: DhikrItem }> = ({ item }) => {
  const [count, setCount] = useState(item.count);
  const [completed, setCompleted] = useState(false);

  const handleTap = () => {
    if (completed) return;
    
    if (count > 1) {
      setCount(prev => prev - 1);
    } else {
      setCount(0);
      setCompleted(true);
      // Optional: Add haptic feedback here if PWA
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(item.count);
    setCompleted(false);
  };

  return (
    <div 
      onClick={handleTap}
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 select-none cursor-pointer border-2 ${
        completed 
          ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/30 opacity-80 scale-[0.98]' 
          : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-[0.99]'
      }`}
    >
      {/* Progress Bar Background */}
      <div 
        className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 transition-all duration-300"
        style={{ width: `${((item.count - count) / item.count) * 100}%` }}
      ></div>

      <div className="p-6 md:p-8">
        {/* Use the new font 'font-amiri' here */}
        <p className={`text-xl md:text-3xl font-amiri leading-loose text-center mb-6 ${completed ? 'text-emerald-800 dark:text-emerald-300' : 'text-gray-800 dark:text-white'}`}>
          {item.text}
        </p>

        {item.virtue && (
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs md:text-sm p-3 rounded-xl mb-6 text-center border border-amber-100 dark:border-amber-800/50 inline-block w-full">
            <span className="font-bold">💡 فضل الذكر:</span> {item.virtue}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
           {/* Reference */}
           <span className="text-xs text-gray-400">
             {item.reference || ''}
           </span>

           {/* Counter Button */}
           <div className={`flex items-center gap-3 transition-colors ${completed ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300'}`}>
              {completed ? (
                 <button 
                   onClick={reset}
                   className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 rounded-full font-bold hover:bg-emerald-200 transition-colors"
                 >
                   <RefreshCw size={16} /> إعادة
                 </button>
              ) : (
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">عدد المرات</span>
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-200 dark:shadow-none">
                       {count}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
      
      {/* Completed Overlay Icon */}
      {completed && (
        <div className="absolute top-4 left-4 text-emerald-500 animate-in zoom-in spin-in-12">
           <Check size={24} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};