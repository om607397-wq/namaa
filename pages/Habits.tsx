import React, { useState, useEffect } from 'react';
import { getDailyHabits, saveDailyHabits, getTodayKey, getHabitsConfig, saveHabitsConfig } from '../services/storage';
import { DailyHabits, HabitConfig } from '../types';
import { 
  Droplets, Check, Plus, Trash2, Edit3, X, 
  Dumbbell, Apple, Ban, BookOpen, Bed, 
  Briefcase, Coffee, Sun, Moon, Zap, Heart, Brain
} from 'lucide-react';

// Icon Definitions
const ICONS = {
  sport: { icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: 'رياضة' },
  food: { icon: Apple, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'أكل صحي' },
  quit: { icon: Ban, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'إقلاع' },
  read: { icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'قراءة' },
  sleep: { icon: Bed, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'نوم' },
  work: { icon: Briefcase, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'عمل' },
  coffee: { icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'قهوة/مزاج' },
  dhikr: { icon: Moon, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', label: 'عبادة' },
  focus: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'تركيز' },
  health: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', label: 'صحة' },
  learn: { icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'تعلم' },
  other: { icon: Sun, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'أخرى' },
};

export const Habits: React.FC = () => {
  const [log, setLog] = useState<DailyHabits>({
    date: getTodayKey(),
    completedHabitIds: [],
    waterCups: 0,
  });
  const [habitsConfig, setHabitsConfig] = useState<HabitConfig[]>([]);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIconKey, setSelectedIconKey] = useState<keyof typeof ICONS>('health');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLog(getDailyHabits(getTodayKey()));
    setHabitsConfig(getHabitsConfig());
  };

  const toggleHabit = (id: string) => {
    const isDone = log.completedHabitIds.includes(id);
    let newIds;
    if (isDone) {
      newIds = log.completedHabitIds.filter(hId => hId !== id);
    } else {
      newIds = [...log.completedHabitIds, id];
    }
    const newLog = { ...log, completedHabitIds: newIds };
    setLog(newLog);
    saveDailyHabits(newLog);
  };

  const updateWater = (delta: number) => {
    const newCount = Math.max(0, log.waterCups + delta);
    const newLog = { ...log, waterCups: newCount };
    setLog(newLog);
    saveDailyHabits(newLog);
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: HabitConfig = {
      id: Date.now().toString(),
      name: newHabitName,
      emoji: selectedIconKey // We store the key (e.g., 'sport') instead of an emoji char
    };
    const newConfig = [...habitsConfig, newHabit];
    setHabitsConfig(newConfig);
    saveHabitsConfig(newConfig);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه العادة؟')) {
      const newConfig = habitsConfig.filter(h => h.id !== id);
      setHabitsConfig(newConfig);
      saveHabitsConfig(newConfig);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">صحة وعادات</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ابنِ روتيناً صحياً بلمسة جمالية</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl transition-colors font-bold flex items-center gap-2 ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-indigo-100 text-indigo-700'}`}
        >
          {isEditing ? <><X size={18} /> خروج</> : <><Edit3 size={18} /> تعديل الخطة</>}
        </button>
      </div>

      {/* Add New Habit Form */}
      {(isEditing || habitsConfig.length === 0) && (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-indigo-500" /> إضافة عادة جديدة
          </h3>
          
          <div className="mb-4">
             <label className="text-xs font-bold text-gray-400 mb-2 block">اختر أيقونة معبرة:</label>
             <div className="flex flex-wrap gap-2">
               {Object.entries(ICONS).map(([key, def]) => (
                 <button
                   key={key}
                   type="button"
                   onClick={() => setSelectedIconKey(key as keyof typeof ICONS)}
                   className={`p-3 rounded-xl border-2 transition-all ${
                     selectedIconKey === key 
                       ? `${def.bg} ${def.border} ${def.color} scale-110` 
                       : 'bg-gray-50 dark:bg-dark-900 border-transparent text-gray-400 hover:bg-gray-100'
                   }`}
                   title={def.label}
                 >
                   <def.icon size={20} strokeWidth={2} />
                 </button>
               ))}
             </div>
          </div>

          <form onSubmit={addHabit} className="flex gap-3 items-center">
             <input 
               type="text" 
               placeholder="اسم العادة (مثلاً: الذهاب للجيم، قراءة كتاب)"
               className="flex-1 p-4 bg-gray-50 dark:bg-dark-900 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
               value={newHabitName}
               onChange={e => setNewHabitName(e.target.value)}
             />
             <button type="submit" className="p-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95">
               إضافة
             </button>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {habitsConfig.map(habit => {
          // Check if key exists in ICONS, fallback to 'other' if not (or if it's an old emoji)
          const iconKey = ICONS[habit.emoji as keyof typeof ICONS] ? habit.emoji as keyof typeof ICONS : 'other';
          const IconDef = ICONS[iconKey];
          const IconComponent = IconDef.icon;
          const isDone = log.completedHabitIds.includes(habit.id);

          return (
            <div 
              key={habit.id}
              onClick={() => !isEditing && toggleHabit(habit.id)}
              className={`relative p-5 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center justify-between group ${
                isEditing ? 'border-gray-100 bg-gray-50 dark:bg-dark-900 cursor-default opacity-80' : 
                (isDone 
                  ? `${IconDef.bg} ${IconDef.border} cursor-pointer` 
                  : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 cursor-pointer hover:shadow-md')
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${
                    isDone ? 'bg-white/50' : `${IconDef.bg} dark:bg-dark-700`
                }`}>
                   <IconComponent 
                      size={24} 
                      strokeWidth={1.5} 
                      className={IconDef.color} 
                   />
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${isDone ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                    {habit.name}
                  </h4>
                  {isDone && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 ${IconDef.color}`}>منجز</span>}
                </div>
              </div>
              
              {isEditing ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                  className="p-2 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-200"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone 
                    ? `bg-white text-emerald-600 shadow-sm` 
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-300'
                }`}>
                  {isDone && <Check size={18} strokeWidth={3} />}
                </div>
              )}
            </div>
          );
        })}
        
        {habitsConfig.length === 0 && !isEditing && (
             <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               القائمة فارغة. اضغط على "تعديل الخطة" لإضافة أهدافك.
             </div>
        )}
      </div>

      {/* Water Counter */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-[2rem] border border-cyan-100 dark:border-cyan-800/30 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
             <div className="bg-white dark:bg-dark-800 p-2 rounded-full shadow-sm">
                <Droplets size={24} className="text-cyan-500" fill="currentColor" fillOpacity={0.2} />
             </div>
             <h3 className="text-xl font-bold text-cyan-900 dark:text-cyan-100">شرب الماء</h3>
          </div>
          
          <div className="flex items-center justify-center gap-8 mb-6">
             <button 
               onClick={() => updateWater(-1)}
               className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-800 text-cyan-600 hover:shadow-md transition-all font-bold text-xl flex items-center justify-center"
             >-</button>
             
             <div className="text-center">
                <span className="text-5xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{log.waterCups}</span>
                <p className="text-xs font-bold text-cyan-400 mt-1 uppercase tracking-wider">أكواب</p>
             </div>
             
             <button 
               onClick={() => updateWater(1)}
               className="w-12 h-12 rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-200 dark:shadow-none hover:bg-cyan-600 transition-all font-bold text-xl flex items-center justify-center"
             >+</button>
          </div>

          {/* Visual Cups */}
          <div className="flex justify-center gap-2 flex-wrap max-w-xs mx-auto">
            {[...Array(8)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-3 h-8 rounded-full transition-all duration-500 ${
                   i < log.waterCups 
                    ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-110' 
                    : 'bg-cyan-200/50 dark:bg-cyan-900/30'
                 }`}
               ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};