import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";
import { render, screen } from "@testing-library/react";

describe("Button Component", () => {
  it("renders button with default variant", () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeInTheDocument();
  });

  it("renders button with custom text", () => {
    render(<Button>Custom Text</Button>);
    const button = screen.getByRole("button", { name: /custom text/i });
    expect(button).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
  });
});
