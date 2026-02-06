
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Star, Trophy, Moon, MessageCircle, BookOpen, Focus, Book, 
  HeartPulse, Wallet, Smartphone, Loader2, CalendarCheck, CheckCircle2, ArrowRight, CalendarDays
} from 'lucide-react';
import { FeatureId } from '../types';
import { saveEnabledFeatures, getEnabledFeatures } from '../services/storage';

const { useNavigate } = ReactRouterDOM;

const FEATURES: { id: FeatureId; label: string; icon: any; desc: string; color: string }[] = [
  { id: 'ramadan', label: 'رمضان', icon: Star, desc: 'عداد، ختمة، وعبادات', color: 'bg-amber-500' },
  { id: 'prayers', label: 'الصلوات', icon: Moon, desc: 'مواقيت وسجل متابعة', color: 'bg-indigo-600' },
  { id: 'quran', label: 'القرآن', icon: Book, desc: 'ورد يومي وتصفح المصحف', color: 'bg-emerald-600' },
  { id: 'adhkar', label: 'الأذكار', icon: MessageCircle, desc: 'حصن المسلم', color: 'bg-teal-500' },
  { id: 'football', label: 'كرة القدم', icon: Trophy, desc: 'سجل التمارين والتطور', color: 'bg-blue-600' },
  { id: 'study', label: 'المذاكرة', icon: BookOpen, desc: 'مؤقت بومودورو وسجل', color: 'bg-violet-600' },
  { id: 'focus', label: 'التركيز', icon: Focus, desc: 'قائمة أهم 3 مهام', color: 'bg-red-500' },
  { id: 'habits', label: 'العادات', icon: HeartPulse, desc: 'متتبع العادات والماء', color: 'bg-rose-500' },
  { id: 'finance', label: 'المصروف', icon: Wallet, desc: 'متابعة الميزانية', color: 'bg-green-600' },
  { id: 'screentime', label: 'موبايلي', icon: Smartphone, desc: 'التحكم في استخدام الهاتف', color: 'bg-slate-600' },
  { id: 'tasbeeh', label: 'السبحة', icon: Loader2, desc: 'عداد أذكار بسيط', color: 'bg-cyan-600' },
  { id: 'journaling', label: 'اليوميات', icon: CalendarCheck, desc: 'تقييم يومي وأسبوعي', color: 'bg-orange-500' },
  { id: 'history', label: 'السجل', icon: CalendarDays, desc: 'تقويم الإنجاز السابق', color: 'bg-gray-500' }, // Added History
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<FeatureId[]>([]);

  useEffect(() => {
    // Load existing selection if editing
    const current = getEnabledFeatures();
    if (current) setSelected(current);
    else setSelected(['prayers', 'quran', 'habits', 'history']); // Default
  }, []);

  const toggleFeature = (id: FeatureId) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(f => f !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    saveEnabledFeatures(selected);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
        
        {/* Header */}
        <div className="text-center space-y-4">
           <h1 className="text-4xl font-black text-gray-900 dark:text-white">صمم مساحتك الخاصة 🎨</h1>
           <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
             نماء تطبيق مرن. اختر الأدوات التي تحتاجها فقط ليكون التطبيق بسيطاً ومركزاً على أهدافك.
           </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => {
            const isSelected = selected.includes(feature.id);
            return (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-right group ${
                  isSelected 
                    ? 'border-emerald-500 bg-white dark:bg-dark-800 shadow-xl scale-[1.02]' 
                    : 'border-transparent bg-white dark:bg-dark-900 shadow-sm hover:bg-gray-50 dark:hover:bg-dark-800 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                   <div className={`p-3 rounded-xl text-white ${feature.color} shadow-md`}>
                      <feature.icon size={24} />
                   </div>
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                     isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 dark:border-gray-700'
                   }`}>
                     {isSelected && <CheckCircle2 size={14} className="text-white" />}
                   </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{feature.label}</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">{feature.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Action */}
        <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none">
           <button 
             onClick={handleSave}
             disabled={selected.length === 0}
             className="pointer-events-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
           >
             حفظ ومتابعة <ArrowRight size={20} className="rotate-180" />
           </button>
        </div>

      </div>
    </div>
  );
};