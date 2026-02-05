import React, { useState, useEffect } from 'react';
import { getFocusList, saveFocusList, getTodayKey } from '../services/storage';
import { FocusList, FocusTask } from '../types';
import { Target, CheckSquare, Square, Trash2 } from 'lucide-react';

export const Focus: React.FC = () => {
  const [list, setList] = useState<FocusList>({ date: getTodayKey(), tasks: [] });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    setList(getFocusList(getTodayKey()));
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (list.tasks.length >= 3) return;

    const updatedList = {
      ...list,
      tasks: [...list.tasks, { id: Date.now().toString(), text: newTask, completed: false }]
    };
    setList(updatedList);
    saveFocusList(updatedList);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    const updatedTasks = list.tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    const updatedList = { ...list, tasks: updatedTasks };
    setList(updatedList);
    saveFocusList(updatedList);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = list.tasks.filter(t => t.id !== id);
    const updatedList = { ...list, tasks: updatedTasks };
    setList(updatedList);
    saveFocusList(updatedList);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
       <div className="text-center">
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
           <Target className="text-red-500" /> التركيز الثلاثي
         </h2>
         <p className="text-gray-500 dark:text-gray-400">حدد أهم 3 مهام فقط لليوم وأنجزها.</p>
       </div>

       <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm min-h-[300px] flex flex-col">
         
         <div className="space-y-4 flex-1">
           {list.tasks.map(task => (
             <div 
                key={task.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  task.completed 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' 
                    : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-gray-700'
                }`}
             >
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id)}>
                   {task.completed 
                     ? <CheckSquare className="text-emerald-500" /> 
                     : <Square className="text-gray-300 dark:text-gray-600" />
                   }
                   <span className={`text-lg font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                     {task.text}
                   </span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-400 p-2">
                  <Trash2 size={18} />
                </button>
             </div>
           ))}

           {list.tasks.length === 0 && (
             <div className="text-center py-10 text-gray-400 dark:text-gray-600">
               القائمة فارغة.. أضف مهامك الآن
             </div>
           )}
         </div>

         {list.tasks.length < 3 ? (
            <form onSubmit={addTask} className="mt-8 relative">
              <input 
                type="text" 
                placeholder="أضف مهمة (مثلاً: حل واجب الفيزياء)" 
                className="w-full bg-gray-50 dark:bg-dark-900 p-4 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute left-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-lg font-bold text-sm"
              >
                إضافة
              </button>
            </form>
         ) : (
           <div className="mt-8 text-center text-sm text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 py-3 rounded-xl">
             اكتملت القائمة! ركّز على الإنجاز الآن 🚀
           </div>
         )}
       </div>
    </div>
  );
};