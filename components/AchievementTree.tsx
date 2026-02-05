import React from 'react';
import { Sprout, Flower2, TreeDeciduous, Zap } from 'lucide-react';

interface Props {
  score: number; // 0 to 100
}

export const AchievementTree: React.FC<Props> = ({ score }) => {
  let StageIcon = Sprout;
  let color = "text-emerald-400";
  let message = "بذرة صغيرة";
  let height = "h-16";

  if (score === 0) {
     message = "ازرع بذرتك اليوم";
     color = "text-gray-400";
  } else if (score < 30) {
     StageIcon = Sprout;
     color = "text-emerald-400";
     message = "بداية النمو 🌱";
     height = "h-20";
  } else if (score < 70) {
     StageIcon = Flower2;
     color = "text-pink-400";
     message = "أزهرت جهودك 🌸";
     height = "h-24";
  } else {
     StageIcon = TreeDeciduous;
     color = "text-green-600";
     message = "شجرة مثمرة 🌳";
     height = "h-32";
  }

  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:shadow-md">
       <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-4 z-10">شجرة الإنجاز اليومي</h3>
       
       <div className={`relative z-10 transition-all duration-700 ${height} w-full flex items-center justify-center`}>
         <StageIcon className={`${color} drop-shadow-md transition-all duration-700`} size={score < 70 ? 64 : 96} strokeWidth={1.5} />
       </div>

       <div className="mt-4 text-center z-10">
         <div className="text-2xl font-bold text-gray-800 dark:text-white">{score}%</div>
         <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
       </div>

       {/* Progress Bar Background */}
       <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-1000" 
            style={{ width: `${score}%` }}
          ></div>
       </div>
    </div>
  );
};