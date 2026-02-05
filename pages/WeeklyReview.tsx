import React, { useState } from 'react';
import { WeeklyReview as IWeeklyReview } from '../types';
import { saveWeeklyReview, getTodayKey } from '../services/storage';
import { Trophy, Target, AlertCircle } from 'lucide-react';

export const WeeklyReview: React.FC = () => {
  const [review, setReview] = useState<IWeeklyReview>({
    weekStartDate: getTodayKey(), // In a real app, calculate actual week start
    achievement: '',
    shortcoming: '',
    nextGoal: ''
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveWeeklyReview(review);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">الحصاد الأسبوعي</h2>
        <p className="text-gray-500">لحظة صدق لتقييم المسار وتعديل البوصلة</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
        <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <Trophy className="text-indigo-600" />
          أكبر إنجاز هذا الأسبوع
        </h3>
        <textarea 
          className="w-full bg-white/60 p-4 rounded-xl outline-none text-indigo-900 placeholder-indigo-300"
          placeholder="ما الشيء الذي تفخر بإنجازه؟"
          rows={3}
          value={review.achievement}
          onChange={e => setReview({...review, achievement: e.target.value})}
        />
      </div>

      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          أكبر تقصير / عائق
        </h3>
        <textarea 
          className="w-full bg-white/60 p-4 rounded-xl outline-none text-red-900 placeholder-red-300"
          placeholder="ما الذي عطلك أو لم تنجزه كما يجب؟"
          rows={3}
          value={review.shortcoming}
          onChange={e => setReview({...review, shortcoming: e.target.value})}
        />
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
        <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <Target className="text-emerald-600" />
          الهدف الأهم للأسبوع القادم
        </h3>
        <input 
          className="w-full bg-white/60 p-4 rounded-xl outline-none text-emerald-900 placeholder-emerald-300 font-bold text-lg"
          placeholder="اكتب هدفاً واحداً واضحاً..."
          value={review.nextGoal}
          onChange={e => setReview({...review, nextGoal: e.target.value})}
        />
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
      >
        {saved ? 'تم الحفظ' : 'حفظ التقييم الأسبوعي'}
      </button>
    </div>
  );
};