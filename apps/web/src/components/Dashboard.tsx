import { useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { parseISO, format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';
import { MonthlyBarChart } from './charts/MonthlyBarChart';
import { CategoryDonut } from './charts/CategoryDonut';
import { TrendLineChart } from './charts/TrendLineChart';



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

  const monthlyCategoryData = useMemo(() => {
    const monthlyMap: Record<string, { month: string; [cat: string]: string | number }> = {};
    const categories = new Set<string>();
    
    transactions.forEach(t => {
      try {
        if (t.amount < 0 && t.category !== 'transfers') {
          const dateObj = parseISO(t.date);
          const monthKey = format(dateObj, 'MMM yyyy');
          
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { month: monthKey };
          }
          
          const cat = t.category.toUpperCase();
          categories.add(cat);
          const current = (monthlyMap[monthKey][cat] as number) || 0;
          monthlyMap[monthKey][cat] = current + Math.abs(t.amount);
        }
      } catch (e) {
        // Fallback for invalid dates
      }
    });

    // Rename month to date for trendline chart compatibility
    const chartData = Object.values(monthlyMap).reverse().map(item => {
      const { month, ...rest } = item;
      return { month, date: month, ...rest };
    });

    return {
      data: chartData,
      categories: Array.from(categories)
    };
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
          <h3 className="font-semibold text-emerald-900 mb-6">Monthly Cash Flow (Stacked)</h3>
          <div className="flex-1 min-h-0">
            {monthlyCategoryData.data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-emerald-500">No spend data available.</div>
            ) : (
              <MonthlyBarChart data={monthlyCategoryData.data} categories={monthlyCategoryData.categories} />
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm h-96 flex flex-col">
          <h3 className="font-semibold text-emerald-900 mb-6">Spending by Category</h3>
          <div className="flex-1 min-h-0 relative">
            {categoryData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500">No spend data available.</div>
            ) : (
              <CategoryDonut data={categoryData} />
            )}
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm h-96 flex flex-col lg:col-span-2">
          <h3 className="font-semibold text-emerald-900 mb-6">Category Trends</h3>
          <div className="flex-1 min-h-0">
            {monthlyCategoryData.data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-emerald-500">No spend data available.</div>
            ) : (
              <TrendLineChart 
                data={monthlyCategoryData.data as any} 
                visibleCategories={monthlyCategoryData.categories} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
