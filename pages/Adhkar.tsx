import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Sun, Moon, CloudSun, Sunset, ArrowRight, Search, 
  Home, DoorOpen, Utensils, Shirt, Car, CloudRain, Wind, 
  ShieldAlert, HeartHandshake, Coins, RotateCcw, Repeat, 
  Star, Sparkles, Thermometer, Flame, HelpCircle, Frown, 
  ThumbsUp, BookHeart, DoorClosed, Footprints, CheckCircle2
} from 'lucide-react';
import { getAdhkarProgress, saveAdhkarProgress, getTodayKey } from '../services/storage';
import { triggerSmallConfetti } from '../services/confetti';

const { Link } = ReactRouterDOM;

const ADHKAR_TYPES = [
  { id: 'morning', label: 'أذكار الصباح', icon: Sun, color: 'amber', gradient: 'from-amber-400 to-orange-500' },
  { id: 'evening', label: 'أذكار المساء', icon: Moon, color: 'indigo', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'sleep', label: 'أذكار النوم', icon: Moon, color: 'slate', gradient: 'from-slate-600 to-slate-800' },
  { id: 'post_prayer', label: 'أذكار بعد الصلاة', icon: CloudSun, color: 'emerald', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'waking', label: 'أذكار الاستيقاظ', icon: Sun, color: 'yellow', gradient: 'from-yellow-400 to-orange-400' },
  { id: 'home_enter', label: 'دخول المنزل', icon: Home, color: 'blue', gradient: 'from-blue-400 to-blue-600' },
  { id: 'home_exit', label: 'الخروج من المنزل', icon: Footprints, color: 'cyan', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'bathroom_enter', label: 'دخول الخلاء', icon: DoorOpen, color: 'gray', gradient: 'from-gray-400 to-gray-600' },
  { id: 'bathroom_exit', label: 'الخروج من الخلاء', icon: DoorClosed, color: 'gray', gradient: 'from-gray-300 to-gray-500' },
  { id: 'food', label: 'أذكار الطعام', icon: Utensils, color: 'green', gradient: 'from-green-400 to-emerald-600' },
  { id: 'clothes', label: 'أذكار اللباس', icon: Shirt, color: 'pink', gradient: 'from-pink-400 to-rose-500' },
  { id: 'travel', label: 'الركوب والسفر', icon: Car, color: 'sky', gradient: 'from-sky-400 to-blue-500' },
  { id: 'rain', label: 'أذكار المطر', icon: CloudRain, color: 'blue', gradient: 'from-blue-300 to-blue-500' },
  { id: 'wind', label: 'أذكار الرياح', icon: Wind, color: 'teal', gradient: 'from-teal-200 to-teal-400' },
  { id: 'fear', label: 'أذكار الخوف', icon: ShieldAlert, color: 'red', gradient: 'from-red-400 to-red-600' },
  { id: 'relief', label: 'تفريج الهم', icon: HeartHandshake, color: 'rose', gradient: 'from-rose-300 to-pink-500' },
  { id: 'provision', label: 'أذكار الرزق', icon: Coins, color: 'yellow', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'istighfar', label: 'الاستغفار', icon: RotateCcw, color: 'violet', gradient: 'from-violet-400 to-purple-600' },
  { id: 'tasbeeh', label: 'التسبيح والتهليل', icon: Repeat, color: 'fuchsia', gradient: 'from-fuchsia-400 to-pink-600' },
  { id: 'salawat', label: 'الصلاة على النبي', icon: Star, color: 'emerald', gradient: 'from-emerald-500 to-green-600' },
  { id: 'general', label: 'الذكر المطلق', icon: Sparkles, color: 'indigo', gradient: 'from-indigo-400 to-purple-500' },
  { id: 'illness', label: 'أذكار المرض', icon: Thermometer, color: 'red', gradient: 'from-red-300 to-red-500' },
  { id: 'anger', label: 'أذكار الغضب', icon: Flame, color: 'orange', gradient: 'from-orange-500 to-red-500' },
  { id: 'istikhara', label: 'الاستخارة', icon: HelpCircle, color: 'purple', gradient: 'from-purple-400 to-indigo-500' },
  { id: 'distress', label: 'أذكار الكرب', icon: Frown, color: 'stone', gradient: 'from-stone-400 to-stone-600' },
  { id: 'gratitude', label: 'أذكار الشكر', icon: ThumbsUp, color: 'lime', gradient: 'from-lime-400 to-green-500' },
  { id: 'dua', label: 'أذكار الدعاء', icon: BookHeart, color: 'teal', gradient: 'from-teal-400 to-cyan-600' },
];

export const Adhkar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const progress = getAdhkarProgress(getTodayKey());
    setCompleted(progress.completedCategories);
  }, []);

  const toggleCompletion = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent link navigation if clicking the check button
    e.stopPropagation();
    
    let newCompleted;
    if (completed.includes(id)) {
      newCompleted = completed.filter(c => c !== id);
    } else {
      newCompleted = [...completed, id];
      triggerSmallConfetti();
    }
    
    setCompleted(newCompleted);
    saveAdhkarProgress({
      date: getTodayKey(),
      completedCategories: newCompleted
    });
  };

  const filteredAdhkar = ADHKAR_TYPES.filter(item => 
    item.label.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header & Search */}
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">حصن المسلم</h2>
          <p className="text-gray-500 dark:text-gray-400">فاذكروني أذكركم واشكروا لي ولا تكفرون</p>
        </div>

        <div className="max-w-md mx-auto relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
             <Search className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="ابحث في الأذكار..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3 px-12 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm dark:text-white"
             />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAdhkar.map((type) => {
          const isDone = completed.includes(type.id);
          
          return (
            <Link 
              key={type.id} 
              to={`/adhkar/${type.id}`}
              className={`group relative overflow-hidden rounded-2xl p-4 shadow-sm border transition-all hover:-translate-y-1 ${
                isDone 
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 dark:border-emerald-800' 
                  : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-emerald-100 dark:hover:border-emerald-900'
              }`}
            >
              {/* Background Gradient Blob */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${type.color}-500/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:scale-150 transition-transform duration-500`}></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${type.gradient} text-white shadow-md group-hover:shadow-lg transition-shadow`}>
                  <type.icon size={22} strokeWidth={2} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm md:text-base">
                    {type.label}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                   {/* Check Button */}
                   <button
                     onClick={(e) => toggleCompletion(e, type.id)}
                     className={`p-2 rounded-full transition-all z-20 ${
                        isDone 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-100 dark:bg-dark-700 text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                     }`}
                     title={isDone ? "تمت القراءة" : "تحديد كمقروء"}
                   >
                      <CheckCircle2 size={18} />
                   </button>
                   
                   <div className="text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors transform group-hover:translate-x-[-4px]">
                     <ArrowRight size={18} />
                   </div>
                </div>
              </div>
            </Link>
          );
        })}

        {filteredAdhkar.length === 0 && (
          <div className="col-span-full text-center py-12">
             <div className="bg-gray-50 dark:bg-dark-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="text-gray-400" size={24} />
             </div>
             <p className="text-gray-500 dark:text-gray-400">لا توجد أذكار تطابق بحثك</p>
          </div>
        )}
      </div>
    </div>
  );
};