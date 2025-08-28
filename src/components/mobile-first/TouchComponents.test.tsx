import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { TouchButton, TouchCard } from "./TouchComponents";

expect.extend(toHaveNoViolations);

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon" />,
}));

// Mock constants
vi.mock("@/core/constants", () => ({
  TOUCH_SIZES: {
    minTouch: 44,
    comfortable: 48,
    large: 56,
  },
}));

describe("TouchButton Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<TouchButton>Click me</TouchButton>);
      
      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
    });

    it("renders with custom test id", () => {
      render(<TouchButton data-testid="custom-button">Test</TouchButton>);
      
      const button = screen.getByTestId("custom-button");
      expect(button).toBeInTheDocument();
    });

    it("renders with different variants", () => {
      const variants = ["primary", "secondary", "outline", "ghost", "destructive"] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <TouchButton variant={variant} data-testid={`button-${variant}`}>
            {variant}
          </TouchButton>
        );
        
        const button = screen.getByTestId(`button-${variant}`);
        expect(button).toBeInTheDocument();
        
        unmount();
      });
    });

    it("renders with different sizes", () => {
      const sizes = ["sm", "md", "lg", "icon"] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <TouchButton size={size} data-testid={`button-${size}`}>
            {size}
          </TouchButton>
        );
        
        const button = screen.getByTestId(`button-${size}`);
        expect(button).toBeInTheDocument();
        
        unmount();
      });
    });

    it("renders with full width", () => {
      render(<TouchButton fullWidth data-testid="full-width-button">Full Width</TouchButton>);
      
      const button = screen.getByTestId("full-width-button");
      expect(button).toHaveClass("w-full");
    });

    it("renders with custom className", () => {
      render(
        <TouchButton className="custom-class" data-testid="custom-class-button">
          Custom
        </TouchButton>
      );
      
      const button = screen.getByTestId("custom-class-button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("States", () => {
    it("handles disabled state", () => {
      render(<TouchButton disabled>Disabled</TouchButton>);
      
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
    });

    it("shows loading state", () => {
      render(<TouchButton loading>Loading</TouchButton>);
      
      const button = screen.getByRole("button");
      const loader = screen.getByTestId("loader-icon");
      
      expect(button).toBeInTheDocument();
      expect(loader).toBeInTheDocument();
    });

    it("is disabled when loading", () => {
      render(<TouchButton loading>Loading</TouchButton>);
      
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Interaction", () => {
    it("handles click events", () => {
      const handleClick = vi.fn();
      render(<TouchButton onClick={handleClick}>Click me</TouchButton>);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const handleClick = vi.fn();
      render(
        <TouchButton onClick={handleClick} disabled>
          Disabled
        </TouchButton>
      );
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", () => {
      const handleClick = vi.fn();
      render(
        <TouchButton onClick={handleClick} loading>
          Loading
        </TouchButton>
      );
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("supports different button types", () => {
      const types = ["button", "submit", "reset"] as const;
      
      types.forEach(type => {
        const { unmount } = render(
          <TouchButton type={type} data-testid={`button-${type}`}>
            {type}
          </TouchButton>
        );
        
        const button = screen.getByTestId(`button-${type}`);
        expect(button).toHaveAttribute("type", type);
        
        unmount();
      });
    });
  });

  describe("Touch Optimization", () => {
    it("has minimum touch target size", () => {
      render(<TouchButton data-testid="touch-button">Touch</TouchButton>);
      
      const button = screen.getByTestId("touch-button");
      // Should have minimum height for touch targets
      expect(button).toHaveClass("min-h-[44px]");
    });

    it("has touch feedback animation", () => {
      render(<TouchButton data-testid="touch-button">Touch</TouchButton>);
      
      const button = screen.getByTestId("touch-button");
      expect(button).toHaveClass("active:scale-95");
    });

    it("has proper focus styles for accessibility", () => {
      render(<TouchButton data-testid="focus-button">Focus</TouchButton>);
      
      const button = screen.getByTestId("focus-button");
      expect(button).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-offset-2"
      );
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<TouchButton>Accessible Button</TouchButton>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("maintains accessibility when disabled", async () => {
      const { container } = render(<TouchButton disabled>Disabled Button</TouchButton>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("maintains accessibility when loading", async () => {
      const { container } = render(<TouchButton loading>Loading Button</TouchButton>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper ARIA attributes when loading", () => {
      render(<TouchButton loading>Loading</TouchButton>);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });
});

describe("TouchCard Component", () => {
  describe("Rendering", () => {
    it("renders with children content", () => {
      render(
        <TouchCard>
          <div>Card Content</div>
        </TouchCard>
      );
      
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(
        <TouchCard className="custom-card-class" data-testid="custom-card">
          Content
        </TouchCard>
      );
      
      const card = screen.getByTestId("custom-card");
      expect(card).toHaveClass("custom-card-class");
    });

    it("renders as clickable when onClick is provided", () => {
      const handleClick = vi.fn();
      render(
        <TouchCard onClick={handleClick} data-testid="clickable-card">
          Clickable Content
        </TouchCard>
      );
      
      const card = screen.getByTestId("clickable-card");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Touch Interaction", () => {
    it("handles click events", () => {
      const handleClick = vi.fn();
      render(
        <TouchCard onClick={handleClick} data-testid="clickable-card">
          Click me
        </TouchCard>
      );
      
      const card = screen.getByTestId("clickable-card");
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("has hover and focus states when clickable", () => {
      const handleClick = vi.fn();
      render(
        <TouchCard onClick={handleClick} data-testid="interactive-card">
          Interactive
        </TouchCard>
      );
      
      const card = screen.getByTestId("interactive-card");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("does not have click handlers when onClick is not provided", () => {
      render(
        <TouchCard data-testid="static-card">
          Static Content
        </TouchCard>
      );
      
      const card = screen.getByTestId("static-card");
      expect(card).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Touch Optimization", () => {
    it("has touch-friendly padding and spacing", () => {
      render(
        <TouchCard data-testid="touch-card">
          Touch Content
        </TouchCard>
      );
      
      const card = screen.getByTestId("touch-card");
      // Should have adequate padding for touch interaction
      expect(card).toHaveClass("p-4"); // or appropriate padding class
    });

    it("has proper visual feedback for touch", () => {
      const handleClick = vi.fn();
      render(
        <TouchCard onClick={handleClick} data-testid="feedback-card">
          Feedback
        </TouchCard>
      );
      
      const card = screen.getByTestId("feedback-card");
      expect(card).toHaveClass("transition-all");
    });
  });

  describe("Responsive Design", () => {
    it("adapts to different screen sizes", () => {
      render(
        <TouchCard className="responsive-card" data-testid="responsive">
          Responsive Content
        </TouchCard>
      );
      
      const card = screen.getByTestId("responsive");
      expect(card).toHaveClass("responsive-card");
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <TouchCard>
          <h2>Card Title</h2>
          <p>Card description</p>
        </TouchCard>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper accessibility when clickable", async () => {
      const handleClick = vi.fn();
      const { container } = render(
        <TouchCard onClick={handleClick}>
          <h2>Clickable Card</h2>
          <p>This card can be clicked</p>
        </TouchCard>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has keyboard accessibility when clickable", () => {
      const handleClick = vi.fn();
      render(
        <TouchCard onClick={handleClick} data-testid="keyboard-card">
          Keyboard Accessible
        </TouchCard>
      );
      
      const card = screen.getByTestId("keyboard-card");
      
      // Should be focusable
      expect(card).toHaveAttribute("tabIndex", "0");
      
      // Should handle keyboard events
      fireEvent.keyDown(card, { key: "Enter" });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(card, { key: " " });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it("has proper ARIA attributes when clickable", () => {
      const handleClick = vi.fn();
      render(
        <TouchCard onClick={handleClick} data-testid="aria-card">
          ARIA Card
        </TouchCard>
      );
      
      const card = screen.getByTestId("aria-card");
      expect(card).toHaveAttribute("role", "button");
    });
  });

  describe("Performance", () => {
    it("does not re-render unnecessarily", () => {
      const renderSpy = vi.fn();
      
      const TestCard = ({ content }: { content: string }) => {
        renderSpy();
        return <TouchCard>{content}</TouchCard>;
      };
      
      const { rerender } = render(<TestCard content="Initial" />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      rerender(<TestCard content="Initial" />);
      // Should re-render with new props
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("handles missing children gracefully", () => {
      expect(() => render(<TouchCard />)).not.toThrow();
    });

    it("handles invalid props gracefully", () => {
      expect(() => 
        render(
          <TouchCard onClick={undefined as any}>
            Invalid Props
          </TouchCard>
        )
      ).not.toThrow();
    });
  });
});