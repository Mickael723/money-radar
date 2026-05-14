import type { Meta, StoryObj } from '@storybook/react';
import { TrendLineChart } from './TrendLineChart';

const meta: Meta<typeof TrendLineChart> = {
  title: 'Analytics/TrendLineChart',
  component: TrendLineChart,
};

export default meta;
type Story = StoryObj<typeof TrendLineChart>;

export const Default: Story = {
  args: {
    data: [
      { date: 'Jan', food: 400, utilities: 150 },
      { date: 'Feb', food: 350, utilities: 140 },
      { date: 'Mar', food: 450, utilities: 160 },
      { date: 'Apr', food: 390, utilities: 145 },
    ],
    visibleCategories: ['food', 'utilities'],
  },
  render: (args) => (
    <div style={{ width: '600px', height: '400px', backgroundColor: 'white', padding: '20px' }}>
      <TrendLineChart {...args} />
    </div>
  )
};
