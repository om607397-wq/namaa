import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  getProfile, 
  getTodayKey, 
  getStudySessions, 
  getQuranLog, 
  getBudget, 
  getExpenses, 
  updateProfile,
  getScreenTimeLog,
  getTasbeehLog,
  calculateDailyScore,
  getLast7DaysStudy,
  getFocusList,
  saveFocusList,
  getDailyHabits,
  saveDailyHabits,
  getPrayerLog,
  getRamadanConfig,
  getQuranConfig,
  getHabitsConfig
} from '../services/storage';
import { 
  Clock, BookOpen, Wallet, Smartphone, 
  Target, TrendingUp, CheckCircle2, Square, Droplets, Ban, Sun,
  Moon, ChevronLeft, Dumbbell, Bed, HeartHandshake,
  ArrowUpRight, Flower2, Zap, Briefcase, Heart, Brain, Apple, Coffee, Sprout, Quote, User, Sparkles, Flame
} from 'lucide-react';
import { AchievementTree } from '../components/AchievementTree';
import { PrayerTimesWidget } from '../components/PrayerTimesWidget';
import { BreathingExercise } from '../components/BreathingExercise'; 
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FocusList, DailyHabits, PrayerLog, PrayerStatus, HabitConfig } from '../types';
import { getRandomQuote } from '../data/quotes';
import { triggerSmallConfetti } from '../services/confetti'; 

