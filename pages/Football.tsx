import React, { useState, useEffect } from 'react';
import { 
  Trophy, Shield, User, Activity, Dumbbell, 
  CheckCircle2, AlertCircle, Star, Calendar, 
  Brain, Zap, ChevronLeft, Target, TrendingUp
} from 'lucide-react';
import { 
  getFootballProfile, saveFootballProfile, 
  getFootballLogs, getFootballLog, saveFootballLog, 
  getTodayKey, getProfile 
} from '../services/storage';
import { FootballProfile, FootballPosition, FootballTrainingLog } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const POSITIONS: { id: FootballPosition; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'GK', label: 'حارس مرمى', icon: Shield, color: 'text-yellow-500', desc: 'الحصن الأخير، يتطلب رد فعل سريع وقيادة.' },
  { id: 'DEF', label: 'مدافع', icon: Shield, color: 'text-blue-500', desc: 'صخرة الفريق، قوة بدنية وذكاء تكتيكي.' },
  { id: 'MID', label: 'خط وسط', icon: Activity, color: 'text-emerald-500', desc: 'المايسترو، لياقة عالية ورؤية للملعب.' },
  { id: 'FWD', label: 'مهاجم', icon: Trophy, color: 'text-red-500', desc: 'القناص، سرعة وإنهاء الهجمات ببراعة.' },
];

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const TIPS: Record<FootballPosition, string[]> = {
  GK: [
    "تدرب على القفزات الجانبية والمرونة يومياً.",
    "تواصل مع المدافعين بصوت عالٍ، أنت ترى الملعب كله.",
    "اعمل على رد فعلك باستخدام كرات التنس.",
    "لا تغفل عن اللعب بالقدم، الكرة الحديثة تتطلب ذلك."
  ],
  DEF: [
    "تمركزك أهم من تدخلك، اقرأ اللعب قبل حدوثه.",
    "قوِ عضلات الجذع (Core) للثبات في الالتحامات.",
    "تعلم التمرير الطويل الدقيق لبناء الهجمات.",
    "في المواجهات 1 ضد 1، راقب الكرة لا قدم اللاعب."
  ],
  MID: [
    "المسح البصري (Scanning) قبل استلام الكرة هو سر الإبداع.",
    "حافظ على لياقتك، أنت محرك الفريق الذي لا يتوقف.",
    "تدرب على الاستلام والتسليم تحت الضغط.",
    "التحرك بدون كرة يخلق مساحات لزملائك."
  ],
  FWD: [
    "الهدوء أمام المرمى هو ما يفرق بين الجيد والممتاز.",
    "تحرك دائماً في ظهر المدافعين لكسر التسلل.",
    "تدرب على الإنهاء بكلتا القدمين والرأس.",
    "الضغط العالي يبدأ من عندك، لا تكسل."
  ]
};

