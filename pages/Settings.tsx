import React, { useRef, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Download, Upload, AlertTriangle, Settings as SettingsIcon, Cloud, Check, 
  LogOut, User, AlertCircle, LayoutTemplate, Bell, Facebook, Instagram, Phone, 
  Code, Heart 
} from 'lucide-react';
import { 
  uploadDataToCloud, 
  downloadDataFromCloud,
  logoutUser,
  subscribeToAuth
} from '../services/cloud';
import { requestNotificationPermission } from '../components/PrayerNotifier';
import { useToast } from '../context/ToastContext';

const { Link } = ReactRouterDOM;

export const Settings: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  
  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [permissionError, setPermissionError] = useState(false);
  
  // Notification State
  const [notifPermission, setNotifPermission] = useState(Notification.permission);

  useEffect(() => {
    // Subscribe to Auth State
    const unsubscribe = subscribeToAuth((u) => {
       setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Safe helper defined at component level
  const getLocalProfile = () => {
     try {
       return JSON.parse(localStorage.getItem('injaz_profile') || '{}');
     } catch { return {}; }
  };

  const handleExport = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('injaz_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namaa_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('هل أنت متأكد؟ سيتم استبدال البيانات الحالية بالبيانات الموجودة في الملف.')) {
           Object.entries(json).forEach(([key, value]) => {
             if (typeof value === 'string') {
               localStorage.setItem(key, value);
             }
           });
           alert('تم استعادة البيانات بنجاح! سيتم تحديث الصفحة.');
           window.location.reload();
        }
      } catch (err) {
        alert('حدث خطأ في قراءة الملف.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    if (confirm('تحذير نهائي: هل تريد حذف جميع بيانات التطبيق؟ لا يمكن التراجع عن هذا الإجراء.')) {
       localStorage.clear();
       window.location.reload();
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleNotificationRequest = async () => {
    if (Notification.permission === 'denied') {
      alert('⚠️ المتصفح يحظر الإشعارات لهذا الموقع.\n\nيرجى تفعيلها من إعدادات المتصفح.');
      return;
    }

    try {
      const result = await requestNotificationPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        showToast('تم تفعيل التنبيهات بنجاح ✅', 'success');
        new Notification('نماء', { body: 'تم تفعيل التنبيهات بنجاح!' });
      } else {
        showToast('تم رفض التنبيهات.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ غير متوقع', 'error');
    }
  };

  const handleCloudOperation = async (operation: 'upload' | 'download') => {
    if (!user) return;
    setIsSyncing(true);
    setSyncStatus(operation === 'upload' ? 'جاري رفع البيانات...' : 'جاري جلب البيانات...');
    setPermissionError(false);

    try {
      if (operation === 'upload') {
        await uploadDataToCloud();
        const profile = getLocalProfile();
        setSyncStatus(`تم رفع بياناتك (${profile.name || 'المستخدم'}) للسحابة بنجاح ✅`);
      } else {
        if (!confirm('هذا سيستبدل بياناتك الحالية. هل أنت متأكد؟')) {
          setIsSyncing(false);
          setSyncStatus('');
          return;
        }
        const success = await downloadDataFromCloud();
        if (success) {
          alert('تم استعادة البيانات بنجاح!');
          window.location.reload();
        } else {
          setSyncStatus('لا توجد بيانات محفوظة لهذا الحساب.');
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
        setSyncStatus('خطأ: لا تملك صلاحية.');
      } else {
        setSyncStatus(`فشل العملية: ${error.message || 'خطأ غير معروف'}`);
      }
    }
    setIsSyncing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 animate-fade-in">
       <div className="text-center">
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
           <SettingsIcon className="text-gray-600 dark:text-gray-400" /> الإعدادات
         </h2>
         <p className="text-gray-500 dark:text-gray-400">إدارة المزامنة والبيانات</p>
       </div>

       {/* --- Customization Link --- */}
       <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
         <Link to="/onboarding" className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <LayoutTemplate size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">تخصيص الواجهة</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">اختر الصفحات والميزات التي تظهر في القائمة</p>
               </div>
            </div>
            <div className="bg-gray-100 dark:bg-dark-700 px-4 py-2 rounded-lg text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
               تعديل
            </div>
         </Link>
       </div>

       {/* --- Notifications Link --- */}
       <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Bell size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">تنبيهات الصلاة</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notifPermission === 'granted' ? 'التنبيهات مفعلة ✅' : 'تفعيل التنبيهات لصلوات اليوم'}
                  </p>
               </div>
            </div>
            {notifPermission !== 'granted' && (
              <button onClick={handleNotificationRequest} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-colors">
                 تفعيل
              </button>
            )}
         </div>
         {notifPermission === 'denied' && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
               <AlertCircle size={16} />
               <span>الإشعارات محظورة. اضغط على القفل 🔒 في شريط العنوان لتفعيلها.</span>
            </div>
         )}
       </div>

       {/* --- Cloud Sync Section --- */}
       <div className="bg-indigo-900 text-white rounded-2xl shadow-lg border border-indigo-700 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
          
          <div className="p-6 border-b border-indigo-800 relative z-10 flex justify-between items-start">
             <div>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Cloud className="text-indigo-300" /> المزامنة السحابية
                </h3>
                <p className="text-sm text-indigo-200 opacity-80 flex items-center gap-1">
                  <User size={14} /> {user?.email}
                </p>
             </div>
             <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50 flex items-center gap-1">
                 <Check size={12} /> متصل
             </div>
          </div>

          <div className="p-6 relative z-10 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleCloudOperation('upload')}
                  disabled={isSyncing}
                  className="flex flex-col items-center justify-center gap-2 bg-indigo-800 hover:bg-indigo-700 p-4 rounded-xl transition-colors border border-indigo-600 group"
                >
                  <Upload size={24} className="text-indigo-300 group-hover:text-white transition-colors" />
                  <span className="font-bold text-sm">رفع بياناتي</span>
                  <span className="text-[10px] text-indigo-400">حفظ التقدم الحالي</span>
                </button>
                <button 
                  onClick={() => handleCloudOperation('download')}
                  disabled={isSyncing}
                  className="flex flex-col items-center justify-center gap-2 bg-indigo-800 hover:bg-indigo-700 p-4 rounded-xl transition-colors border border-indigo-600 group"
                >
                  <Download size={24} className="text-indigo-300 group-hover:text-white transition-colors" />
                  <span className="font-bold text-sm">استعادة بياناتي</span>
                  <span className="text-[10px] text-indigo-400">من السحابة لهذا الجهاز</span>
                </button>
             </div>

             <div className="flex justify-between items-center pt-4 border-t border-indigo-800">
                 <span className="text-xs text-indigo-300">{syncStatus}</span>
                 <button onClick={handleLogout} className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 bg-red-900/20 px-3 py-1 rounded-lg border border-red-900/30">
                   <LogOut size={12} /> تسجيل خروج
                 </button>
             </div>
          </div>
       </div>

       {permissionError && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex items-start gap-3">
             <AlertCircle className="text-orange-600 shrink-0 mt-1" size={20} />
             <div className="text-sm text-gray-700 dark:text-gray-300">
               <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-1">تنبيه: قواعد الأمان في Firebase تمنع الوصول</h4>
               <p className="mb-2">يجب تحديث <strong>Firestore Rules</strong> في لوحة تحكم Firebase للسماح للمستخدمين بالوصول لبياناتهم.</p>
               <div className="bg-white dark:bg-black/30 p-2 rounded border border-orange-100 dark:border-orange-900 font-mono text-xs overflow-x-auto" dir="ltr">
                  match /users_data/&#123;userId&#125; &#123; <br/>
                  &nbsp;&nbsp;allow read, write: if request.auth != null && request.auth.uid == userId; <br/>
                  &#125;
               </div>
             </div>
          </div>
       )}

       {/* --- Local Backup Section --- */}
       <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">النسخ الاحتياطي المحلي (ملف)</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               حفظ نسخة من بياناتك كملف على جهازك. مفيد إذا لم ترد استخدام السحابة.
             </p>
          </div>
          
          <div className="p-6 grid gap-4 md:grid-cols-2">
             <button 
               onClick={handleExport}
               className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors gap-3 group"
             >
               <div className="bg-primary-100 dark:bg-primary-800 p-3 rounded-full text-primary-600 dark:text-primary-300 group-hover:scale-110 transition-transform">
                 <Download size={24} />
               </div>
               <div className="text-center">
                 <span className="block font-bold text-primary-700 dark:text-primary-300">تحميل ملف</span>
                 <span className="text-xs text-primary-500 dark:text-primary-400">حفظ JSON على جهازك</span>
               </div>
             </button>

             <button 
               onClick={handleImportClick}
               className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-900 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors gap-3 group"
             >
               <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform">
                 <Upload size={24} />
               </div>
               <div className="text-center">
                 <span className="block font-bold text-gray-700 dark:text-gray-300">استعادة ملف</span>
                 <span className="text-xs text-gray-500 dark:text-gray-400">رفع ملف JSON لاسترجاع التقدم</span>
               </div>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
             </button>
          </div>
       </div>

       {/* --- Danger Zone --- */}
       <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900 p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-500 shrink-0" />
          <div className="flex-1">
             <h3 className="font-bold text-red-700 dark:text-red-400">منطقة الخطر</h3>
             <p className="text-sm text-red-600 dark:text-red-500 mb-4">
               هذا الإجراء سيقوم بمسح جميع بيانات التطبيق من هذا الجهاز والعودة لنقطة الصفر.
             </p>
             <button 
               onClick={handleClearData}
               className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
             >
               حذف جميع البيانات
             </button>
          </div>
       </div>

       {/* --- Developer Credit --- */}
       <div className="mt-12 mb-6">
          <div className="relative group overflow-hidden rounded-[2rem] bg-gray-900 dark:bg-black shadow-2xl transition-all hover:scale-[1.01] duration-500">
             {/* Animated Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
             
             {/* Content */}
             <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-8">
                {/* Info */}
                <div className="flex-1 text-center md:text-right">
                   <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">
                      <Code size={14} /> Developed By
                   </div>
                   <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Omar Basuoney</h3>
                   <p className="text-gray-400 text-sm max-w-sm mx-auto md:mx-0">
                      صنع هذا التطبيق بكل <Heart size={12} className="inline text-red-500 fill-red-500 mx-1" /> للمساعدة في تنظيم وقتك وحياتك.
                   </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3">
                   <a 
                     href="https://facebook.com/omar.basuoney" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all hover:scale-110 shadow-lg"
                     title="Facebook"
                   >
                      <Facebook size={24} />
                   </a>
                   
                   <a 
                     href="https://instagram.com/omarbasuoney" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center hover:opacity-90 transition-all hover:scale-110 shadow-lg"
                     title="Instagram"
                   >
                      <Instagram size={24} />
                   </a>
                   
                   <a 
                     href="tel:+201000000000" 
                     className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-white hover:text-emerald-500 transition-all hover:scale-110 shadow-lg"
                     title="Contact"
                   >
                      <Phone size={24} />
                   </a>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};