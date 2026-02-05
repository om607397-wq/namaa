import React, { useState, useEffect } from 'react';
import { 
  Moon, Star, Coffee, Heart, Gift, Sparkles, BookOpen, 
  Check, Plus, Trash2 
} from 'lucide-react';
import { 
  getRamadanDay, saveRamadanDay, 
  getRamadanConfig, saveRamadanConfig, 
  getTodayKey 
} from '../services/storage';
import { RamadanDay, RamadanConfig } from '../types';

export const Ramadan: React.FC = () => {
  const [dayLog, setDayLog] = useState<RamadanDay>({
    date: getTodayKey(),
    fasting: false,
    tarawih: false,
    qiyam: false,
    iftarInvite: false,
    goodDeed: ''
  });
  const [config, setConfig] = useState<RamadanConfig>({
    khatmaGrid: new Array(30).fill(false),
    duas: []
  });
  const [newDua, setNewDua] = useState('');

  useEffect(() => {
    setDayLog(getRamadanDay(getTodayKey()));
    setConfig(getRamadanConfig());
  }, []);

  // --- Handlers ---
  const toggleDayLog = (key: keyof Omit<RamadanDay, 'date' | 'goodDeed'>) => {
    const updated = { ...dayLog, [key]: !dayLog[key] };
    setDayLog(updated);
    saveRamadanDay(updated);
  };

  const handleDeedChange = (text: string) => {
    const updated = { ...dayLog, goodDeed: text };
    setDayLog(updated);
    saveRamadanDay(updated); // Note: In real app, consider debouncing this
  };

  const toggleKhatmaPart = (index: number) => {
    const newGrid = [...config.khatmaGrid];
    newGrid[index] = !newGrid[index];
    const updatedConfig = { ...config, khatmaGrid: newGrid };
    setConfig(updatedConfig);
    saveRamadanConfig(updatedConfig);
  };

  const addDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDua.trim()) return;
    const updatedConfig = {
      ...config,
      duas: [...config.duas, { id: Date.now().toString(), text: newDua }]
    };
    setConfig(updatedConfig);
    saveRamadanConfig(updatedConfig);
    setNewDua('');
  };

  const removeDua = (id: string) => {
    const updatedConfig = {
      ...config,
      duas: config.duas.filter(d => d.id !== id)
    };
    setConfig(updatedConfig);
    saveRamadanConfig(updatedConfig);
  };

  const completedParts = config.khatmaGrid.filter(Boolean).length;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-700">
         <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 backdrop-blur-md border border-white/20">
               <Moon className="text-amber-400 fill-amber-400" size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2 font-serif tracking-wide text-amber-50">رمضـان كـريم</h2>
            <p className="text-indigo-200 text-lg">اللهم تقبل منا الصيام والقيام</p>
         </div>
         
         {/* Decorative Stars */}
         <Star className="absolute top-10 left-10 text-amber-300 opacity-50 animate-pulse" size={16} />
         <Star className="absolute bottom-10 right-20 text-amber-300 opacity-70 animate-pulse delay-700" size={24} />
         <Star className="absolute top-20 right-10 text-amber-300 opacity-30" size={12} />
         
         {/* Glow effects */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Right Col: Daily Tracker */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                 <Sparkles className="text-amber-500" /> عبادات اليوم
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <RamadanToggle 
                    label="صيام اليوم" 
                    icon={<Coffee size={20} />} 
                    isActive={dayLog.fasting} 
                    onClick={() => toggleDayLog('fasting')}
                    activeColor="bg-emerald-500"
                 />
                 <RamadanToggle 
                    label="صلاة التراويح" 
                    icon={<Moon size={20} />} 
                    isActive={dayLog.tarawih} 
                    onClick={() => toggleDayLog('tarawih')}
                    activeColor="bg-indigo-600"
                 />
                 <RamadanToggle 
                    label="القيام (التهجد)" 
                    icon={<Star size={20} />} 
                    isActive={dayLog.qiyam} 
                    onClick={() => toggleDayLog('qiyam')}
                    activeColor="bg-violet-600"
                 />
                 <RamadanToggle 
                    label="إفطار صائم" 
                    icon={<Gift size={20} />} 
                    isActive={dayLog.iftarInvite} 
                    onClick={() => toggleDayLog('iftarInvite')}
                    activeColor="bg-amber-500"
                 />
              </div>

              <div className="mt-6">
                 <label className="block text-sm font-bold text-gray-500 mb-2">إحسان اليوم (عمل صالح)</label>
                 <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-2">
                    <Heart className="text-amber-500 shrink-0" size={20} />
                    <input 
                      type="text" 
                      className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm"
                      placeholder="تصدقت، ساعدت أهلي، ابتسمت..."
                      value={dayLog.goodDeed}
                      onChange={e => handleDeedChange(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           {/* Dua List */}
           <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                 <BookOpen className="text-indigo-500" /> دعواتي
              </h3>
              <p className="text-xs text-gray-400 mb-4">اكتب دعواتك لتتذكرها عند الإفطار والسجود.</p>
              
              <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                 {config.duas.map(dua => (
                    <li key={dua.id} className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl">
                       <span className="text-indigo-900 dark:text-indigo-200 text-sm font-medium">{dua.text}</span>
                       <button onClick={() => removeDua(dua.id)} className="text-indigo-300 hover:text-red-400">
                          <Trash2 size={16} />
                       </button>
                    </li>
                 ))}
                 {config.duas.length === 0 && <li className="text-center text-gray-400 text-sm py-4">أضف دعواتك هنا</li>}
              </ul>

              <form onSubmit={addDua} className="relative">
                 <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 pr-12 outline-none focus:border-indigo-500 dark:text-white text-sm"
                    placeholder="اللهم..."
                    value={newDua}
                    onChange={e => setNewDua(e.target.value)}
                 />
                 <button type="submit" className="absolute left-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700">
                    <Plus size={16} />
                 </button>
              </form>
           </div>
        </div>

        {/* Left Col: Khatma Grid */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <BookOpen className="text-emerald-500" /> ختمة القرآن
              </h3>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                 {completedParts} / 30 جزء
              </span>
           </div>

           <div className="grid grid-cols-5 gap-3">
              {config.khatmaGrid.map((isDone, idx) => (
                 <button
                    key={idx}
                    onClick={() => toggleKhatmaPart(idx)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 relative overflow-hidden group ${
                       isDone 
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                          : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                    }`}
                 >
                    <span className="text-lg font-bold z-10">{idx + 1}</span>
                    <span className="text-[9px] z-10 font-medium opacity-80">جزء</span>
                    
                    {isDone && (
                       <div className="absolute inset-0 flex items-center justify-center bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check size={24} />
                       </div>
                    )}
                 </button>
              ))}
           </div>
           
           <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center">
              <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                 {completedParts === 30 
                    ? "مبارك! تقبل الله منك الختمة 🤲🎉" 
                    : "اقرأ جزءاً كل يوم لتختم في نهاية الشهر"}
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

const RamadanToggle: React.FC<{ 
  label: string, icon: any, isActive: boolean, onClick: () => void, activeColor: string 
}> = ({ label, icon, isActive, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${
       isActive 
          ? `${activeColor} text-white border-transparent shadow-lg` 
          : 'bg-gray-50 dark:bg-dark-900 text-gray-500 border-gray-100 dark:border-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </button>
);