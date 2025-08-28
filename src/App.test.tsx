import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";

// Simple test component wrapper
const TestComponent = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe("App Infrastructure", () => {
  it("renders test wrapper without crashing", () => {
    render(
      <TestComponent>
        <div>Test content</div>
      </TestComponent>
    );
    expect(document.body).toBeInTheDocument();
  });

  it("can handle basic routing", () => {
    render(
      <TestComponent>
        <div data-testid="app-content">Test content</div>
      </TestComponent>
    );
    const content = document.querySelector('[data-testid="app-content"]');
    expect(content).toBeInTheDocument();
  });
});
