import type { Meta, StoryObj } from "@storybook/react";
import BarbershopSignup from "./BarbershopSignup";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof BarbershopSignup> = {
  title: "Pages/BarbershopSignup",
  component: BarbershopSignup,
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
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Página de cadastro de barbearia com hierarquia de headings corrigida (H1→H2)",
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
        story:
          "Formulário multi-step de cadastro de barbearia com estrutura semântica corrigida",
      },
    },
  },
};