export const Football: React.FC = () => {
  const [profile, setProfile] = useState<FootballProfile>({ position: null, trainingDays: [], level: 1 });
  const [todayLog, setTodayLog] = useState<FootballTrainingLog>({ 
    date: getTodayKey(), 
    completed: false, 
    ratings: { physical: 0, mental: 0, technical: 0 }, 
    notes: '' 
  });
  const [logs, setLogs] = useState<Record<string, FootballTrainingLog>>({});
  const [userName, setUserName] = useState('');
  
  // Stats for Radar Chart
  const [stats, setStats] = useState([
    { subject: 'انضباط', A: 0, fullMark: 100 },
    { subject: 'بدني', A: 0, fullMark: 100 },
    { subject: 'فني', A: 0, fullMark: 100 },
    { subject: 'ذهني', A: 0, fullMark: 100 },
  ]);

  // Data for Line Chart (Evolution)
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProfile(getFootballProfile());
    setTodayLog(getFootballLog(getTodayKey()));
    const allLogs = getFootballLogs();
    setLogs(allLogs);
    setUserName(getProfile().name);
    calculateStats(allLogs);
    prepareHistoryData(allLogs);
  };

  const calculateStats = (allLogsRecord: Record<string, FootballTrainingLog>) => {
    const allLogs = Object.values(allLogsRecord);
    if (allLogs.length === 0) return;

    // Discipline: Days attended vs scheduled
    const completedCount = allLogs.filter(l => l.completed).length;
    const discipline = Math.round((completedCount / (allLogs.length || 1)) * 100) || 50; 

    // Averages (Star ratings are 1-5, mapping to 0-100)
    const avgPhysical = allLogs.reduce((acc, curr) => acc + curr.ratings.physical, 0) / (completedCount || 1) * 20;
    const avgMental = allLogs.reduce((acc, curr) => acc + curr.ratings.mental, 0) / (completedCount || 1) * 20;
    const avgTechnical = allLogs.reduce((acc, curr) => acc + curr.ratings.technical, 0) / (completedCount || 1) * 20;

    setStats([
      { subject: 'انضباط', A: discipline, fullMark: 100 },
      { subject: 'بدني', A: Math.round(avgPhysical), fullMark: 100 },
      { subject: 'فني', A: Math.round(avgTechnical), fullMark: 100 },
      { subject: 'ذهني', A: Math.round(avgMental), fullMark: 100 },
    ]);
  };

  const prepareHistoryData = (allLogsRecord: Record<string, FootballTrainingLog>) => {
    const sortedLogs = Object.values(allLogsRecord)
      .filter(l => l.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Take last 10 logs for cleanliness
    const recentLogs = sortedLogs.slice(-10);

    const data = recentLogs.map(log => ({
       date: new Date(log.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
       بدني: log.ratings.physical,
       فني: log.ratings.technical,
       ذهني: log.ratings.mental,
    }));

    setHistoryData(data);
  };

  const handlePositionSelect = (pos: FootballPosition) => {
    const newProfile = { ...profile, position: pos };
    setProfile(newProfile);
    saveFootballProfile(newProfile);
  };

  const toggleTrainingDay = (dayIndex: number) => {
    let newDays = [...profile.trainingDays];
    if (newDays.includes(dayIndex)) {
      newDays = newDays.filter(d => d !== dayIndex);
    } else {
      newDays = [...newDays, dayIndex];
    }
    const newProfile = { ...profile, trainingDays: newDays.sort() };
    setProfile(newProfile);
    saveFootballProfile(newProfile);
  };

  const handleLogUpdate = (field: keyof FootballTrainingLog | 'ratings', value: any) => {
    let updatedLog = { ...todayLog };
    
    if (field === 'ratings') {
       updatedLog.ratings = { ...todayLog.ratings, ...value };
    } else {
       // @ts-ignore
       updatedLog[field] = value;
    }
    
    setTodayLog(updatedLog);
    saveFootballLog(updatedLog);
    
    // Refresh stats
    // We need to re-fetch logs to include this update in stats if it wasn't there
    const updatedLogs = { ...logs, [updatedLog.date]: updatedLog };
    setLogs(updatedLogs);
    calculateStats(updatedLogs);
    prepareHistoryData(updatedLogs);
  };

  const currentDayIndex = new Date().getDay(); // 0 = Sunday
  const isTrainingDay = profile.trainingDays.includes(currentDayIndex);

  // --- Render: Onboarding (Select Position) ---
  if (!profile.position) {
    return (
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
             <Trophy size={48} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">اختر مركزك في الملعب</h2>
          <p className="text-gray-500 dark:text-gray-400">لنبدأ رحلة احترافك، حدد المركز الذي تلعب فيه.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => handlePositionSelect(pos.id)}
              className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 hover:shadow-xl transition-all group text-right"
            >
              <div className="flex items-center gap-4 mb-3">
                 <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-dark-700 ${pos.color} group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors`}>
                   <pos.icon size={28} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white">{pos.label}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{pos.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selectedPos = POSITIONS.find(p => p.id === profile.position);

  // --- Render: Main Dashboard ---
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Player Card Header (FIFA Style) */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white overflow-hidden shadow-2xl border border-slate-700">
         {/* Background Pitch Pattern */}
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
         <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>

         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Card Graphic */}
            <div className="relative w-32 h-44 bg-gradient-to-b from-yellow-200 to-yellow-600 rounded-t-2xl rounded-b-3xl p-1 shadow-lg shrink-0 transform hover:scale-105 transition-transform">
               <div className="w-full h-full bg-slate-900 rounded-t-xl rounded-b-2xl flex flex-col items-center justify-center border border-yellow-500/30 relative">
                  <div className="absolute top-2 left-2 text-2xl font-black text-yellow-500">99</div>
                  <div className="absolute top-8 left-3 text-xs font-bold text-yellow-500/80">{profile.position}</div>
                  <User size={48} className="text-slate-600 mb-2" />
                  <div className="text-center w-full bg-yellow-600/20 py-1 mt-auto">
                    <span className="text-xs font-bold text-yellow-100 uppercase tracking-widest">{userName.split(' ')[0] || 'PLAYER'}</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 text-center md:text-right">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full bg-white/10 text-xs font-bold ${selectedPos?.color}`}>
                    {selectedPos?.label}
                  </span>
                  {isTrainingDay && <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-bold animate-pulse">يوم تمرين</span>}
               </div>
               <h1 className="text-3xl font-black mb-2">أهلاً يا كابتن {userName} ⚽</h1>
               <p className="text-slate-300 text-sm max-w-lg">
                 "التدريب هو ما تفعله عندما لا يشاهدك أحد." استمر في العمل الشاق لتصل إلى القمة.
               </p>
            </div>

            {/* Change Pos Button */}
            <button 
              onClick={() => setProfile({ ...profile, position: null })} 
              className="absolute top-4 left-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              title="تغيير المركز"
            >
              <ChevronLeft size={20} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COLUMN: Training Log */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* 2. Today's Training */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                 <Dumbbell className="text-emerald-600" /> تمرين اليوم
               </h3>
               
               <div className="space-y-6">
                 {/* Check In */}
                 <div 
                   onClick={() => handleLogUpdate('completed', !todayLog.completed)}
                   className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                     todayLog.completed 
                       ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                       : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                   }`}
                 >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      todayLog.completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-dark-700 text-gray-400'
                    }`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <h4 className="font-bold text-lg text-gray-800 dark:text-white">تم إنجاز تمرين اليوم</h4>
                       <p className="text-xs text-gray-500">اضغط لتأكيد الحضور والالتزام</p>
                    </div>
                 </div>

                 {/* Ratings (Only show if completed) */}
                 {todayLog.completed && (
                   <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                      <p className="text-sm font-bold text-gray-500">كيف كان مستواك؟ (قيم نفسك بصدق)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <RatingBox 
                            label="بدنياً" 
                            icon={<Zap size={16} />} 
                            color="text-yellow-500"
                            value={todayLog.ratings.physical} 
                            onChange={(v) => handleLogUpdate('ratings', { physical: v })} 
                         />
                         <RatingBox 
                            label="ذهنياً" 
                            icon={<Brain size={16} />} 
                            color="text-blue-500"
                            value={todayLog.ratings.mental} 
                            onChange={(v) => handleLogUpdate('ratings', { mental: v })} 
                         />
                         <RatingBox 
                            label="فنيا/مهاريا" 
                            icon={<Star size={16} />} 
                            color="text-purple-500"
                            value={todayLog.ratings.technical} 
                            onChange={(v) => handleLogUpdate('ratings', { technical: v })} 
                         />
                      </div>
                      
                      <textarea 
                        className="w-full bg-gray-50 dark:bg-dark-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm dark:text-white"
                        placeholder="ملاحظات فنية: (مثلاً: ركزت اليوم على العرضيات، احتاج لتحسين التمركز...)"
                        rows={3}
                        value={todayLog.notes}
                        onChange={(e) => handleLogUpdate('notes', e.target.value)}
                      />
                   </div>
                 )}
               </div>
            </div>

            {/* 3. Schedule Settings */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                 <Calendar className="text-blue-500" size={20} /> جدول التمارين الأسبوعي
               </h3>
               <p className="text-xs text-gray-400 mb-4">حدد الأيام التي لديك فيها تمرين (نادي أو فردي) ليتم تذكيرك.</p>
               
               <div className="flex flex-wrap gap-2">
                 {WEEKDAYS.map((day, idx) => (
                   <button
                     key={day}
                     onClick={() => toggleTrainingDay(idx)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                       profile.trainingDays.includes(idx)
                         ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                         : 'bg-gray-50 dark:bg-dark-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                     }`}
                   >
                     {day}
                   </button>
                 ))}
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Stats & Tips */}
         <div className="space-y-6">
            
            {/* 4. Radar Chart (Stats) */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 w-full text-right flex items-center gap-2">
                 <Activity className="text-orange-500" size={20} /> تحليل المستوى
               </h3>
               
               <div className="w-full h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Player"
                        dataKey="A"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  
                  {/* Overlay Center Score */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                     <span className="text-xs font-bold text-gray-400 block">معدل</span>
                     <span className="text-xl font-black text-emerald-600">{Math.round(stats.reduce((a,b) => a + b.A, 0) / 4)}</span>
                  </div>
               </div>
            </div>

            {/* 5. Evolution Chart (Line Chart) */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 w-full text-right flex items-center gap-2">
                 <TrendingUp className="text-blue-500" size={20} /> تطور الأداء
               </h3>
               
               {historyData.length > 1 ? (
                 <div className="w-full h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" />
                         <YAxis domain={[0, 5]} hide />
                         <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '12px'}}
                         />
                         <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                         <Line type="monotone" dataKey="بدني" stroke="#eab308" strokeWidth={2} dot={{r: 2}} />
                         <Line type="monotone" dataKey="فني" stroke="#a855f7" strokeWidth={2} dot={{r: 2}} />
                         <Line type="monotone" dataKey="ذهني" stroke="#3b82f6" strokeWidth={2} dot={{r: 2}} />
                      </LineChart>
                   </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-400 text-xs">
                   سجل المزيد من التمارين ليظهر الرسم البياني
                 </div>
               )}
            </div>

            {/* 6. Smart Tips */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
               <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                 <Target size={20} /> نصائح لمركزك ({selectedPos?.label})
               </h3>
               <ul className="space-y-3">
                 {TIPS[profile.position].map((tip, idx) => (
                   <li key={idx} className="flex gap-3 text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      {tip}
                   </li>
                 ))}
               </ul>
            </div>

         </div>
      </div>
    </div>
  );
};

const RatingBox: React.FC<{ 
  label: string, icon: any, value: number, onChange: (v: number) => void, color: string 
}> = ({ label, icon, value, onChange, color }) => (
  <div className="bg-gray-50 dark:bg-dark-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
    <div className={`flex items-center justify-center gap-1 text-xs font-bold mb-2 ${color}`}>
       {icon} {label}
    </div>
    <div className="flex justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`transition-transform hover:scale-110 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <Star size={18} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  </div>
);
