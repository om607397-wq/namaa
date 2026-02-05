import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, FileText, RefreshCw, ExternalLink, Download, AlertCircle } from 'lucide-react';

const TITLES: Record<string, string> = {
  'morning': 'أذكار الصباح',
  'evening': 'أذكار المساء',
  'post_prayer': 'أذكار بعد الصلاة',
  'sleep': 'أذكار النوم',
  'waking': 'أذكار الاستيقاظ',
  'home_enter': 'أذكار دخول المنزل',
  'home_exit': 'أذكار الخروج من المنزل',
  'bathroom_enter': 'أذكار دخول الخلاء',
  'bathroom_exit': 'أذكار الخروج من الخلاء',
  'food': 'أذكار الطعام',
  'clothes': 'أذكار اللباس',
  'travel': 'أذكار الركوب والسفر',
  'rain': 'أذكار المطر',
  'wind': 'أذكار الرياح',
  'fear': 'أذكار الخوف',
  'relief': 'أذكار تفريج الهم',
  'provision': 'أذكار الرزق',
  'istighfar': 'أذكار الاستغفار',
  'tasbeeh': 'أذكار التسبيح والتهليل',
  'salawat': 'أذكار الصلاة على النبي ﷺ',
  'general': 'أذكار الذكر المطلق',
  'illness': 'أذكار المرض',
  'anger': 'أذكار الغضب',
  'istikhara': 'أذكار الاستخارة',
  'distress': 'أذكار الكرب',
  'gratitude': 'أذكار الشكر',
  'dua': 'أذكار الدعاء'
};

export const ViewAdhkar: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const title = TITLES[type || ''] || 'الأذكار';
  const pdfUrl = `/adhkar/${type}.pdf`;
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in gap-4 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20">
         <div className="flex items-center gap-2">
            <Link to="/adhkar" className="p-2 bg-gray-100 dark:bg-dark-700 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
               <h2 className="text-xl font-bold text-gray-800 dark:text-white font-kufi">{title}</h2>
               <p className="text-xs text-gray-500 dark:text-gray-400">ملف PDF</p>
            </div>
         </div>

         <div className="flex gap-2">
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors text-sm"
              title="إعادة تحميل الملف"
            >
              <RefreshCw size={16} />
            </button>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors text-sm"
            >
              <ExternalLink size={16} /> <span className="hidden sm:inline">فتح خارجي</span>
            </a>
         </div>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative flex flex-col">
         <object
           key={`${pdfUrl}-${retryCount}`} 
           data={`${pdfUrl}#view=FitH&toolbar=0`}
           type="application/pdf"
           className="w-full h-full"
         >
           {/* Fallback Content */}
           <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 bg-gray-50 dark:bg-dark-900">
             <FileText size={64} className="text-gray-300" />
             <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">
               تعذر عرض الملف
             </h3>
             <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
               تأكد من وجود ملف <strong>{type}.pdf</strong> داخل مجلد <code>public/adhkar/</code>.
             </p>
             
             <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-sm max-w-md mx-auto border border-amber-100 dark:border-amber-900/50 mt-4 text-left" dir="ltr">
                <div className="flex items-center gap-2 font-bold mb-2 text-amber-700 dark:text-amber-300" dir="rtl">
                  <AlertCircle size={18} /> المسار المطلوب:
                </div>
                <code className="block bg-white dark:bg-black/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800 break-all">
                  public/adhkar/{type}.pdf
                </code>
             </div>

             <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button 
                  onClick={handleRetry}
                  className="px-6 py-3 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-dark-600 flex items-center gap-2"
                >
                  <RefreshCw size={18} /> إعادة المحاولة
                </button>
                <a 
                  href={pdfUrl} 
                  download={`${type}.pdf`}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Download size={18} /> تحميل الملف
                </a>
             </div>
           </div>
         </object>
      </div>
    </div>
  );
};