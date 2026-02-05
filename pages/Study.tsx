import React, { useState, useEffect, useRef } from 'react';
import { StudySession, Subject, StudyType } from '../types';
import { addStudySession, getStudySessions, getTodayKey } from '../services/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Timer, History, Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX, CloudRain, Wind, Waves } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../services/confetti'; // Import confetti

const SUBJECTS: Subject[] = ['رياضة', 'فيزياء', 'كيمياء', 'عربي', 'إنجليزي'];
const TYPES: StudyType[] = ['فهم', 'حل', 'مراجعة'];

// Ambient Sounds with stable URLs
const SOUNDS = [
  { id: 'rain', label: 'مطر', icon: CloudRain, url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'waves', label: 'بحر', icon: Waves, url: 'https://actions.google.com/sounds/v1/water/waves_crashing.ogg' },
  { id: 'wind', label: 'رياح', icon: Wind, url: 'https://actions.google.com/sounds/v1/weather/wind_blowing.ogg' },
];

export const Study: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'timer' | 'manual'>('timer');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  
  // Timer Context
  const { 
    isActive, isBreak, timeLeft, initialTime, subject: timerSubject, type: timerType,
    toggleTimer, resetTimer, switchMode, setStudyDetails, formatTime, progress 
  } = useTimer();

  // Sound State
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Manual Form State
  const [manualSubject, setManualSubject] = useState<Subject>('رياضة');
  const [manualType, setManualType] = useState<StudyType>('فهم');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const loadData = () => {
    const all = getStudySessions();
    setSessions(all);
    setTodaySessions(all.filter(s => s.date === getTodayKey()));
  };

  const toggleSound = (soundUrl: string, id: string) => {
    if (activeSound === id) {
      // Stop
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveSound(null);
    } else {
      // Start new
      if (audioRef.current) {
        audioRef.current.pause();
      }
      try {
        audioRef.current = new Audio(soundUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback failed:", error);
            showToast('تعذر تشغيل الصوت. تحقق من الإعدادات.', 'error');
            setActiveSound(null);
          });
        }
        setActiveSound(id);
      } catch (e) {
        console.error("Audio error:", e);
        showToast('حدث خطأ في تشغيل الصوت', 'error');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    let diff = (end.getTime() - start.getTime()) / 1000 / 60; // minutes
    
    if (diff < 0) diff += 24 * 60; 

    const newSession: StudySession = {
      id: Date.now().toString(),
      date: getTodayKey(),
      subject: manualSubject,
      startTime,
      endTime,
      durationMinutes: diff,
      type: manualType
    };

    addStudySession(newSession);
    loadData();
    setStartTime('');
    setEndTime('');
    showToast('تم تسجيل الجلسة بنجاح ✅');
    triggerConfetti(); // Celebration on manual entry too!
  };

  const chartData = SUBJECTS.map(subj => {
    const totalMinutes = sessions
      .filter(s => s.subject === subj)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return { name: subj, hours: +(totalMinutes / 60).toFixed(1) };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex bg-gray-100 dark:bg-dark-800 p-1 rounded-xl w-fit mx-auto md:mx-0">
        <button 
          onClick={() => setActiveTab('timer')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'timer' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          ⏱️ مؤقت التركيز
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          📝 تسجيل يدوي
        </button>
      </div>

      {activeTab === 'timer' ? (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-800 dark:from-indigo-900 dark:to-violet-950 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.01]">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
           </div>

           <div className="relative z-10 max-w-md mx-auto">
              <div className="flex justify-center gap-4 mb-8">
                 <button 
                   onClick={() => switchMode('focus')}
                   className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${!isBreak ? 'bg-white text-indigo-600 border-white' : 'border-white/30 text-indigo-100 hover:bg-white/10'}`}
                 >
                   <Zap size={14} className="inline mr-1" /> تركيز
                 </button>
                 <button 
                   onClick={() => switchMode('break')}
                   className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${isBreak ? 'bg-white text-indigo-600 border-white' : 'border-white/30 text-indigo-100 hover:bg-white/10'}`}
                 >
                   <Coffee size={14} className="inline mr-1" /> استراحة
                 </button>
              </div>

              <div className="mb-8 relative">
                 <div className="text-8xl font-mono font-bold tracking-tighter tabular-nums text-white drop-shadow-md">
                   {formatTime(timeLeft)}
                 </div>
                 <div className="text-indigo-200 mt-2 font-medium">
                   {isActive ? (isBreak ? 'استمتع بوقتك 💆‍♂️' : 'ركّز، أنت قدها 💪') : 'اضغط ابدأ للانطلاق'}
                 </div>
              </div>

              <div className="flex items-center justify-center gap-6 mb-8">
                 <button 
                   onClick={resetTimer}
                   className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                 >
                   <RotateCcw size={24} />
                 </button>
                 <button 
                   onClick={toggleTimer}
                   className="w-20 h-20 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                 >
                   {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                 </button>
              </div>

              {/* Soundscapes */}
              <div className="flex justify-center gap-3 mb-6">
                {SOUNDS.map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => toggleSound(sound.url, sound.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeSound === sound.id 
                        ? 'bg-white text-indigo-600 animate-pulse' 
                        : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                    }`}
                  >
                    <sound.icon size={12} /> {sound.label}
                  </button>
                ))}
              </div>

              {!isBreak && (
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                   <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <label className="text-xs text-indigo-200 block mb-1">المادة</label>
                        <select 
                          disabled={isActive}
                          value={timerSubject} 
                          onChange={e => setStudyDetails(e.target.value as Subject, timerType)}
                          className="w-full bg-black/20 text-white rounded-lg px-2 py-1 text-sm outline-none cursor-pointer"
                        >
                          {SUBJECTS.map(s => <option key={s} value={s} className="text-gray-900">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-indigo-200 block mb-1">النوع</label>
                        <select 
                          disabled={isActive}
                          value={timerType} 
                          onChange={e => setStudyDetails(timerSubject, e.target.value as StudyType)}
                          className="w-full bg-black/20 text-white rounded-lg px-2 py-1 text-sm outline-none cursor-pointer"
                        >
                          {TYPES.map(t => <option key={t} value={t} className="text-gray-900">{t}</option>)}
                        </select>
                      </div>
                   </div>
                </div>
              )}
           </div>
           
           <div className="absolute bottom-0 left-0 h-2 bg-black/20 w-full">
              <div 
                className="h-full bg-white/50 transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
           </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Plus className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-1 rounded-lg" size={28} />
            تسجيل جلسة سابقة
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">المادة</label>
              <select 
                value={manualSubject} 
                onChange={e => setManualSubject(e.target.value as Subject)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">النوع</label>
              <select 
                value={manualType} 
                onChange={e => setManualType(e.target.value as StudyType)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">من</label>
              <input 
                type="time" 
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">إلى</label>
              <input 
                type="time" 
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl transition-colors">
                تسجيل
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger-2">
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Timer size={20} className="text-gray-400" />
            إجمالي الساعات (تراكمي)
           </h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                   cursor={{fill: '#f1f5f9'}} 
                   contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', padding: '10px'}} 
                 />
                 <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-secondary-50 dark:bg-dark-800 p-6 rounded-2xl border border-secondary-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <History size={20} className="text-gray-400" />
            جلسات اليوم
          </h3>
          {todaySessions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا توجد جلسات اليوم بعد</p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map(session => (
                <div key={session.id} className="bg-white dark:bg-dark-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-bold text-gray-800 dark:text-gray-200">{session.subject}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{session.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-primary-600 dark:text-primary-400 font-bold">{session.durationMinutes} دقيقة</div>
                    <div className="text-xs text-gray-400">{session.startTime} - {session.endTime}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};