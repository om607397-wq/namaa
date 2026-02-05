import React, { useEffect, useState } from 'react';
import { Sprout, Leaf } from 'lucide-react';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Initial fade in (0ms)
    // Stage 2: Sprout grows (500ms)
    setTimeout(() => setStage(1), 500);
    // Stage 3: Text appears (1200ms)
    setTimeout(() => setStage(2), 1200);
    // Finish (3000ms) - ample time to load data
    const timer = setTimeout(() => {
      onFinish();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          {/* Glowing Ring */}
          <div className={`absolute inset-0 border-4 border-emerald-500/30 rounded-full transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
          <div className={`absolute inset-0 border-4 border-teal-400/20 rounded-full transition-all duration-1000 delay-200 ${stage >= 1 ? 'scale-125 opacity-50' : 'scale-0 opacity-0'}`}></div>
          
          {/* Seed/Sprout Animation */}
          <div className={`transition-all duration-1000 ease-out transform ${stage >= 1 ? 'scale-100 translate-y-0 opacity-100' : 'scale-0 translate-y-10 opacity-0'}`}>
             <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.4)] relative">
                <Sprout size={48} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                {/* Floating Leaf Particle */}
                <Leaf size={20} className={`absolute -top-4 -right-4 text-emerald-300 transition-all duration-1000 delay-500 ${stage >= 1 ? 'opacity-100 translate-y-0 rotate-12' : 'opacity-0 translate-y-4 rotate-0'}`} />
             </div>
          </div>
        </div>

        {/* Text Animation */}
        <div className={`text-center transition-all duration-1000 transform ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2 drop-shadow-2xl">
            نمـــاء
          </h1>
          <div className="h-1 w-0 mx-auto bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 delay-500" style={{ width: stage >= 2 ? '60%' : '0%' }}></div>
          <p className="text-emerald-200/80 font-medium mt-3 tracking-wide text-lg">
            رحلة النمو تبدأ بخطوة
          </p>
        </div>
      </div>

      {/* Loading Bar at bottom */}
      <div className="absolute bottom-12 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full animate-[loading_3s_ease-in-out_forwards]"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};