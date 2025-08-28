import type { Meta, StoryObj } from "@storybook/react";
import UserLogin from "./UserLogin";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof UserLogin> = {
  title: "Pages/UserLogin",
  component: UserLogin,
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
          "Página de login do usuário com H1 e landmark <main> implementados",
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
          "Formulário de login/cadastro de usuário com melhorias de acessibilidade",
      },
    },
  },
};
