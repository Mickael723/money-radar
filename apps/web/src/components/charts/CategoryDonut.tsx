import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export interface CategoryTotal {
  name: string;
  value: number;
}

export interface CategoryDonutProps {
  data: CategoryTotal[];
  colors?: string[];
}

export function CategoryDonut({ data, colors = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'] }: CategoryDonutProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <RechartsTooltip 
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
        />
        <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
