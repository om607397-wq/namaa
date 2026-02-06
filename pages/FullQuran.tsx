import React, { useState, useEffect, useRef } from 'react';
import { QuranChapter, QuranVerse } from '../types';
import { 
  ChevronLeft, ChevronRight, BookOpen, Loader2, 
  Menu, X, Search, Bookmark, Flower2, BookmarkCheck, ArrowRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { saveQuranBookmark, getProfile } from '../services/storage';

// API Configuration
const BASE_URL = 'https://api.quran.com/api/v4';

export const FullQuran: React.FC = () => {
  const { showToast } = useToast();
  
  // State
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [tafsirs, setTafsirs] = useState<any[]>([]);
  
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkPage, setBookmarkPage] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load Initial Data
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chapters?language=ar`);
        const data = await res.json();
        setChapters(data.chapters);
      } catch (err) {
        console.error(err);
      }
    };
    
    const profile = getProfile();
    if (profile.quranBookmark) {
      setBookmarkPage(profile.quranBookmark);
      // Optional: Load bookmark on start? 
      // setCurrentPage(profile.quranBookmark); 
      // User requested a button to go to it, so we stick to page 1 or last session unless clicked.
      if (!profile.lastCompletedDate) {
         setCurrentPage(profile.quranBookmark);
      }
    }

    fetchChapters();
  }, []);

  // Fetch Page Content
  useEffect(() => {
    const fetchPage = async () => {
      setLoadingPage(true);
      try {
        const versesRes = await fetch(`${BASE_URL}/quran/verses/uthmani?page_number=${currentPage}&words=false`);
        const versesData = await versesRes.json();
        setVerses(versesData.verses);

        if (isTafsirOpen) {
          fetchTafsir(currentPage);
        }
        
        // Reset scroll to top when page changes
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }

      } catch (err) {
        console.error(err);
        showToast('تعذر تحميل الصفحة', 'error');
      } finally {
        setLoadingPage(false);
      }
    };

    fetchPage();
  }, [currentPage]);

  // Fetch Tafsir when toggled
  useEffect(() => {
    if (isTafsirOpen) {
      fetchTafsir(currentPage);
    }
  }, [isTafsirOpen, currentPage]);

  const fetchTafsir = async (page: number) => {
    setLoadingTafsir(true);
    try {
      // Used ID 169 for Tafsir Muyassar which is more reliable than the slug
      const res = await fetch(`${BASE_URL}/quran/tafsirs/169?page_number=${page}`);
      
      if (!res.ok) throw new Error('Network response was not ok');
      
      const data = await res.json();
      setTafsirs(data.tafsirs);
    } catch (e) {
      console.error(e);
      showToast('تعذر تحميل التفسير', 'error');
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= 604) {
      setCurrentPage(newPage);
    }
  };

  const handleSurahSelect = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setIsSidebarOpen(false);
  };

  const handleSaveBookmark = () => {
    saveQuranBookmark(currentPage);
    setBookmarkPage(currentPage);
    showToast(`تم حفظ العلامة عند صفحة ${currentPage}`, 'success');
  };

  const handleGoToBookmark = () => {
    if (bookmarkPage > 0) {
      setCurrentPage(bookmarkPage);
      showToast(`تم الانتقال للعلامة: صفحة ${bookmarkPage}`, 'info');
    } else {
      showToast('لا توجد علامة محفوظة بعد', 'error');
    }
  };

  const getSurahName = (id: number) => {
    return chapters.find(c => c.id === id)?.name_arabic || '';
  };

  const renderPageContent = () => {
    if (loadingPage) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-600 min-h-[400px]">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p>جاري تحميل الصفحة {currentPage}...</p>
        </div>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastChapterId = -1;

    verses.forEach((verse, idx) => {
      const [chapterIdStr, verseNumStr] = verse.verse_key.split(':');
      const chapterId = parseInt(chapterIdStr);
      const verseNum = parseInt(verseNumStr);

      if (chapterId !== lastChapterId) {
        if (lastChapterId !== -1) {
           elements.push(<div key={`sep-${idx}`} className="my-6 border-b-2 border-emerald-500/10 w-3/4 mx-auto"></div>);
        }
        
        // Header styling (Consistent with App Theme)
        elements.push(
          <div key={`head-${chapterId}`} className="w-full my-8 text-center relative group">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/20 -z-10"></div>
             <div className="inline-block bg-gray-50 dark:bg-dark-900 px-8 py-2 border border-emerald-500/20 rounded-full shadow-sm">
                <h2 className="font-kufi font-bold text-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-3 justify-center">
                  <Flower2 className="text-emerald-500" size={18} />
                  سورة {getSurahName(chapterId)}
                  <Flower2 className="text-emerald-500" size={18} />
                </h2>
             </div>
             
             {verseNum === 1 && chapterId !== 1 && chapterId !== 9 && (
                <div className="mt-5 mb-2 font-amiri text-xl text-emerald-600/80 dark:text-emerald-400/80">
                   بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </div>
             )}
          </div>
        );
        lastChapterId = chapterId;
      }

      elements.push(
        <span key={verse.id} className="inline leading-[2.6] md:leading-[3.2] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors px-0.5">
           <span className="text-gray-900 dark:text-gray-100 text-[22px] md:text-[28px] font-amiri">
             {verse.text_uthmani}
           </span>
           <span className="inline-flex items-center justify-center w-8 h-8 mx-1 align-middle bg-[url('https://upload.wikimedia.org/wikipedia/commons/6/68/Aya-symbol.png')] bg-contain bg-no-repeat bg-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 pt-1 select-none">
              {verseNum.toLocaleString('ar-EG')}
           </span>
        </span>
      );
    });

    return (
      <div className="text-justify px-1" dir="rtl" style={{ textAlignLast: 'center' }}>
        {elements}
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-dark-950 overflow-hidden relative transition-colors duration-300">
      
      {/* 1. Header Toolbar (Standard App Colors) */}
      <div className="bg-white dark:bg-dark-900 p-3 md:p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shadow-sm z-30 shrink-0">
         <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
            >
               <Menu size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex flex-col">
               <span className="font-bold text-gray-800 dark:text-white text-sm md:text-base">
                  المصحف الشريف
               </span>
               <span className="text-[10px] text-gray-500 font-mono">صفحة {currentPage}</span>
            </div>
         </div>

         <div className="flex items-center gap-2">
            {/* Go to Bookmark Button */}
            {bookmarkPage > 0 && bookmarkPage !== currentPage && (
               <button 
                  onClick={handleGoToBookmark}
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  title={`الذهاب للعلامة (ص ${bookmarkPage})`}
               >
                  <BookmarkCheck size={16} />
                  <span>الذهاب للعلامة</span>
               </button>
            )}
            
            {/* Mobile Bookmark Jump (Icon Only) */}
            {bookmarkPage > 0 && bookmarkPage !== currentPage && (
               <button 
                  onClick={handleGoToBookmark}
                  className="md:hidden p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl"
               >
                  <BookmarkCheck size={20} />
               </button>
            )}

            <button 
               onClick={handleSaveBookmark}
               className={`p-2 rounded-xl transition-all ${
                  currentPage === bookmarkPage 
                     ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' 
                     : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
               }`}
               title={currentPage === bookmarkPage ? "العلامة محفوظة هنا" : "حفظ العلامة"}
            >
               <Bookmark size={22} fill={currentPage === bookmarkPage ? "currentColor" : "none"} />
            </button>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <button 
               onClick={() => setIsTafsirOpen(!isTafsirOpen)}
               className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                 isTafsirOpen 
                   ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                   : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200'
               }`}
            >
               <BookOpen size={18} />
               <span className="hidden md:inline">التفسير</span>
            </button>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
         
         {/* 2. Sidebar (Index) */}
         <div className={`
            absolute top-0 right-0 h-full bg-white dark:bg-dark-900 border-l border-gray-100 dark:border-gray-800 z-40 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col w-80
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
         `}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-950">
               <h3 className="font-bold text-gray-800 dark:text-white">فهرس السور</h3>
               <button onClick={() => setIsSidebarOpen(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-3">
               <div className="relative">
                  <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="ابحث..."
                    className="w-full bg-gray-100 dark:bg-dark-800 rounded-lg py-2 pr-9 pl-3 text-sm outline-none dark:text-white border border-transparent focus:border-emerald-500 transition-colors"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
               {chapters.filter(c => c.name_arabic.includes(searchQuery)).map(c => (
                   <button 
                     key={c.id}
                     onClick={() => handleSurahSelect(c.pages[0])}
                     className="w-full flex items-center justify-between p-3 mb-1 hover:bg-emerald-50 dark:hover:bg-dark-800 rounded-xl transition-colors group"
                   >
                      <div className="flex items-center gap-3">
                         <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-dark-800 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-mono group-hover:border-emerald-500 group-hover:text-emerald-600 transition-colors">
                           {c.id}
                         </span>
                         <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{c.name_arabic}</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 dark:bg-dark-800 px-2 py-1 rounded text-gray-500">ص {c.pages[0]}</span>
                   </button>
               ))}
            </div>
         </div>

         {/* 3. Main Content (Scrollable) */}
         <div 
            className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-dark-950 custom-scrollbar flex justify-center"
            ref={scrollContainerRef}
         >
            {/* The Page Container */}
            <div className="w-full max-w-3xl mx-auto my-4 relative z-10 transition-all duration-300 min-h-[85vh] h-auto px-2 md:px-0">
               <div className="bg-white dark:bg-dark-900 shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-12 md:rounded-2xl">
                  
                  {/* Content */}
                  <div className="relative z-20 pb-10">
                     {renderPageContent()}
                  </div>

                  {/* Footer Page Number */}
                  <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                     <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-900/10 px-4 py-1 rounded-full">
                       {currentPage}
                     </span>
                  </div>
               </div>
               
               {/* Spacer at bottom */}
               <div className="h-10"></div>
            </div>
         </div>

         {/* 4. Tafsir Panel (Integrated Theme) */}
         {isTafsirOpen && (
            <div className="absolute left-0 top-0 h-full w-full md:w-96 bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-gray-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-left duration-300">
               <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-950 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     <BookOpen size={18} className="text-emerald-500" /> التفسير الميسر
                  </h3>
                  <button onClick={() => setIsTafsirOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-dark-900">
                  {loadingTafsir ? (
                     <div className="flex flex-col items-center justify-center h-40 gap-3 text-emerald-600">
                        <Loader2 className="animate-spin" />
                        <span className="text-sm">جاري جلب التفسير...</span>
                     </div>
                  ) : tafsirs.length > 0 ? (
                     <div className="space-y-6">
                        {tafsirs.map((t: any) => (
                           <div key={t.resource_id + t.verse_key} className="relative group">
                              <span className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded mb-2 font-mono dir-ltr font-bold">
                                 {t.verse_key}
                              </span>
                              <p className="text-sm leading-7 text-gray-700 dark:text-gray-300 text-justify border-r-4 border-emerald-500 pl-2 pr-3 bg-gray-50 dark:bg-dark-950/50 py-2 rounded-l-lg">
                                 {t.text}
                              </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-10 text-gray-400">لا يوجد تفسير متاح لهذه الصفحة.</div>
                  )}
               </div>
            </div>
         )}

      </div>

      {/* 5. Bottom Navigation */}
      <div className="bg-white dark:bg-dark-900 p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] pl-20 md:pl-24">
         <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === 604}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
         >
            <ChevronRight size={20} />
            <span className="font-bold text-sm">التالية</span>
         </button>

         {/* Range Slider - Desktop Only */}
         <div className="hidden md:flex flex-1 mx-8 items-center gap-4 bg-gray-100 dark:bg-dark-800 px-4 py-2 rounded-full">
            <span className="text-xs font-mono text-gray-400">1</span>
            <input 
               type="range" 
               min="1" 
               max="604" 
               value={currentPage} 
               onChange={(e) => setCurrentPage(Number(e.target.value))}
               className="w-full h-1.5 bg-gray-300 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-xs font-mono text-gray-400">604</span>
         </div>

         <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
         >
            <span className="font-bold text-sm">السابقة</span>
            <ChevronLeft size={20} />
         </button>
      </div>

    </div>
  );
};