import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Budget } from '../types';
import { getExpenses, addExpense, getBudget, setBudget, getTodayKey } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Wallet, TrendingDown, PlusCircle, GraduationCap } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = ['أكل', 'مواصلات', 'خروج', 'كورة', 'شخصي', 'دروس'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#64748b', '#8b5cf6'];

export const Finance: React.FC = () => {
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  
  // Expense Form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('شخصي');
  const [note, setNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBudgetState(getBudget());
    setExpenses(getExpenses());
  };

  const handleSetBudget = () => {
    if (!newBudgetAmount) return;
    const b: Budget = {
      startDate: getTodayKey(),
      amount: parseFloat(newBudgetAmount)
    };
    setBudget(b);
    setBudgetState(b);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      date: getTodayKey(),
      amount: parseFloat(amount),
      category,
      note
    };
    addExpense(expense);
    setAmount('');
    setNote('');
    loadData();
  };

  // Calculations
  const currentWeekExpenses = budget 
    ? expenses.filter(e => e.date >= budget.startDate)
    : [];

  const totalSpent = currentWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget ? budget.amount - totalSpent : 0;
  
  // Lessons specific analysis
  const lessonsSpent = currentWeekExpenses
    .filter(e => e.category === 'دروس')
    .reduce((sum, e) => sum + e.amount, 0);
  const lessonsPercentage = totalSpent > 0 ? Math.round((lessonsSpent / totalSpent) * 100) : 0;
  
  // Chart Data
  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: currentWeekExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.value > 0);

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-primary-50 p-6 rounded-full">
           <Wallet className="text-primary-600 w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">ابدأ أسبوعك المالي</h2>
        <p className="text-gray-500 max-w-md">حدد ميزانيتك لهذا الأسبوع لتبدأ في تتبع مصاريفك ومعرفة أين تذهب أموالك.</p>
        <div className="flex gap-2 w-full max-w-xs">
          <input 
            type="number" 
            placeholder="الميزانية (مثلاً 500)" 
            className="flex-1 p-3 border rounded-xl outline-none focus:border-primary-500"
            value={newBudgetAmount}
            onChange={e => setNewBudgetAmount(e.target.value)}
          />
          <button onClick={handleSetBudget} className="bg-primary-600 text-white px-6 rounded-xl font-bold">بدأ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <p className="text-gray-500 text-sm mb-1">الميزانية</p>
           <h3 className="text-2xl font-bold text-gray-800">{budget.amount} ج.م</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <p className="text-gray-500 text-sm mb-1">المصروف</p>
           <h3 className="text-2xl font-bold text-red-500">{totalSpent} ج.م</h3>
        </div>
        <div className={`p-6 rounded-2xl border border-gray-100 shadow-sm ${remaining < 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
           <p className="text-gray-500 text-sm mb-1">المتبقي</p>
           <h3 className={`text-2xl font-bold ${remaining < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
             {remaining} ج.م
           </h3>
        </div>
      </div>

      {/* Lesson Insight */}
      {lessonsSpent > 0 && (
        <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl">
            <GraduationCap className="text-violet-600" />
          </div>
          <div>
            <h4 className="font-bold text-violet-900">مصاريف التعليم والدروس</h4>
            <p className="text-violet-700 text-sm">
              أنفقت <span className="font-bold">{lessonsSpent} ج.م</span> على الدروس ({lessonsPercentage}% من مصروفك). 
              {lessonsPercentage > 50 ? ' استثمار ممتاز في مستقبلك! 🎓' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <TrendingDown size={20} className="text-red-500" /> تسجيل مصروف
           </h3>
           <form onSubmit={handleAddExpense} className="space-y-4">
             <div>
               <label className="text-xs font-bold text-gray-400">المبلغ</label>
               <input 
                 type="number" 
                 required
                 className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-1 focus:ring-primary-500"
                 placeholder="0.00"
                 value={amount}
                 onChange={e => setAmount(e.target.value)}
               />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-400">الفئة</label>
               <div className="grid grid-cols-3 gap-2 mt-1">
                 {CATEGORIES.map(cat => (
                   <button
                     key={cat}
                     type="button"
                     onClick={() => setCategory(cat)}
                     className={`text-sm py-2 rounded-lg transition-colors ${category === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-400">ملاحظة (اختياري)</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
             </div>
             <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
               <PlusCircle size={18} /> إضافة
             </button>
           </form>
        </div>

        {/* Analytics */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
           <h3 className="w-full font-bold text-lg mb-4 text-right">تحليل المصروفات</h3>
           {categoryData.length > 0 ? (
             <div className="w-full h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <p className="text-gray-400">لا توجد بيانات كافية للرسم البياني</p>
           )}
           <div className="w-full mt-4 space-y-2">
             {expenses.slice().reverse().slice(0, 3).map(e => (
               <div key={e.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                 <span className="text-gray-600">{e.category} {e.note && <span className="text-gray-400 text-xs">({e.note})</span>}</span>
                 <span className="font-bold text-gray-800">-{e.amount}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};