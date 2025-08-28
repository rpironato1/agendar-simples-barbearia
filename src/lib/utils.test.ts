import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("Utils Library", () => {
  it("should combine class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    expect(cn()).toBe("");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "conditional")).toBe("base");
    expect(cn("base", true && "conditional")).toBe("base conditional");
  });
});
