import React, { useState, useEffect } from 'react';
import { List, X, Download, RefreshCw, Search, ArrowRight } from 'lucide-react';
import { getProfile, saveQuranBookmark } from '../services/storage';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const SURAH_NAMES = [
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

export const FullQuran: React.FC = () => {
  const { showToast } = useToast();
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(1);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    try {
      const profile = getProfile();
      if (profile && typeof profile.quranBookmark === 'number' && profile.quranBookmark > 0) {
        setCurrentSurahNum(profile.quranBookmark);
      }
    } catch (e) {
      console.error("Error loading profile", e);
    }
  }, []);

  const handleSurahSelect = (index: number) => {
    const surahNum = index + 1;
    setCurrentSurahNum(surahNum);
    setShowMenu(false);
    setRetryCount(0);
    saveQuranBookmark(surahNum);
    showToast(`تم الانتقال لسورة ${SURAH_NAMES[index]}`, 'success');
  };

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    showToast('جاري تحديث الملف...', 'info');
  };

  const safeSurahIndex = Math.max(0, Math.min(113, (currentSurahNum || 1) - 1));
  const surahName = SURAH_NAMES[safeSurahIndex] || "سورة";

  const filteredSurahs = SURAH_NAMES.map((name, index) => ({ name, index }))
    .filter(item => item.name.includes(searchQuery));

  // تحويل الرقم إلى صيغة 001, 002, ...
  const paddedSurahNum = String(currentSurahNum).padStart(3, '0');
  const fileUrl = `/quran/${paddedSurahNum}.pdf`;
  const viewerUrl = `${fileUrl}?t=${Date.now()}_${retryCount}#view=FitH&toolbar=0&navpanes=0`;

  return (
    <div className="flex flex-col h-full w-full bg-[#fdfbf7] dark:bg-[#151515] overflow-hidden absolute inset-0 z-50">
      
      {/* Top Bar */}
      <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-4 py-3 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-2">
            <Link to="/" className="p-2 -mr-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
               <X size={24} />
            </Link>
            <button 
              onClick={() => setShowMenu(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-dark-800 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
               <List size={20} />
               <span className="text-base font-bold">{surahName}</span>
            </button>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2 bg-gray-100 dark:bg-dark-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-dark-700 transition-colors"
              title="تحديث الصفحة"
            >
               <RefreshCw size={20} />
            </button>
            <a 
              href={fileUrl}
              download={`${paddedSurahNum}-${surahName}.pdf`}
              className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              title="تحميل السورة"
            >
               <Download size={20} />
            </a>
         </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-gray-900">
         <iframe 
           key={`${currentSurahNum}-${retryCount}`}
           src={viewerUrl}
           className="w-full h-full border-none"
           title="Quran PDF"
         />
      </div>

      {/* Side Menu */}
      {showMenu && (
        <div className="absolute inset-0 z-[60] flex">
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
             onClick={() => setShowMenu(false)}
           ></div>
           
           <div className="relative w-80 bg-white dark:bg-dark-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">فهرس السور</h3>
                 <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors bg-white dark:bg-dark-700 shadow-sm">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-3 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-gray-800">
                 <div className="relative">
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="ابحث عن سورة..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-dark-800 p-2 pr-9 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                 {filteredSurahs.map((item) => (
                   <button
                     key={item.index}
                     onClick={() => handleSurahSelect(item.index)}
                     className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-colors ${
                        (currentSurahNum - 1) === item.index 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                     }`}
                   >
                      <div className="flex items-center gap-3">
                         <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-800 flex items-center justify-center text-xs font-mono border border-gray-200 dark:border-gray-700">
                            {String(item.index + 1).padStart(3, '0')}
                         </span>
                         <span className="text-sm">{item.name}</span>
                      </div>
                      {(currentSurahNum - 1) === item.index && <ArrowRight size={14} />}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};