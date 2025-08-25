import type { Meta, StoryObj } from '@storybook/react';
import NotFound from './NotFound';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof NotFound> = {
  title: 'Pages/NotFound',
  component: NotFound,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Página 404 com contraste WCAG AA e estrutura semântica corrigidos',
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
        story: 'Página 404 padrão com melhorias de acessibilidade implementadas',
      },
    },
  },
};