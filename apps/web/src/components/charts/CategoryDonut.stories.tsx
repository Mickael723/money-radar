import type { Meta, StoryObj } from '@storybook/react';
import { CategoryDonut } from './CategoryDonut';

const meta: Meta<typeof CategoryDonut> = {
  title: 'Analytics/CategoryDonut',
  component: CategoryDonut,
};

export default meta;
type Story = StoryObj<typeof CategoryDonut>;

export const Default: Story = {
  args: {
    data: [
      { name: 'FOOD', value: 800 },
      { name: 'UTILITIES', value: 300 },
      { name: 'SHOPPING', value: 500 },
      { name: 'SUBSCRIPTIONS', value: 150 },
    ]
  },
  render: (args) => (
    <div style={{ width: '600px', height: '400px', backgroundColor: 'white', padding: '20px' }}>
      <CategoryDonut {...args} />
    </div>
  )
};