const getHabitIconInfo = (key: string) => {
  switch(key) {
    case 'sport': return { icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    case 'food': return { icon: Apple, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'quit': return { icon: Ban, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
    case 'read': return { icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    case 'sleep': return { icon: Bed, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200' };
    case 'work': return { icon: Briefcase, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
    case 'coffee': return { icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'dhikr': return { icon: Moon, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' };
    case 'focus': return { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    case 'health': return { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' };
    case 'learn': return { icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    default: return { icon: Sun, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
  }
};

export const Dashboard: React.FC = () => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isEditingName, setIsEditingName] = useState(false);
  const [stats, setStats] = useState({
    studyHours: 0,
    quranCommitment: 0,
    remainingBudget: 0,
    streak: 0,
    screenTimeUsage: 0,
    screenTimeLimit: 0,
    tasbeehCount: 0,
    dailyScore: 0
  });

  const [chartData, setChartData] = useState<{name: string, hours: number}[]>([]);
  const [focusList, setFocusList] = useState<FocusList>({ date: '', tasks: [] });
  const [habits, setHabits] = useState<DailyHabits | null>(null);
  const [habitsConfig, setHabitsConfig] = useState<HabitConfig[]>([]);
  const [prayers, setPrayers] = useState<PrayerLog | null>(null);
  const [ramadanKhatmaProgress, setRamadanKhatmaProgress] = useState(0);
  const [quote, setQuote] = useState('');
  
  // Parallax State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllData();
    setQuote(getRandomQuote());
  }, []);

  const loadAllData = () => {
    const today = getTodayKey();
    const profile = getProfile();
    const study = getStudySessions().filter(s => s.date === today);
    const quran = getQuranLog(today);
    const budget = getBudget();
    const expenses = getExpenses();
    const screenTime = getScreenTimeLog(today);
    const tasbeeh = getTasbeehLog(today);
    const score = calculateDailyScore(today);
    
    // Ramadan Data
    const rConfig = getRamadanConfig();
    const completedParts = rConfig.khatmaGrid.filter(Boolean).length;
    setRamadanKhatmaProgress(completedParts);

    // Calculate Study Hours
    const minutes = study.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    
    // Calculate Quran %
    const quranConfig = getQuranConfig();
    let quranPercent = 0;
    if (quranConfig.length > 0) {
      quranPercent = Math.round((quran.completedTaskIds.length / quranConfig.length) * 100);
    }

    // Calculate Budget
    let remaining = 0;
    if (budget) {
      const relevantExpenses = expenses.filter(e => e.date >= budget.startDate);
      const spent = relevantExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      remaining = budget.amount - spent;
    }

    setName(profile.name);
    setAvatar(profile.avatar);
    setStats({
      studyHours: +(minutes / 60).toFixed(1),
      quranCommitment: quranPercent,
      remainingBudget: remaining,
      streak: profile.streak,
      screenTimeUsage: screenTime.usageMinutes,
      screenTimeLimit: screenTime.limitMinutes,
      tasbeehCount: tasbeeh.count,
      dailyScore: score
    });

    // Load Charts & Other Modules
    setChartData(getLast7DaysStudy());
    setFocusList(getFocusList(today));
    setHabits(getDailyHabits(today));
    setHabitsConfig(getHabitsConfig());
    setPrayers(getPrayerLog(today));
  };

  const handleNameSave = () => {
    const profile = getProfile();
    updateProfile({ ...profile, name });
    setIsEditingName(false);
  };

  const toggleFocusTask = (id: string) => {
    if (!focusList) return;
    const isNowCompleted = !focusList.tasks.find(t => t.id === id)?.completed;
    
    const updatedTasks = focusList.tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    const updatedList = { ...focusList, tasks: updatedTasks };
    setFocusList(updatedList);
    saveFocusList(updatedList);

    if (isNowCompleted) triggerSmallConfetti();
  };

  const toggleHabit = (id: string) => {
    if (!habits) return;
    const isDone = habits.completedHabitIds.includes(id);
    let newIds;
    if (isDone) {
      newIds = habits.completedHabitIds.filter(hId => hId !== id);
    } else {
      newIds = [...habits.completedHabitIds, id];
      triggerSmallConfetti();
    }
    const newHabits = { ...habits, completedHabitIds: newIds };
    setHabits(newHabits);
    saveDailyHabits(newHabits);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    // Calculate position relative to center (-0.5 to 0.5)
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const getMotivation = () => {
    const score = stats.dailyScore;
    if (score >= 80) return "أنت اليوم في قمة النمو! استمر 🌿";
    if (score >= 50) return "خطوات ثابتة نحو القمة، واصل 🌤️";
    return "كل يوم هو فرصة جديدة للبداية، انطلق 🚀";
  };

  const todayDate = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Hero Section with Parallax */}
      <div 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="animate-stagger-1 relative bg-gradient-to-br from-emerald-800 to-teal-900 dark:from-emerald-950 dark:to-teal-950 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 overflow-hidden group min-h-[280px] flex flex-col justify-center"
      >
        {/* Animated Background Layers (Parallax) */}
        <div className="absolute inset-0 pointer-events-none">
           {/* Layer 1: Deep Blobs (Slowest) */}
           <div 
             className="absolute top-[-50%] right-[-20%] w-[80%] h-[150%] bg-emerald-600/20 rounded-full blur-[100px] transition-transform duration-100 ease-out"
             style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
           ></div>
           
           {/* Layer 2: Medium Blobs */}
           <div 
             className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[100%] bg-teal-500/10 rounded-full blur-[80px] transition-transform duration-100 ease-out"
             style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
           ></div>

           {/* Layer 3: Floating Particles (Fastest) */}
           <div 
             className="absolute top-20 right-20 w-4 h-4 bg-yellow-300/40 rounded-full blur-[1px] animate-float transition-transform duration-100 ease-out"
             style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}
           ></div>
           <div 
             className="absolute bottom-20 left-40 w-6 h-6 bg-white/10 rounded-full blur-[2px] animate-float [animation-delay:2s] transition-transform duration-100 ease-out"
             style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
           ></div>
           <Sparkles 
             className="absolute top-10 left-10 text-emerald-300/30 animate-pulse" 
             style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)` }} 
             size={48} 
           />
        </div>

        {/* Content */}
        {/* Changed layout from md:flex-row to lg:flex-row to prevent clipping on tablets */}
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-right w-full">
            {/* Avatar Display */}
            <div 
              className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-300 to-teal-500 shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-300 mx-auto md:mx-0"
              style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }}
            >
               <div className="w-full h-full rounded-full overflow-hidden bg-white/90 border-4 border-transparent">
                 {avatar ? (
                   <img src={avatar} alt="Me" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-emerald-700"><User size={40} /></div>
                 )}
               </div>
               <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-emerald-900 shadow-lg flex items-center gap-1">
                  <Flame size={12} fill="currentColor" /> {stats.streak}
               </div>
            </div>

            <div className="space-y-2 w-full md:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-100 text-xs font-medium tracking-wide shadow-sm mx-auto md:mx-0">
                <Clock size={12} />
                <span>{todayDate}</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-md flex justify-center md:justify-start">
                {isEditingName ? (
                  <input 
                    autoFocus
                    className="bg-black/20 text-white rounded-lg px-3 py-1 outline-none w-full max-w-xs border-b-2 border-emerald-400/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditingName(true)} 
                    className="cursor-pointer hover:text-emerald-200 transition-colors flex items-center gap-2"
                  >
                     <span>صباح الخير،</span>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-100">
                       {name}
                     </span>
                  </div>
                )}
              </h2>
              
              <p className="text-emerald-100/90 text-lg font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
                {getMotivation()}
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-center justify-center shrink-0 w-full lg:w-auto"
            style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
          >
             <div className="bg-white/10 backdrop-blur-lg p-5 rounded-3xl border border-white/20 flex flex-col items-center min-w-[120px] hover:bg-white/20 transition-all duration-300 shadow-xl group/score">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest mb-1 group-hover/score:text-white transition-colors">حصاد اليوم</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black text-white drop-shadow-sm">{stats.dailyScore}</span>
                   <span className="text-sm font-bold text-emerald-300">/ 100</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="animate-stagger-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-4 rounded-2xl flex items-start gap-3">
         <Quote className="text-amber-500 shrink-0 mt-1" size={20} />
         <div>
            <p className="text-amber-900 dark:text-amber-100 font-medium text-sm italic">"{quote}"</p>
         </div>
      </div>

      {/* 2. Prayer Times Widget */}
      <div className="animate-stagger-2">
         <PrayerTimesWidget />
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         
         {/* LEFT COLUMN */}
         <div className="space-y-8 animate-stagger-3">
            <AchievementTree score={stats.dailyScore} />
            
            <BreathingExercise />

            {/* Prayer Tracker */}
            {prayers && (
              <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6 relative z-10">
                   <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                     <CheckCircle2 size={20} className="text-emerald-500" /> سجل صلواتك
                   </h3>
                   <Link to="/prayers" className="p-2 bg-gray-50 dark:bg-dark-700 rounded-xl text-gray-400 hover:text-primary-600 transition-colors">
                      <ArrowUpRight size={20} />
                   </Link>
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                  {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((p, idx) => {
                    const status = prayers[p as keyof PrayerLog] as PrayerStatus;
                    const sunnah = prayers[`${p}Sunnah` as keyof PrayerLog];
                    
                    let statusColor = "bg-gray-100 dark:bg-dark-700 text-gray-300";
                    if (status === 'mosque' || status === 'ontime') statusColor = "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none";
                    else if (status === 'late') statusColor = "bg-orange-400 text-white";
                    else if (status === 'missed') statusColor = "bg-red-500 text-white";

                    return (
                      <div key={p} className="flex flex-col items-center gap-3 group cursor-default">
                        <div className={`w-2 h-2 rounded-full transition-colors ${sunnah ? 'bg-amber-400' : 'bg-gray-200 dark:bg-dark-600'}`}></div>
                        <div className={`w-10 h-14 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 group-hover:scale-105 ${statusColor}`}>
                           {idx === 0 ? 'ف' : idx === 1 ? 'ظ' : idx === 2 ? 'ع' : idx === 3 ? 'م' : 'ع'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
         </div>

         {/* MIDDLE COLUMN */}
         <div className="space-y-8 animate-stagger-3" style={{ animationDelay: '0.2s' }}>
            {/* Focus List */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 h-fit hover:shadow-md transition-shadow">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                   <Target className="text-red-500" size={20} /> التركيز اليوم
                 </h3>
                 <div className="text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1 rounded-full">
                    {focusList.tasks.filter(t => t.completed).length} / {focusList.tasks.length}
                 </div>
               </div>
               
               <div className="space-y-3">
                 {focusList.tasks.length > 0 ? focusList.tasks.map(task => (
                   <div 
                     key={task.id} 
                     onClick={() => toggleFocusTask(task.id)}
                     className={`group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${task.completed ? 'bg-gray-50 dark:bg-dark-700 border-transparent opacity-60' : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-gray-700 hover:border-red-100 hover:shadow-sm hover:-translate-y-0.5'}`}
                   >
                     <div className={`mt-0.5 transition-colors ${task.completed ? 'text-emerald-500' : 'text-gray-300 group-hover:text-red-300'}`}>
                       {task.completed ? <CheckCircle2 size={20} /> : <Square size={20} />}
                     </div>
                     <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                       {task.text}
                     </span>
                   </div>
                 )) : (
                   <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                     لم تحدد مهام اليوم
                   </div>
                 )}
               </div>
            </div>

            {/* Quick Habits */}
            {habits && (
               <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-6 text-sm flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" /> عاداتي
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {habitsConfig.map(habit => {
                        const isDone = habits.completedHabitIds.includes(habit.id);
                        const info = getHabitIconInfo(habit.emoji);
                        const Icon = info.icon;
                        
                        return (
                          <button 
                            key={habit.id}
                            onClick={() => toggleHabit(habit.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 hover:-translate-y-1 ${
                              isDone 
                                ? `${info.bg} ${info.border} ${info.color}` 
                                : 'bg-white dark:bg-dark-700 border-gray-100 dark:border-gray-600 text-gray-400 hover:border-gray-300'
                            }`}
                          >
                            <div className={isDone ? info.color : 'text-gray-400'}>
                              <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className="text-xs font-bold">{habit.name}</span>
                          </button>
                        );
                     })}

                     {habitsConfig.length === 0 && (
                        <div className="col-span-2 text-center py-4 text-gray-400 text-sm">
                           لا توجد عادات مضافة
                        </div>
                     )}

                     {/* Water Widget */}
                     <div className="col-span-2 bg-cyan-50 dark:bg-cyan-900/10 rounded-2xl p-4 flex items-center justify-between border border-cyan-100 dark:border-cyan-800/30">
                        <div className="flex items-center gap-3 text-cyan-700 dark:text-cyan-400">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-800 rounded-xl">
                             <Droplets size={20} strokeWidth={2} />
                          </div>
                          <span className="text-sm font-bold">الماء</span>
                        </div>
                        <div className="flex items-end gap-1">
                           <span className="font-bold text-2xl text-cyan-800 dark:text-cyan-300">{habits.waterCups}</span>
                           <span className="text-xs font-medium text-cyan-600 mb-1">/ 8</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* RIGHT COLUMN */}
         <div className="space-y-8 animate-stagger-3" style={{ animationDelay: '0.4s' }}>
            {/* Chart */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 text-sm">نبض المذاكرة</h3>
              <p className="text-xs text-gray-400 mb-6">ساعات المذاكرة (آخر 7 أيام)</p>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', padding: '10px'}} 
                      cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                    />
                    <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <StatCard 
                 icon={<Clock />} label="ساعات اليوم" value={`${stats.studyHours}`} color="blue" 
               />
               <StatCard 
                 icon={<BookOpen />} label="القرآن" value={`${stats.quranCommitment}%`} color="emerald" 
               />
               <StatCard 
                 icon={<Smartphone />} label="موبايل" value={`${stats.screenTimeUsage}د`} color="indigo" 
               />
               <StatCard 
                 icon={<Wallet />} label="المتبقي" value={`${stats.remainingBudget}`} color="amber" 
               />
            </div>
            
            {/* Ramadan Mini Widget */}
            <Link to="/ramadan" className="block group">
              <div className="bg-indigo-900 rounded-[2rem] p-6 relative overflow-hidden shadow-lg border border-indigo-700 transition-transform hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                <div className="relative z-10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <Moon className="text-amber-400 fill-amber-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">رمضان</h3>
                      <p className="text-indigo-200 text-xs">ختمتك: {ramadanKhatmaProgress} جزء</p>
                    </div>
                  </div>
                  <ChevronLeft className="text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
         </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className={`bg-white dark:bg-dark-800 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow`}>
    <div className={`text-${color}-500 mb-3 bg-${color}-50 dark:bg-transparent w-fit p-2 rounded-xl`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <div>
      <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</h4>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{label}</p>
    </div>
  </div>
);