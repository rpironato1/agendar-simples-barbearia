import type { Meta, StoryObj } from "@storybook/react";
import Booking from "./Booking";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof Booking> = {
  title: "Pages/Booking",
  component: Booking,
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
          "Página de agendamento com landmark <main> e estrutura semântica implementados",
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
          "Formulário de agendamento de horários com melhorias de acessibilidade",
      },
    },
  },
};
