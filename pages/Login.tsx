import React, { useState } from 'react';
import { Mail, Lock, Sprout, AlertCircle, ArrowRight, Leaf } from 'lucide-react';
import { loginUser, registerUser } from '../services/cloud';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
              {loading ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <>
                   {isLoginMode ? 'دخول' : 'أنشئ مساحتك'} <ArrowRight size={20} className="rotate-180" />
                 </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-emerald-200/40">
          نماء.. حيث تزهر إنجازاتك الصغيرة لتصبح عظيمة.
        </p>
      </div>
    </div>
  );
};