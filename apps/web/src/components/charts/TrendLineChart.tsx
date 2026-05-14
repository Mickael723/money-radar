import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export interface CategoryTrend {
  date: string;
  [category: string]: string | number;
}

export interface TrendLineChartProps {
  data: CategoryTrend[];
  visibleCategories: string[];
  colors?: string[];
}

export function TrendLineChart({ data, visibleCategories, colors = ['#064e3b', '#047857', '#10b981', '#6ee7b7'] }: TrendLineChartProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} dy={10} />
        <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} />
        <RechartsTooltip 
          contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#064e3b'}}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
        {visibleCategories.map((cat, idx) => (
          <Line 
            key={cat} 
            type="monotone" 
            dataKey={cat} 
            stroke={colors[idx % colors.length]} 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
