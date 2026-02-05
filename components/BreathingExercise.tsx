import React, { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

export const BreathingExercise: React.FC = () => {
  const [text, setText] = useState('شهيق');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // A simple 8-second cycle: 4s Inhale, 4s Exhale
    const interval = setInterval(() => {
      setText(prev => prev === 'شهيق' ? 'زفير' : 'شهيق');
      setScale(prev => prev === 1 ? 1.3 : 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2rem] p-6 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] shadow-lg shadow-cyan-500/20">
       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
       
       <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <Wind size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">تنفس وهدّئ عقلك</span>
          </div>

          <div 
            className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center relative transition-all duration-[4000ms] ease-in-out"
            style={{ transform: `scale(${scale})` }}
          >
             <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
             <span className="text-xl font-black relative z-10">{text}</span>
          </div>

          <p className="text-xs text-cyan-100 mt-2 opacity-80">تابع الدائرة لتنظيم تنفسك</p>
       </div>
    </div>
  );
};