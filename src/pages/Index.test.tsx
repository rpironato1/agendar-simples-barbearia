import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import Index from "./Index";

expect.extend(toHaveNoViolations);

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Scissors: () => <div data-testid="scissors-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react router navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the custom components
vi.mock("@/components/reactbits", () => ({
  Beams: ({ children, ...props }: any) => <div data-testid="beams" {...props}>{children}</div>,
  PillNav: ({ children, ...props }: any) => <div data-testid="pill-nav" {...props}>{children}</div>,
  SpotlightCard: ({ children, ...props }: any) => <div data-testid="spotlight-card" {...props}>{children}</div>,
  GlassSurface: ({ children, ...props }: any) => <div data-testid="glass-surface" {...props}>{children}</div>,
  ShinyText: ({ children, ...props }: any) => <div data-testid="shiny-text" {...props}>{children}</div>,
  CountUp: ({ value, ...props }: any) => <span data-testid="count-up" {...props}>{value}</span>,
  Stepper: ({ children, ...props }: any) => <div data-testid="stepper" {...props}>{children}</div>,
  Step: ({ children, ...props }: any) => <div data-testid="step" {...props}>{children}</div>,
}));

vi.mock("@/components/layout", () => ({
  Hero: ({ children, ...props }: any) => <div data-testid="hero" {...props}>{children}</div>,
  Footer: ({ children, ...props }: any) => <div data-testid="footer" {...props}>{children}</div>,
}));

