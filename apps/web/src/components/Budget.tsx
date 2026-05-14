import { useState, useMemo, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { Target, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  'subscriptions', 'food', 'gas', 'utilities', 'shopping',
  'health', 'travel', 'entertainment', 'transfers', 'other'
];

export function Budget() {
  const { transactions, budgets, fetchBudgets, setBudgetLimit } = useTransactionStore();
  const mockToken = "mock_token";
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchBudgets(currentMonth, currentYear, mockToken);
  }, [fetchBudgets, currentMonth, currentYear]);

  // Calculate current month's spending per category
  const categorySpend = useMemo(() => {
    const spend: Record<string, number> = {};
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    
    transactions.forEach(t => {
      if (t.amount < 0 && t.category !== 'transfers') {
        const datePrefix = t.date.substring(0, 7); // yyyy-MM
        if (datePrefix === currentMonthStr) {
          spend[t.category] = (spend[t.category] || 0) + Math.abs(t.amount);
        }
      }
    });
    return spend;
  }, [transactions]);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState(CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState('');

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleSave = async (category: string, value: string) => {
    const limit = parseFloat(value);
    if (!isNaN(limit) && limit > 0) {
      await setBudgetLimit(category, limit, currentMonth, currentYear, mockToken);
    }
    setEditingCategory(null);
  };

  const handleAddNew = async () => {
    const limit = parseFloat(newLimit);
    if (!isNaN(limit) && limit > 0) {
      await setBudgetLimit(newCat, limit, currentMonth, currentYear, mockToken);
      setShowAdd(false);
      setNewLimit('');
    }
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden flex flex-col mb-6">
      <div className="p-6 border-b border-emerald-50 flex justify-between items-center bg-emerald-900 text-white">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-emerald-300" />
          <h3 className="font-semibold text-lg">Budget Goals ({format(new Date(), 'MMMM yyyy')})</h3>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
        >
          <Plus size={16} /> Add Limit
        </button>
      </div>

      <div className="p-6 space-y-6">
        {showAdd && (
          <div className="flex gap-3 items-center p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-6">
            <select 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)}
              className="border border-emerald-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <input 
              type="number" 
              placeholder="Limit ($)" 
              value={newLimit}
              onChange={e => setNewLimit(e.target.value)}
              className="border border-emerald-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-32"
            />
            <button 
              onClick={handleAddNew}
              className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        )}

        {budgets.length === 0 && !showAdd && (
          <div className="text-center py-8 text-emerald-600">
            No budget limits set for this month.
          </div>
        )}

        {budgets.map(budget => {
          const spent = categorySpend[budget.category] || 0;
          const percentage = Math.min((spent / budget.limit) * 100, 100);
          
          let colorClass = "bg-emerald-500";
          let textColorClass = "text-emerald-700";
          
          if (percentage >= 100) {
            colorClass = "bg-red-500";
            textColorClass = "text-red-700";
          } else if (percentage >= 80) {
            colorClass = "bg-amber-500";
            textColorClass = "text-amber-700";
          }

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold uppercase text-sm ${textColorClass}`}>
                      {budget.category}
                    </span>
                    {percentage >= 80 && percentage < 100 && <AlertCircle size={14} className="text-amber-500" />}
                    {percentage >= 100 && <AlertCircle size={14} className="text-red-500" />}
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {formatCurrency(spent)}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                </div>
                
                {editingCategory === budget.category ? (
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)} 
                      className="border border-slate-300 rounded px-2 py-1 w-20 text-sm focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSave(budget.category, editValue)}
                      className="bg-slate-800 text-white px-3 py-1 rounded text-sm hover:bg-slate-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingCategory(budget.category);
                      setEditValue(budget.limit.toString());
                    }}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition"
                  >
                    Edit Limit
                  </button>
                )}
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-right text-slate-500 font-medium">
                {percentage.toFixed(1)}% consumed
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
