import React, { useState, useEffect } from 'react';
import { Mail, Lock, Sprout, AlertCircle, ArrowRight, Leaf } from 'lucide-react';
import { loginUser, registerUser, loginWithGoogle, clearLocalData } from '../services/cloud';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Critical Fix: When Login page mounts, we ensure no "ghost" data exists from previous users.
  useEffect(() => {
    clearLocalData(); 
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLoginMode) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = 'حدث خطأ غير متوقع.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = 'خطأ في البريد أو كلمة المرور';
      if (err.code === 'auth/user-not-found') msg = 'لا يوجد حساب بهذا البريد';
      if (err.code === 'auth/email-already-in-use') msg = 'هذا البريد مسجل مسبقاً، حاول تسجيل الدخول.';
      if (err.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)';
      if (err.code === 'auth/network-request-failed') msg = 'تأكد من اتصال الإنترنت.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Auth state change will redirect automatically in App.tsx
    } catch (err: any) {
      console.error("Google Login Error:", err);
      let msg = 'فشل تسجيل الدخول بجوجل.';
      if (err.code === 'auth/popup-closed-by-user') msg = 'تم إلغاء العملية.';
      if (err.code === 'auth/network-request-failed') msg = 'تأكد من اتصال الإنترنت.';
      if (err.code === 'auth/operation-not-allowed') msg = 'يجب تفعيل جوجل من إعدادات Firebase.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 p-4 text-white font-sans overflow-hidden relative" dir="rtl">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-5 rounded-[2rem] shadow-2xl shadow-emerald-500/20 mb-6 relative group">
            <Sprout size={56} className="text-white drop-shadow-md" />
            <Leaf size={24} className="absolute -top-2 -right-2 text-emerald-300 animate-bounce delay-700" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            نمـــاء
          </h1>
          <p className="text-emerald-200/80 text-sm font-medium tracking-wide">بيئة متكاملة لنمو روحك وعقلك</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          
          <div className="flex bg-black/20 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLoginMode(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLoginMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-400 hover:text-white'}`}
            >
              تسجيل دخول
            </button>
            <button 
              onClick={() => { setIsLoginMode(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLoginMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-400 hover:text-white'}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-200/70 mr-1">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com" 
                  className="w-full bg-black/20 border border-white/5 text-white placeholder-emerald-200/30 rounded-2xl py-4 px-12 outline-none focus:border-emerald-500/50 focus:bg-black/30 transition-all text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-200/70 mr-1">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                <input 
                  type="password" 
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••" 
                  className="w-full bg-black/20 border border-white/5 text-white placeholder-emerald-200/30 rounded-2xl py-4 px-12 outline-none focus:border-emerald-500/50 focus:bg-black/30 transition-all text-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-300 text-xs bg-red-900/20 p-4 rounded-2xl border border-red-500/20">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 text-lg"
            >
              {loading && isLoginMode ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <>
                   {isLoginMode ? 'دخول' : 'أنشئ مساحتك'} <ArrowRight size={20} className="rotate-180" />
                 </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-emerald-200/30 text-xs">أو تابع باستخدام</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white text-gray-800 rounded-2xl font-bold transition-all hover:bg-gray-100 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 shadow-md"
          >
            {loading && !isLoginMode ? (
               <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            ) : (
               <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                 </svg>
                 <span>Google</span>
               </>
            )}
          </button>

        </div>

        <p className="text-center text-xs text-emerald-200/40">
          نماء.. حيث تزهر إنجازاتك الصغيرة لتصبح عظيمة.
        </p>
      </div>
    </div>
  );
};