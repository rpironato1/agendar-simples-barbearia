import type { Meta, StoryObj } from "@storybook/react";
import UserDashboard from "./UserDashboard";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Mock user context
const mockUser = {
  id: "1",
  email: "user@example.com",
  user_metadata: {
    name: "João Silva",
  },
};

const meta: Meta<typeof UserDashboard> = {
  title: "Dashboards/UserDashboard",
  component: UserDashboard,
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
          "Dashboard do usuário com landmark <main> e estrutura semântica implementados",
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
          "Dashboard principal do usuário com agendamentos, histórico e perfil",
      },
    },
  },
};
