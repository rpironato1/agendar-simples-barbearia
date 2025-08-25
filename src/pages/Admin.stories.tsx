import type { Meta, StoryObj } from '@storybook/react';
import Admin from './Admin';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const meta: Meta<typeof Admin> = {
  title: 'Dashboards/AdminDashboard',
  component: Admin,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Dashboard administrativo com landmark <main> e estrutura semântica implementados',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dashboard administrativo completo com gestão de agendamentos, barbeiros e pagamentos',
      },
    },
  },
};