import React, { useState, useEffect, useRef } from 'react';
import { getDailyToDo, saveDailyToDo, getTodayKey } from '../services/storage';
import { DailyToDo, ToDoTask } from '../types';
import { 
  Plus, Trash2, CheckCircle2, Circle, Printer, Calendar, 
  AlertCircle, ArrowUp, Minus, ArrowDown 
} from 'lucide-react';
import { triggerSmallConfetti } from '../services/confetti';

export const TodoList: React.FC = () => {
  const [todo, setTodo] = useState<DailyToDo>({ date: getTodayKey(), tasks: [] });
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTodo(getDailyToDo(getTodayKey()));
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: ToDoTask = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      priority
    };

    const updated = { ...todo, tasks: [...todo.tasks, task] };
    updated.tasks.sort((a, b) => {
       const p = { high: 3, medium: 2, low: 1 };
       return p[b.priority] - p[a.priority];
    });

    setTodo(updated);
    saveDailyToDo(updated);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    const tasks = todo.tasks.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
        if (newState) triggerSmallConfetti();
        return { ...t, completed: newState };
      }
      return t;
    });
    const updated = { ...todo, tasks };
    setTodo(updated);
    saveDailyToDo(updated);
  };

  const deleteTask = (id: string) => {
    const tasks = todo.tasks.filter(t => t.id !== id);
    const updated = { ...todo, tasks };
    setTodo(updated);
    saveDailyToDo(updated);
  };

  // --- New Robust Printing Method ---
  const handlePrint = () => {
    if (!printRef.current) return;

    // 1. Get the HTML content of the list
    const content = printRef.current.innerHTML;

    // 2. Open a new blank window
    const printWindow = window.open('', '', 'height=600,width=800');
    
    if (printWindow) {
      // 3. Write the HTML structure
      printWindow.document.write('<html><head><title>قائمة مهام نماء</title>');
      
      // 4. Inject Tailwind CDN to ensure styles look exactly the same
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      
      // 5. Add custom print styles to clean up buttons
      printWindow.document.write(`
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
          body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; background-color: white !important; }
          /* Hide delete buttons in print */
          button { display: none !important; } 
          /* Restore Checkbox/Circle icons since they are buttons/svgs */
          .task-icon { display: inline-block !important; } 
          .task-icon svg { width: 24px; height: 24px; }
        </style>
      `);
      
      printWindow.document.write('</head><body>');
      printWindow.document.write(content);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();

      // 6. Wait a moment for Tailwind to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'medium') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const todayStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <CheckCircle2 className="text-emerald-500" /> قائمة المهام اليومية
           </h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">خطط يومك، أنجز مهامك، وتجدد غداً.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-sm"
        >
          <Printer size={18} /> طباعة / حفظ PDF
        </button>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAddTask} className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3">
         <input 
           type="text" 
           placeholder="ماذا تريد أن تنجز اليوم؟"
           className="flex-1 bg-gray-50 dark:bg-dark-900 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
           value={newTask}
           onChange={e => setNewTask(e.target.value)}
         />
         <div className="flex gap-2">
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as any)}
              className="bg-gray-50 dark:bg-dark-900 p-3 rounded-xl border-none outline-none text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
            >
               <option value="high">🔥 عالي</option>
               <option value="medium">⚡ متوسط</option>
               <option value="low">☕ منخفض</option>
            </select>
            <button type="submit" className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors">
               <Plus size={20} />
            </button>
         </div>
      </form>

      {/* Printable Area Wrapper */}
      <div className="bg-white dark:bg-dark-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
         
         {/* Using a ref here to capture ONLY this content for the popup window */}
         <div ref={printRef}>
            {/* Paper Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">قائمة إنجازاتي</h1>
                  <p className="text-gray-400 text-sm">نماء - رفيق النمو</p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-bold bg-gray-50 dark:bg-dark-900 px-3 py-1 rounded-lg">
                      <Calendar size={16} /> {todayStr}
                  </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {todo.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        task.completed 
                          ? 'bg-gray-50 dark:bg-dark-900/50 border-gray-100 dark:border-gray-800' 
                          : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-gray-700'
                    }`}
                  >
                      {/* We add a specific class 'task-icon' to force display in print mode */}
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`task-icon mt-1 transition-colors ${task.completed ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400'}`}
                      >
                        {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      
                      <div className="flex-1">
                        <p className={`text-lg font-medium leading-relaxed ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {task.text}
                        </p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mt-2 ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' && <ArrowUp size={10} />}
                            {task.priority === 'medium' && <Minus size={10} />}
                            {task.priority === 'low' && <ArrowDown size={10} />}
                            {task.priority === 'high' ? 'أولوية قصوى' : task.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                ))}

                {todo.tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                      <AlertCircle size={32} className="mb-2 opacity-50" />
                      <p>القائمة فارغة. أضف مهامك وابدأ الإنجاز!</p>
                  </div>
                )}
            </div>

            {/* Footer Quote */}
            <div className="mt-12 text-center text-gray-400 text-xs italic opacity-70">
                "لا تؤجل عمل اليوم إلى الغد."
            </div>
         </div>
         
      </div>
    </div>
  );
};