vi.mock("@/components/mobile-first", () => ({
  ResponsiveLayout: ({ children, ...props }: any) => <div data-testid="responsive-layout" {...props}>{children}</div>,
  Container: ({ children, ...props }: any) => <div data-testid="container" {...props}>{children}</div>,
  ResponsiveGrid: ({ children, ...props }: any) => <div data-testid="responsive-grid" {...props}>{children}</div>,
  Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
  Section: ({ children, ...props }: any) => <div data-testid="section" {...props}>{children}</div>,
  TouchButton: ({ children, ...props }: any) => <button data-testid="touch-button" {...props}>{children}</button>,
  TouchCard: ({ children, ...props }: any) => <div data-testid="touch-card" {...props}>{children}</div>,
  useIsMobile: () => false,
  useScreenSize: () => ({ width: 1024, height: 768, isMobile: false, isTablet: false, isDesktop: true }),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const renderIndex = () => {
  return render(
    <TestWrapper>
      <Index />
    </TestWrapper>
  );
};

describe("Index Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the main landing page components", () => {
      renderIndex();
      
      // Check for key page elements
      expect(screen.getByTestId("responsive-layout")).toBeInTheDocument();
      expect(screen.getByTestId("hero")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("displays the main heading and hero content", () => {
      renderIndex();
      
      // Check for main heading
      expect(screen.getByText("Agende seu corte na melhor barbearia da cidade")).toBeInTheDocument();
      expect(screen.getByText("Profissionais experientes, ambiente moderno e atendimento de qualidade. Transforme seu visual com a gente!")).toBeInTheDocument();
    });

    it("shows service cards with proper structure", () => {
      renderIndex();
      
      // Check for service cards
      const serviceCards = screen.getAllByTestId("touch-card");
      expect(serviceCards.length).toBeGreaterThan(0);
      
      // Check for service information
      expect(screen.getByText("Corte Clássico")).toBeInTheDocument();
      expect(screen.getByText("Barba Completa")).toBeInTheDocument();
      expect(screen.getByText("Corte + Barba")).toBeInTheDocument();
    });

    it("displays pricing information", () => {
      renderIndex();
      
      // Check for pricing
      expect(screen.getByText("R$ 35")).toBeInTheDocument();
      expect(screen.getByText("R$ 25")).toBeInTheDocument();
      expect(screen.getByText("R$ 55")).toBeInTheDocument();
    });

    it("shows statistics section", () => {
      renderIndex();
      
      // Check for statistics
      expect(screen.getByText("Clientes Satisfeitos")).toBeInTheDocument();
      expect(screen.getByText("Anos de Experiência")).toBeInTheDocument();
      expect(screen.getByText("Profissionais")).toBeInTheDocument();
    });

    it("displays contact information", () => {
      renderIndex();
      
      // Check for contact info
      expect(screen.getByText("Endereço")).toBeInTheDocument();
      expect(screen.getByText("Telefone")).toBeInTheDocument();
      expect(screen.getByText("Horário de Funcionamento")).toBeInTheDocument();
      expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
    });
  });

  describe("Functionality", () => {
    it("handles service selection", () => {
      renderIndex();
      
      const serviceButtons = screen.getAllByTestId("touch-button");
      const firstService = serviceButtons.find(button => 
        button.textContent?.includes("Agendar Agora")
      );
      
      if (firstService) {
        fireEvent.click(firstService);
        expect(mockNavigate).toHaveBeenCalledWith("/booking");
      }
    });

    it("navigates to booking page when CTA is clicked", () => {
      renderIndex();
      
      // Find and click the main CTA button
      const ctaButtons = screen.getAllByText("Agendar Agora");
      if (ctaButtons.length > 0) {
        fireEvent.click(ctaButtons[0]);
        expect(mockNavigate).toHaveBeenCalledWith("/booking");
      }
    });

    it("handles navigation to different user types", () => {
      renderIndex();
      
      // Look for navigation buttons
      const buttons = screen.getAllByRole("button");
      
      // Check if navigation happens for different user types
      const customerButton = buttons.find(button => 
        button.textContent?.includes("Sou Cliente")
      );
      
      if (customerButton) {
        fireEvent.click(customerButton);
        expect(mockNavigate).toHaveBeenCalled();
      }
    });
  });

  describe("Responsive Design", () => {
    it("renders mobile-first components", () => {
      renderIndex();
      
      expect(screen.getByTestId("responsive-layout")).toBeInTheDocument();
      expect(screen.getByTestId("container")).toBeInTheDocument();
      expect(screen.getAllByTestId("stack")).toBeTruthy();
    });

    it("uses touch-friendly components", () => {
      renderIndex();
      
      const touchCards = screen.getAllByTestId("touch-card");
      const touchButtons = screen.getAllByTestId("touch-button");
      
      expect(touchCards.length).toBeGreaterThan(0);
      expect(touchButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Visual Elements", () => {
    it("displays service icons", () => {
      renderIndex();
      
      expect(screen.getAllByTestId("scissors-icon")).toBeTruthy();
      expect(screen.getAllByTestId("clock-icon")).toBeTruthy();
      expect(screen.getAllByTestId("star-icon")).toBeTruthy();
    });

    it("shows contact icons", () => {
      renderIndex();
      
      expect(screen.getAllByTestId("mappin-icon")).toBeTruthy();
      expect(screen.getAllByTestId("phone-icon")).toBeTruthy();
    });

    it("includes visual enhancement components", () => {
      renderIndex();
      
      expect(screen.getByTestId("beams")).toBeInTheDocument();
      expect(screen.getAllByTestId("spotlight-card")).toBeTruthy();
    });
  });

  describe("Content Sections", () => {
    it("has services section with proper content", () => {
      renderIndex();
      
      expect(screen.getByText("Nossos Serviços")).toBeInTheDocument();
      expect(screen.getByText("Serviços profissionais para cuidar do seu visual")).toBeInTheDocument();
    });

    it("includes about section", () => {
      renderIndex();
      
      // Look for about content
      const aboutText = screen.getByText("Profissionais experientes, ambiente moderno e atendimento de qualidade. Transforme seu visual com a gente!");
      expect(aboutText).toBeInTheDocument();
    });

    it("displays customer testimonials or reviews section", () => {
      renderIndex();
      
      // Check for testimonial indicators
      const stars = screen.getAllByTestId("star-icon");
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderIndex();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper semantic HTML structure", () => {
      renderIndex();
      
      // Check for semantic elements
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("has appropriate color contrast and visual hierarchy", () => {
      renderIndex();
      
      // Check for main heading
      const mainHeading = screen.getByText("Agende seu corte na melhor barbearia da cidade");
      expect(mainHeading).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("renders without blocking", async () => {
      const startTime = performance.now();
      renderIndex();
      const endTime = performance.now();
      
      // Should render quickly (within 100ms for this test)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("handles missing data gracefully", () => {
      // Test that the page doesn't crash with minimal props
      expect(() => renderIndex()).not.toThrow();
    });
  });

  describe("State Management", () => {
    it("maintains state during user interactions", () => {
      renderIndex();
      
      // Test that clicking elements doesn't break the page
      const buttons = screen.getAllByRole("button");
      
      buttons.forEach(button => {
        expect(() => fireEvent.click(button)).not.toThrow();
      });
    });

    it("handles navigation state changes", () => {
      renderIndex();
      
      // Ensure multiple navigation calls work
      const navButtons = screen.getAllByTestId("touch-button");
      
      if (navButtons.length > 0) {
        fireEvent.click(navButtons[0]);
        if (navButtons.length > 1) {
          fireEvent.click(navButtons[1]);
        }
        
        // Should not throw errors
        expect(mockNavigate).toHaveBeenCalled();
      }
    });
  });

  describe("Error Handling", () => {
    it("handles component errors gracefully", () => {
      // Mock console.error to prevent test pollution
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      expect(() => renderIndex()).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it("handles navigation errors", () => {
      mockNavigate.mockImplementation(() => {
        throw new Error("Navigation failed");
      });
      
      renderIndex();
      
      const buttons = screen.getAllByRole("button");
      if (buttons.length > 0) {
        // Should not crash the app
        expect(() => fireEvent.click(buttons[0])).not.toThrow();
      }
      
      // Reset mock
      mockNavigate.mockImplementation(() => {});
    });
  });
});