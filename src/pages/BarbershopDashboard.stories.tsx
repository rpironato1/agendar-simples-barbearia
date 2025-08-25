import type { Meta, StoryObj } from '@storybook/react';
import BarbershopDashboard from './BarbershopDashboard';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const meta: Meta<typeof BarbershopDashboard> = {
  title: 'Dashboards/BarbershopDashboard',
  component: BarbershopDashboard,
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
        component: 'Dashboard da barbearia com landmark <main> e estrutura semântica implementados',
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
        story: 'Dashboard da barbearia com agenda, clientes, serviços e relatórios financeiros',
      },
    },
  },
};