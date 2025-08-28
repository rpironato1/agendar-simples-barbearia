import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

expect.extend(toHaveNoViolations);

describe("Card Components", () => {
  describe("Card", () => {
    it("renders with default styles", () => {
      render(<Card data-testid="card">Card content</Card>);
      
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "rounded-lg",
        "border",
        "bg-card",
        "text-card-foreground",
        "shadow-sm"
      );
    });

    it("accepts custom className", () => {
      render(
        <Card data-testid="card" className="custom-class">
          Card content
        </Card>
      );
      
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("custom-class");
      expect(card).toHaveClass("rounded-lg"); // Should still have default classes
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Card content</Card>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("passes through HTML attributes", () => {
      render(
        <Card data-testid="card" id="test-card" role="region">
          Card content
        </Card>
      );
      
      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("id", "test-card");
      expect(card).toHaveAttribute("role", "region");
    });
  });

  describe("CardHeader", () => {
    it("renders with default styles", () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>);
      
      const header = screen.getByTestId("card-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        "flex",
        "flex-col",
        "space-y-1.5",
        "p-6"
      );
    });

    it("accepts custom className", () => {
      render(
        <CardHeader data-testid="card-header" className="custom-header">
          Header content
        </CardHeader>
      );
      
      const header = screen.getByTestId("card-header");
      expect(header).toHaveClass("custom-header");
      expect(header).toHaveClass("flex"); // Should still have default classes
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardHeader ref={ref}>Header content</CardHeader>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("CardTitle", () => {
    it("renders as h3 element with default styles", () => {
      render(<CardTitle data-testid="card-title">Title content</CardTitle>);
      
      const title = screen.getByTestId("card-title");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H3");
      expect(title).toHaveClass(
        "text-2xl",
        "font-semibold",
        "leading-none",
        "tracking-tight"
      );
    });

    it("is accessible as a heading", () => {
      render(<CardTitle>Accessible Title</CardTitle>);
      
      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("Accessible Title");
    });

    it("accepts custom className", () => {
      render(
        <CardTitle data-testid="card-title" className="custom-title">
          Title content
        </CardTitle>
      );
      
      const title = screen.getByTestId("card-title");
      expect(title).toHaveClass("custom-title");
      expect(title).toHaveClass("text-2xl"); // Should still have default classes
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardTitle ref={ref}>Title content</CardTitle>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLHeadingElement));
    });
  });

  describe("CardDescription", () => {
    it("renders as p element with default styles", () => {
      render(
        <CardDescription data-testid="card-description">
          Description content
        </CardDescription>
      );
      
      const description = screen.getByTestId("card-description");
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe("P");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("accepts custom className", () => {
      render(
        <CardDescription data-testid="card-description" className="custom-desc">
          Description content
        </CardDescription>
      );
      
      const description = screen.getByTestId("card-description");
      expect(description).toHaveClass("custom-desc");
      expect(description).toHaveClass("text-sm"); // Should still have default classes
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardDescription ref={ref}>Description content</CardDescription>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLParagraphElement));
    });
  });

  describe("CardContent", () => {
    it("renders with default styles", () => {
      render(
        <CardContent data-testid="card-content">Content body</CardContent>
      );
      
      const content = screen.getByTestId("card-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("p-6", "pt-0");
    });

    it("accepts custom className", () => {
      render(
        <CardContent data-testid="card-content" className="custom-content">
          Content body
        </CardContent>
      );
      
      const content = screen.getByTestId("card-content");
      expect(content).toHaveClass("custom-content");
      expect(content).toHaveClass("p-6"); // Should still have default classes
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardContent ref={ref}>Content body</CardContent>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("CardFooter", () => {
    it("renders with default styles", () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);
      
      const footer = screen.getByTestId("card-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });

    it("accepts custom className", () => {
      render(
        <CardFooter data-testid="card-footer" className="custom-footer">
          Footer content
        </CardFooter>
      );
      
      const footer = screen.getByTestId("card-footer");
      expect(footer).toHaveClass("custom-footer");
      expect(footer).toHaveClass("flex"); // Should still have default classes
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<CardFooter ref={ref}>Footer content</CardFooter>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("Complete Card Structure", () => {
    it("renders a complete card with all components", () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main card content</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      // Check all components are present
      expect(screen.getByTestId("complete-card")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Card Title");
      expect(screen.getByText("Card description text")).toBeInTheDocument();
      expect(screen.getByText("Main card content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action Button" })).toBeInTheDocument();
    });

    it("maintains proper semantic structure", () => {
      render(
        <Card role="article">
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
            <CardDescription>Article subtitle</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Article content goes here.</p>
          </CardContent>
          <CardFooter>
            <span>Footer information</span>
          </CardFooter>
        </Card>
      );

      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();
      
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>This card is accessible</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content with proper structure</p>
          </CardContent>
          <CardFooter>
            <button type="button">Accessible Action</button>
          </CardFooter>
        </Card>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("supports ARIA attributes", () => {
      render(
        <Card
          role="region"
          aria-labelledby="card-title"
          aria-describedby="card-desc"
        >
          <CardHeader>
            <CardTitle id="card-title">Labeled Card</CardTitle>
            <CardDescription id="card-desc">Card with ARIA labels</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByRole("region");
      expect(card).toHaveAttribute("aria-labelledby", "card-title");
      expect(card).toHaveAttribute("aria-describedby", "card-desc");
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive classes correctly", () => {
      render(
        <Card className="w-full md:w-1/2 lg:w-1/3">
          <CardContent className="p-2 md:p-4 lg:p-6">
            Responsive content
          </CardContent>
        </Card>
      );

      const card = screen.getByText("Responsive content").closest(".rounded-lg");
      expect(card).toHaveClass("w-full", "md:w-1/2", "lg:w-1/3");
      
      const content = screen.getByText("Responsive content");
      expect(content).toHaveClass("p-2", "md:p-4", "lg:p-6");
    });
  });

  describe("Integration with other components", () => {
    it("works with form elements", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Form Card</CardTitle>
            <CardDescription>Fill out the form below</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <label htmlFor="test-input">Test Input:</label>
              <input id="test-input" type="text" />
            </form>
          </CardContent>
          <CardFooter>
            <button type="submit">Submit</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByLabelText("Test Input:")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    });

    it("works with interactive elements", () => {
      const handleClick = vi.fn();
      
      render(
        <Card onClick={handleClick} className="cursor-pointer">
          <CardHeader>
            <CardTitle>Clickable Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Click anywhere on this card</p>
          </CardContent>
        </Card>
      );

      const card = screen.getByText("Click anywhere on this card").closest(".rounded-lg");
      expect(card).toHaveClass("cursor-pointer");
    });
  });
});