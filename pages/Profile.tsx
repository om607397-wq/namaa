import React, { useEffect, useState, useRef } from 'react';
import { getProfile, getTotalTasbeeh, getStudySessions, updateProfile } from '../services/storage';
import { UserProfile } from '../types';
import { Medal, Award, Zap, Crown, Flame, BookOpen, Moon, Edit, Upload, Check, Camera, User } from 'lucide-react';

interface Badge {
  id: string;
  label: string;
  icon: any;
  desc: string;
  condition: (data: any) => boolean;
  color: string;
}

// Creative Presets using DiceBear API
const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Milo',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Lilly',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Leo',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy',
];

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Data for checks
  const [totalTasbeeh, setTotalTasbeeh] = useState(0);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const p = getProfile();
    setProfile(p);
    setEditName(p.name);
    setTotalTasbeeh(getTotalTasbeeh());
    
    const sessions = getStudySessions();
    setTotalStudyMinutes(sessions.reduce((acc, s) => acc + s.durationMinutes, 0));

    checkBadges(p, sessions);
  };

  const checkBadges = (p: UserProfile, sessions: any[]) => {
    const unlocked = BADGES.filter(b => {
      if (b.id === 'study_hero') return sessions.reduce((acc: number, s: any) => acc + s.durationMinutes, 0) >= 600;
      if (b.id === 'dhikr_lover') return getTotalTasbeeh() >= 1000;
      return b.condition(p);
    }).map(b => b.id);
    
    setUnlockedBadges(unlocked);
  };

  const handleSave = () => {
    if (profile) {
      const updated = { ...profile, name: editName };
      updateProfile(updated);
      setProfile(updated);
      setIsEditing(false);
    }
  };

  const handleAvatarSelect = (url: string) => {
    if (profile) {
      const updated = { ...profile, avatar: url };
      updateProfile(updated);
      setProfile(updated);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updated = { ...profile, avatar: base64String };
        updateProfile(updated);
        setProfile(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const BADGES: Badge[] = [
    {
       id: 'streak_3',
       label: 'بداية الالتزام',
       icon: Flame,
       desc: 'الحفاظ على الستريك لمدة 3 أيام',
       condition: (p) => p.streak >= 3,
       color: 'text-orange-500 bg-orange-50 border-orange-200'
    },
    {
       id: 'streak_7',
       label: 'أسبوع ناري',
       icon: Zap,
       desc: 'الحفاظ على الستريك لمدة 7 أيام',
       condition: (p) => p.streak >= 7,
       color: 'text-yellow-500 bg-yellow-50 border-yellow-200'
    },
    {
       id: 'study_hero',
       label: 'دودة كتب',
       icon: BookOpen,
       desc: 'مذاكرة أكثر من 10 ساعات إجمالياً',
       condition: () => totalStudyMinutes >= 600,
       color: 'text-blue-500 bg-blue-50 border-blue-200'
    },
    {
       id: 'dhikr_lover',
       label: 'الذاكر',
       icon: Moon,
       desc: 'تسبيح أكثر من 1000 مرة',
       condition: () => totalTasbeeh >= 1000,
       color: 'text-purple-500 bg-purple-50 border-purple-200'
    },
    {
       id: 'legend',
       label: 'الأسطورة',
       icon: Crown,
       desc: 'الحفاظ على الستريك لمدة 30 يوم',
       condition: (p) => p.streak >= 30,
       color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
    }
  ];

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
       
       {/* Header Profile Section */}
       <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </div>
          
          <div className="px-8 pb-8 -mt-16 text-center relative z-10">
             
             {/* Avatar Area */}
             <div className="relative w-32 h-32 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full border-4 border-white dark:border-dark-800 shadow-xl overflow-hidden bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
                   {profile.avatar ? (
                     <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <User size={48} className="text-gray-400" />
                   )}
                </div>
                
                {/* Edit Button overlay */}
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute bottom-0 right-0 p-2 bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
             </div>
             
             {/* Name Display/Edit */}
             <div className="mb-2 flex items-center justify-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border-b-2 border-emerald-500 bg-transparent text-center font-bold text-2xl outline-none text-gray-800 dark:text-white pb-1 w-48"
                      autoFocus
                    />
                    <button onClick={handleSave} className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600">
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-3xl font-black text-gray-800 dark:text-white">{profile.name}</h2>
                )}
             </div>

             <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                <Flame size={18} className="text-orange-500" />
                <span>{profile.streak} يوم متواصل</span>
             </div>

             {/* Avatar Selection Panel (Visible only when editing) */}
             {isEditing && (
               <div className="mt-8 p-6 bg-gray-50 dark:bg-dark-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4">اختر صورة شخصية</h3>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                     {/* Upload Button */}
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
                     >
                        <Camera size={20} />
                        <span className="text-[10px]">رفع</span>
                     </button>
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*" 
                       onChange={handleFileUpload}
                     />

                     {/* Presets */}
                     {AVATAR_PRESETS.map((url, idx) => (
                       <button 
                         key={idx}
                         onClick={() => handleAvatarSelect(url)}
                         className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${profile.avatar === url ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent hover:border-gray-300'}`}
                       >
                         <img src={url} alt={`Avatar ${idx}`} className="w-full h-full" />
                       </button>
                     ))}
                  </div>
               </div>
             )}
          </div>
       </div>

       {/* Badges Grid */}
       <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Medal className="text-emerald-600" /> لوحة الشرف
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {BADGES.map(badge => {
               const isUnlocked = unlockedBadges.includes(badge.id);
               return (
                 <div 
                   key={badge.id}
                   className={`p-6 rounded-2xl border-2 transition-all ${
                     isUnlocked 
                       ? `bg-white dark:bg-dark-800 ${badge.color}` 
                       : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-gray-700 opacity-60 grayscale'
                   }`}
                 >
                    <div className="flex items-start justify-between mb-4">
                       <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-white/50' : 'bg-gray-200 dark:bg-dark-700'}`}>
                          <badge.icon size={24} />
                       </div>
                       {isUnlocked ? <Award className="text-emerald-500" /> : <div className="text-xs font-bold bg-gray-200 dark:bg-dark-700 px-2 py-1 rounded">مقفل</div>}
                    </div>
                    <h4 className="font-bold text-lg mb-1">{badge.label}</h4>
                    <p className="text-xs opacity-80">{badge.desc}</p>
                 </div>
               );
             })}
          </div>
       </div>
    </div>
  );
};