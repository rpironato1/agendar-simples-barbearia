import type { Meta, StoryObj } from "@storybook/react";
import AdminLogin from "./AdminLogin";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof AdminLogin> = {
  title: "Pages/AdminLogin",
  component: AdminLogin,
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
          "Página de login administrativo com H1 e landmark <main> implementados",
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
          "Formulário de login administrativo com melhorias de acessibilidade",
      },
    },
  },
};
