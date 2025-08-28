import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import NotFound from "./NotFound";

expect.extend(toHaveNoViolations);

// Mock console.error to test error logging
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: "/test-path" })),
  };
});

const renderNotFound = (pathname = "/non-existent-route") => {
  const { useLocation } = await import("react-router-dom");
  vi.mocked(useLocation).mockReturnValue({ pathname });

  return render(
    <BrowserRouter>
      <NotFound />
    </BrowserRouter>
  );
};

describe("NotFound", () => {
  afterEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("Rendering", () => {
    it("renders 404 page with correct content", () => {
      renderNotFound();
      
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveAttribute("aria-label", "Página não encontrada");
      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Oops! Página não encontrada")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Voltar para a página inicial" })).toBeInTheDocument();
    });

    it("renders with correct styles and structure", () => {
      renderNotFound();
      
      const container = screen.getByRole("main").parentElement;
      expect(container).toHaveClass("min-h-screen", "flex", "items-center", "justify-center", "bg-white");
      
      const heading = screen.getByText("404");
      expect(heading).toHaveClass("text-4xl", "font-bold", "mb-4", "text-gray-900");
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/");
      expect(link).toHaveClass("text-blue-700", "hover:text-blue-900", "underline", "font-medium");
    });
  });

  describe("Functionality", () => {
    it("logs error with pathname on mount", async () => {
      const testPath = "/invalid/path";
      const { useLocation } = await import("react-router-dom");
      vi.mocked(useLocation).mockReturnValue({ pathname: testPath });
      
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        "404 Error: User attempted to access non-existent route:",
        testPath
      );
    });

    it("logs error when pathname changes", async () => {
      const { useLocation } = await import("react-router-dom");
      vi.mocked(useLocation).mockReturnValue({ pathname: "/first-path" });
      
      const { rerender } = render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        "404 Error: User attempted to access non-existent route:",
        "/first-path"
      );
      
      // Clear previous calls
      mockConsoleError.mockClear();
      
      // Update mock for different path
      vi.mocked(useLocation).mockReturnValue({ pathname: "/second-path" });
      
      rerender(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>
      );
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        "404 Error: User attempted to access non-existent route:",
        "/second-path"
      );
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderNotFound();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper ARIA labels and semantic HTML", () => {
      renderNotFound();
      
      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "Página não encontrada");
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-label", "Voltar para a página inicial");
      
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("has appropriate color contrast", () => {
      renderNotFound();
      
      const heading = screen.getByText("404");
      expect(heading).toHaveClass("text-gray-900");
      
      const description = screen.getByText("Oops! Página não encontrada");
      expect(description).toHaveClass("text-gray-700");
      
      const link = screen.getByRole("link");
      expect(link).toHaveClass("text-blue-700");
    });
  });

  describe("Navigation", () => {
    it("provides correct navigation link to home", () => {
      renderNotFound();
      
      const homeLink = screen.getByRole("link", { name: "Voltar para a página inicial" });
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Error Handling", () => {
    it("handles different pathname formats", async () => {
      const testPaths = [
        "/",
        "/admin",
        "/user/123",
        "/very/deep/nested/path",
        "/special-characters-@#$%",
        ""
      ];

      const { useLocation } = await import("react-router-dom");

      testPaths.forEach(path => {
        mockConsoleError.mockClear();
        vi.mocked(useLocation).mockReturnValue({ pathname: path });
        
        render(
          <BrowserRouter>
            <NotFound />
          </BrowserRouter>
        );
        
        expect(mockConsoleError).toHaveBeenCalledWith(
          "404 Error: User attempted to access non-existent route:",
          path
        );
      });
    });
  });
});