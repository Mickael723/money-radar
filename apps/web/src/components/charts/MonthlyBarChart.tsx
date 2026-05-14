import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export interface MonthlyData {
  month: string;
  [category: string]: string | number; // allow dynamic category keys
}

export interface MonthlyBarChartProps {
  data: MonthlyData[];
  categories: string[];
  colors?: string[];
  onBarClick?: (month: string) => void;
}

export function MonthlyBarChart({ data, categories, colors = ['#064e3b', '#047857', '#10b981', '#6ee7b7'], onBarClick }: MonthlyBarChartProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} dy={10} />
        <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fill: '#064e3b', fontSize: 12}} />
        <RechartsTooltip 
          cursor={{fill: '#f0fdf4'}} 
          contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#064e3b'}}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
        {categories.map((cat, idx) => (
          <Bar 
            key={cat} 
            dataKey={cat} 
            stackId="a" 
            fill={colors[idx % colors.length]} 
            radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
            barSize={30} 
            onClick={(data) => onBarClick && onBarClick(data.month)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
