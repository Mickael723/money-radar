import type { Meta, StoryObj } from '@storybook/react';
import { MonthlyBarChart } from './MonthlyBarChart';

const meta: Meta<typeof MonthlyBarChart> = {
  title: 'Analytics/MonthlyBarChart',
  component: MonthlyBarChart,
};

export default meta;
type Story = StoryObj<typeof MonthlyBarChart>;

export const Default: Story = {
  args: {
    data: [
      { month: 'Jan 2026', food: 400, utilities: 150, shopping: 200 },
      { month: 'Feb 2026', food: 350, utilities: 140, shopping: 300 },
      { month: 'Mar 2026', food: 450, utilities: 160, shopping: 100 },
    ],
    categories: ['food', 'utilities', 'shopping'],
  },
  render: (args) => (
    <div style={{ width: '600px', height: '400px', backgroundColor: 'white', padding: '20px' }}>
      <MonthlyBarChart {...args} />
    </div>
  )
};
