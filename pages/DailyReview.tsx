import React, { useState, useEffect } from 'react';
import { DailyReview as IDailyReview } from '../types';
import { getDailyReview, saveDailyReview, getTodayKey } from '../services/storage';
import { Save, Calendar } from 'lucide-react';

export const DailyReview: React.FC = () => {
  const [review, setReview] = useState<IDailyReview>({
    date: getTodayKey(),
    best: '',
    worst: '',
    improve: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getDailyReview(getTodayKey());
    if (existing) {
      setReview(existing);
      setSaved(true);
    }
  }, []);

  const handleChange = (field: keyof IDailyReview, value: string) => {
    setReview(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveDailyReview(review);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">وقفة مع النفس</h2>
          <p className="text-gray-500">دقائق قليلة للتقييم تصنع فرقاً كبيراً في الغد.</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
          <Calendar size={18} />
          {new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>

      <div className="space-y-6">
        <QuestionCard 
          emoji="🌟"
          title="ما أفضل شيء قمت به اليوم؟" 
          placeholder="إنجاز صغير، صلاة خاشعة، مساعدة أحد..."
          value={review.best}
          onChange={v => handleChange('best', v)}
        />
        
        <QuestionCard 
          emoji="📉"
          title="ما أسوأ شيء حصل أو فعلته؟" 
          placeholder="تضييع وقت، عصبية، تقصير..."
          value={review.worst}
          onChange={v => handleChange('worst', v)}
        />

        <QuestionCard 
          emoji="🚀"
          title="كيف أجعل الغد أفضل؟" 
          placeholder="خطوة عملية واحدة..."
          value={review.improve}
          onChange={v => handleChange('improve', v)}
        />

        <button 
          onClick={handleSave}
          disabled={saved}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            saved 
            ? 'bg-emerald-100 text-emerald-700 cursor-default' 
            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {saved ? 'تم الحفظ بنجاح' : <><Save /> حفظ اليوميات</>}
        </button>
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{ 
  emoji: string, 
  title: string, 
  placeholder: string, 
  value: string, 
  onChange: (v: string) => void 
}> = ({ emoji, title, placeholder, value, onChange }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-100">
    <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
      <span className="bg-gray-50 p-2 rounded-lg text-2xl">{emoji}</span>
      {title}
    </label>
    <textarea 
      className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none resize-none text-gray-700 placeholder-gray-400 min-h-[100px]"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);