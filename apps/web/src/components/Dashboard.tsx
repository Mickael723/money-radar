import { useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { parseISO, format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';

const COLORS = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export function Dashboard() {
  const { transactions, isLoading } = useTransactionStore();

  const kpis = useMemo(() => {
    let income = 0;
    let spend = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.amount > 0) {
        income += t.amount;
      } else {
        spend += Math.abs(t.amount);
        if (t.category !== 'transfers') {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
        }
      }
    });

    let topCategory = 'N/A';
    let maxSpend = 0;
    for (const [cat, total] of Object.entries(categoryTotals)) {
      if (total > maxSpend) {
        maxSpend = total;
        topCategory = cat;
      }
    }

    return {
      income,
      spend,
      net: income - spend,
      topCategory: topCategory.toUpperCase(),
      topCategorySpend: maxSpend
    };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const monthlyMap: Record<string, { month: string; income: number; spend: number }> = {};
    
    transactions.forEach(t => {
      try {
        const dateObj = parseISO(t.date);
        const monthKey = format(dateObj, 'MMM yyyy');
        
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { month: monthKey, income: 0, spend: 0 };
        }
        
        if (t.amount > 0) monthlyMap[monthKey].income += t.amount;
        else monthlyMap[monthKey].spend += Math.abs(t.amount);
      } catch (e) {
        // Fallback for invalid dates
      }
    });

    return Object.values(monthlyMap).reverse();
  }, [transactions]);

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount < 0 && t.category !== 'transfers') {
        catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
      }
    });

    return Object.keys(catMap)
      .map(key => ({ name: key.toUpperCase(), value: catMap[key] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (isLoading && transactions.length === 0) {
    return <div className="p-8 text-center text-emerald-700 animate-pulse">Loading dashboard analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-4">
            <h3 className="font-semibold text-emerald-900">Total Income</h3>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-950">{formatCurrency(kpis.income)}</p>
        </div>
        
        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-4">
            <h3 className="font-semibold text-emerald-900">Total Spend</h3>
            <TrendingDown size={20} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-950">{formatCurrency(kpis.spend)}</p>
        </div>

        <div className="bg-emerald-900 text-white rounded-xl p-6 shadow-md border border-emerald-800">
          <div className="flex items-center justify-between text-emerald-200 mb-4">
            <h3 className="font-semibold text-emerald-50">Net Savings</h3>
            <DollarSign size={20} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(kpis.net)}</p>
        </div>

        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-4">
            <h3 className="font-semibold text-emerald-900">Top Category</h3>
            <Award size={20} className="text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-950 truncate" title={kpis.topCategory}>{kpis.topCategory}</p>
          <p className="text-sm text-emerald-600 mt-1">{formatCurrency(kpis.topCategorySpend)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Bar Chart */}
        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm h-96 flex flex-col">
          <h3 className="font-semibold text-emerald-900 mb-6">Monthly Cash Flow</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} dy={10} />
                <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#f0fdf4'}} 
                  contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#064e3b'}}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="spend" name="Spend" fill="#047857" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm h-96 flex flex-col">
          <h3 className="font-semibold text-emerald-900 mb-6">Spending by Category</h3>
          <div className="flex-1 min-h-0 relative">
            {categoryData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500">No spend data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
