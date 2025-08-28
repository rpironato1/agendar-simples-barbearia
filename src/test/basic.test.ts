import { describe, it, expect } from "vitest";

describe("Utils", () => {
  it("should run basic math operations", () => {
    expect(2 + 2).toBe(4);
    expect(3 * 3).toBe(9);
  });

  it("should handle string operations", () => {
    expect("hello".length).toBe(5);
    expect("world".toUpperCase()).toBe("WORLD");
  });
});
