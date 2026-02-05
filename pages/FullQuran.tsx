import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Menu, Search, ArrowRight, CornerDownLeft, List, X, ZoomIn, ZoomOut, AlertCircle, RefreshCw } from 'lucide-react';
import { getProfile, saveQuranBookmark } from '../services/storage';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

// --- Data: Start Page of Each Surah (1-114) ---
const SURAH_START_PAGES = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 
  221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404,
  411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518,
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568,
  570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594,
  595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 602, 602, 603, 603, 604, 604,
  604, 604, 604, 604
];

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

// Helper to find Surah based on page
const getSurahByPage = (page: number) => {
  for (let i = SURAH_START_PAGES.length - 1; i >= 0; i--) {
    if (page >= SURAH_START_PAGES[i]) {
      return { index: i, name: SURAH_NAMES[i] };
    }
  }
  return { index: 0, name: SURAH_NAMES[0] };
};

export const FullQuran: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmark, setBookmark] = useState<number | null>(null);
  const [pageInput, setPageInput] = useState('');
  
  const pageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Bookmark on init
    const profile = getProfile();
    if (profile.quranBookmark && profile.quranBookmark > 0) {
      setBookmark(profile.quranBookmark);
      setCurrentPage(profile.quranBookmark);
    }
  }, []);

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > 604) page = 604;
    setCurrentPage(page);
  };

  const handleNext = () => goToPage(currentPage + 1);
  const handlePrev = () => goToPage(currentPage - 1);

  const handleSurahSelect = (index: number) => {
    const page = SURAH_START_PAGES[index];
    goToPage(page);
    setShowMenu(false);
    showToast(`تم الانتقال لسورة ${SURAH_NAMES[index]} (صفحة ${page})`, 'success');
  };

  const saveBookmark = () => {
    // Note: Since we can't track scrolling inside PDF iframe automatically in all browsers, 
    // we save the 'currentPage' which is managed by our buttons.
    saveQuranBookmark(currentPage);
    setBookmark(currentPage);
    showToast(`تم حفظ العلامة عند صفحة ${currentPage} ✅`, 'success');
  };

  const loadBookmark = () => {
    if (bookmark) {
      goToPage(bookmark);
    } else {
      showToast('لا توجد علامة محفوظة بعد', 'info');
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      goToPage(p);
      setPageInput('');
      pageInputRef.current?.blur();
    } else {
      showToast('أدخل رقم صفحة صحيح (1-604)', 'error');
    }
  };

  const currentSurah = getSurahByPage(currentPage);
  const filteredSurahs = SURAH_NAMES.map((name, index) => ({ name, index }))
    .filter(item => item.name.includes(searchQuery));

  // #page=X works in most PDF viewers (Chrome, Edge, Firefox)
  // #view=FitH ensures it fits horizontally
  const pdfUrl = `/quran.pdf#page=${currentPage}&view=FitH`;

  return (
    <div className="flex flex-col h-full w-full bg-[#fdfbf7] dark:bg-[#151515] overflow-hidden absolute inset-0 z-50">
      
      {/* 1. COMPACT TOP BAR */}
      <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-4 py-2 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -mr-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
               <X size={20} />
            </Link>
            <button 
              onClick={() => setShowMenu(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-800 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
               <List size={18} />
               <span className="text-sm font-bold truncate max-w-[80px] sm:max-w-none">{currentSurah.name}</span>
            </button>
         </div>

         {/* Bookmark Controls */}
         <div className="flex items-center gap-2">
            <button onClick={loadBookmark} className="relative p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors" title="الذهاب للعلامة">
               <Bookmark size={20} fill={bookmark ? "currentColor" : "none"} />
               {bookmark && bookmark !== currentPage && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            <button onClick={saveBookmark} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg font-bold">
               حفظ
            </button>
         </div>
      </div>

      {/* 2. MAIN PDF VIEWER */}
      <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-900">
         <iframe 
           key={currentPage} /* Force reload when page changes to ensure jump */
           src={pdfUrl}
           className="w-full h-full border-none"
           title="Quran PDF"
         ></iframe>

         {/* Hint for user */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-0 text-center">
            <p className="text-gray-400 text-xs">إذا لم يظهر المصحف، تأكد من وضع ملف <br/> <code>quran.pdf</code> في المجلد الرئيسي</p>
         </div>
      </div>

      {/* 3. BOTTOM CONTROLS */}
      <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-4 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 z-20 flex flex-col gap-2 safe-area-bottom shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
         
         {/* Navigation Row */}
         <div className="flex items-center justify-between gap-4 max-w-md mx-auto w-full">
            <button 
               onClick={handleNext} 
               disabled={currentPage >= 604}
               className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 disabled:opacity-30 disabled:bg-gray-300 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
            >
               التالي <ChevronLeft size={20} />
            </button>

            <form onSubmit={handlePageSubmit} className="relative w-24">
               <input 
                 ref={pageInputRef}
                 type="number" 
                 className="w-full bg-gray-50 dark:bg-dark-950 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-xl py-3 px-2 text-center font-mono font-bold dark:text-white outline-none focus:border-emerald-500 focus:bg-white transition-all text-lg"
                 placeholder={String(currentPage)}
                 value={pageInput}
                 onChange={e => setPageInput(e.target.value)}
                 min="1"
                 max="604"
               />
               <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-white dark:bg-dark-900 px-1 text-gray-400 font-bold whitespace-nowrap">صفحة</span>
            </form>

            <button 
               onClick={handlePrev} 
               disabled={currentPage <= 1}
               className="flex-1 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-700 active:scale-95 disabled:opacity-30 transition-all"
            >
               <ChevronRight size={20} /> السابق
            </button>
         </div>
      </div>

      {/* 4. SIDE DRAWER MENU (Index) */}
      {showMenu && (
        <div className="absolute inset-0 z-[60] flex">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
             onClick={() => setShowMenu(false)}
           ></div>
           
           {/* Drawer */}
           <div className="relative w-80 bg-white dark:bg-dark-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">فهرس المصحف</h3>
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
                        currentSurah.index === item.index 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                     }`}
                   >
                      <div className="flex items-center gap-3">
                         <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-800 flex items-center justify-center text-xs font-mono border border-gray-200 dark:border-gray-700">
                            {item.index + 1}
                         </span>
                         <span className="text-sm">{item.name}</span>
                      </div>
                      {currentSurah.index === item.index && <ArrowRight size={14} />}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};