import React, { useState, useEffect } from 'react';
import { getScreenTimeLog, saveScreenTimeLog, getTodayKey } from '../services/storage';
import { Smartphone, Check, AlertTriangle } from 'lucide-react';

export const ScreenTime: React.FC = () => {
  const [limit, setLimit] = useState<number>(60);
  const [usage, setUsage] = useState<number>(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const todayLog = getScreenTimeLog(getTodayKey());
    setLimit(todayLog.limitMinutes);
    setUsage(todayLog.usageMinutes);
  }, []);

  const handleSave = () => {
    saveScreenTimeLog({
      date: getTodayKey(),
      limitMinutes: limit,
      usageMinutes: usage
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remaining = limit - usage;
  const percentage = Math.min((usage / limit) * 100, 100);
  
  // Status Logic
  let statusColor = "bg-emerald-500";
  let statusText = "أداء ممتاز 👏";
  let statusSub = "أنت مسيطر، حافظ على تركيزك.";

  if (usage > limit) {
    statusColor = "bg-red-500";
    statusText = "تجاوزت الحد ⚠️";
    statusSub = "حاول تقليل استخدامك غدًا.";
  } else if (usage > limit * 0.8) {
    statusColor = "bg-orange-500";
    statusText = "انتبه، اقتربت 📉";
    statusSub = "باقي القليل، استخدمه بحكمة.";
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
           <Smartphone className="text-indigo-600" />
           إدارة الموبايل
         </h2>
         <p className="text-gray-500">نحن من نتحكم في أجهزتنا، وليست هي من تتحكم بنا.</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
         <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
            {/* Simple Circular Progress representation */}
            <div className="absolute inset-0 rounded-full border-[12px] border-gray-100"></div>
            <div 
              className={`absolute inset-0 rounded-full border-[12px] border-transparent border-t-${statusColor.split('-')[1]}-500 border-l-${statusColor.split('-')[1]}-500 transition-all duration-1000`}
              style={{ transform: `rotate(${45 + (percentage * 3.6)}deg)` }}
            ></div>
            <div className="text-center z-10">
               <h3 className="text-4xl font-bold text-gray-800">{usage}</h3>
               <p className="text-gray-400 text-sm">من أصل {limit} دقيقة</p>
            </div>
         </div>
         
         <div className={`inline-block px-4 py-2 rounded-full ${statusColor} text-white font-bold mb-2`}>
           {statusText}
         </div>
         <p className="text-gray-500">{statusSub}</p>
      </div>

      {/* Inputs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">الوقت المسموح (دقائق)</label>
            <input 
              type="number"
              className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-center text-lg font-bold"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
         </div>
         <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">استخدام اليوم الفعلي</label>
            <input 
              type="number"
              className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-center text-lg font-bold"
              value={usage}
              onChange={(e) => setUsage(Number(e.target.value))}
            />
         </div>
      </div>

      <button 
        onClick={handleSave}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {saved ? <>تم التحديث <Check /></> : 'تحديث البيانات'}
      </button>
      
      {/* Alert for awareness */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl text-indigo-800 text-sm">
         <AlertTriangle size={20} className="shrink-0 mt-0.5" />
         <p>
           <strong>نصيحة:</strong> قم بمراجعة "Digital Wellbeing" أو "مدة استخدام الجهاز" في إعدادات هاتفك للحصول على الرقم الدقيق.
         </p>
      </div>
    </div>
  );
};