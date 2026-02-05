import React, { useState, useEffect } from 'react';
import { getQuranLog, updateQuranLog, getTodayKey, getProfile, getQuranConfig, saveQuranConfig } from '../services/storage';
import { QuranLog, QuranTaskConfig } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Edit, X, BookOpen, ExternalLink, Search } from 'lucide-react';

const SURAHS = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الإنفطار", "المطففين", "الإنشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

export const Quran: React.FC = () => {
  const [log, setLog] = useState<QuranLog>({
    date: getTodayKey(),
    completedTaskIds: []
  });
  const [config, setConfig] = useState<QuranTaskConfig[]>([]);
  const [streak, setStreak] = useState(0);
  
  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState('');
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    setLog(getQuranLog(getTodayKey()));
    setConfig(getQuranConfig());
    setStreak(getProfile().streak);
  }, []);

  const toggleTask = (taskId: string) => {
    if (isEditing) return;
    const isDone = log.completedTaskIds.includes(taskId);
    let newIds;
    if (isDone) {
      newIds = log.completedTaskIds.filter(id => id !== taskId);
    } else {
      newIds = [...log.completedTaskIds, taskId];
    }
    const newLog = { ...log, completedTaskIds: newIds };
    setLog(newLog);
    updateQuranLog(newLog);
    
    if (config.length > 0 && newIds.length === config.length) {
       setTimeout(() => setStreak(getProfile().streak), 100);
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurah) return;
    
    const label = customNote ? `سورة ${selectedSurah} (${customNote})` : `سورة ${selectedSurah}`;
    const newConfig = [...config, { id: Date.now().toString(), label }];
    setConfig(newConfig);
    saveQuranConfig(newConfig);
    setSelectedSurah('');
    setCustomNote('');
  };

  const removeTask = (id: string) => {
    const newConfig = config.filter(t => t.id !== id);
    setConfig(newConfig);
    saveQuranConfig(newConfig);
  };

  const progress = config.length > 0 
    ? (log.completedTaskIds.length / config.length) * 100 
    : 0;

  // Helper to extract Surah name for linking
  const getSurahIndex = (label: string) => {
    for (let i = 0; i < SURAHS.length; i++) {
      if (label.includes(SURAHS[i])) return i + 1;
    }
    return 1; // Default to Fatiha
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">وِرد القرآن</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">اجعل القرآن ربيع قلبك</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl transition-colors font-bold flex items-center gap-2 ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-700'}`}
        >
          {isEditing ? <><X size={18} /> خروج</> : <><Edit size={18} /> تعديل الخطة</>}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header Stats */}
        <div className="bg-emerald-600 p-8 text-white flex items-center justify-between relative overflow-hidden">
           <div className="relative z-10">
             <span className="block text-emerald-100 text-sm mb-1">نسبة الإنجاز اليومي</span>
             <span className="text-4xl font-bold">{Math.round(progress)}%</span>
           </div>
           <div className="text-right relative z-10">
             <span className="block text-emerald-100 text-sm mb-1">استمرار</span>
             <span className="text-2xl font-bold flex items-center gap-2 justify-end">
               {streak} يوم <span className="text-orange-300">🔥</span>
             </span>
           </div>
           
           <BookOpen className="absolute -bottom-6 -left-6 text-emerald-500 opacity-30" size={120} />
        </div>
        
        <div className="p-6 space-y-4">
          
          {/* Add Form */}
          {(isEditing || config.length === 0) && (
             <form onSubmit={addTask} className="mb-8 bg-gray-50 dark:bg-dark-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm">أضف سورة للورد اليومي:</h4>
                <div className="flex flex-col gap-3">
                   <div className="relative">
                     <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
                     <select 
                       value={selectedSurah}
                       onChange={e => setSelectedSurah(e.target.value)}
                       className="w-full p-3 pr-10 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none appearance-none"
                     >
                        <option value="">اختر السورة...</option>
                        {SURAHS.map((s, i) => (
                          <option key={i} value={s}>{i + 1}. {s}</option>
                        ))}
                     </select>
                   </div>
                   
                   <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="ملاحظة (مثلاً: أول 10 آيات)" 
                        className="flex-1 p-3 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-sm"
                        value={customNote}
                        onChange={e => setCustomNote(e.target.value)}
                     />
                     <button type="submit" className="bg-emerald-600 text-white px-6 rounded-xl hover:bg-emerald-700 font-bold">
                       <Plus size={20} />
                     </button>
                   </div>
                </div>
             </form>
          )}

          {config.map((task) => {
            const isDone = log.completedTaskIds.includes(task.id);
            const surahIndex = getSurahIndex(task.label);
            
            return (
              <div 
                key={task.id}
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                  isEditing 
                    ? 'border-gray-200 bg-gray-50 dark:bg-dark-900 cursor-default' 
                    : (isDone 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                        : 'border-gray-100 dark:border-gray-700 hover:border-emerald-200 bg-white dark:bg-dark-800')
                }`}
              >
                <div 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-4 flex-1 cursor-pointer`}
                >
                  {!isEditing && (
                    <div className={`transition-transform duration-300 ${isDone ? 'scale-110' : ''}`}>
                      {isDone ? (
                        <CheckCircle2 className="text-emerald-500 fill-emerald-100" size={28} />
                      ) : (
                        <Circle className="text-gray-300 dark:text-gray-600 group-hover:text-emerald-400" size={28} />
                      )}
                    </div>
                  )}
                  <div>
                    <h4 className={`font-bold text-lg ${isDone ? 'text-emerald-900 dark:text-emerald-300 line-through decoration-emerald-500/50' : 'text-gray-700 dark:text-gray-200'}`}>
                      {task.label}
                    </h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Read Button */}
                  {!isEditing && (
                    <a 
                      href={`https://quran.com/${surahIndex}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookOpen size={14} /> قراءة
                    </a>
                  )}

                  {isEditing && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                      className="text-red-400 hover:text-red-600 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {config.length === 0 && !isEditing && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
              <p>لم تحدد وردك اليومي بعد.</p>
              <button onClick={() => setIsEditing(true)} className="text-emerald-600 font-bold mt-2">اضغط هنا لإضافة سور</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};