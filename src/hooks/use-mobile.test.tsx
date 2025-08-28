import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useIsMobile, useIsTablet, useIsDesktop, useScreenSize } from "./use-mobile";

// Mock the constants
vi.mock("@/core/constants", () => ({
  BREAKPOINTS: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },
}));

describe("Mobile Detection Hooks", () => {
  let mockMatchMedia: any;
  let mockInnerWidth: number;

  beforeEach(() => {
    // Mock window.matchMedia
    mockMatchMedia = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });

    // Mock window.innerWidth
    mockInnerWidth = 1024;
    Object.defineProperty(window, "innerWidth", {
      get: () => mockInnerWidth,
      configurable: true,
    });

    // Default matchMedia implementation
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("useIsMobile", () => {
    it("should return false for desktop screen", () => {
      mockInnerWidth = 1200;
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    it("should return true for mobile screen", () => {
      mockInnerWidth = 600;
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    it("should return true for tablet boundary (767px)", () => {
      mockInnerWidth = 767;
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    it("should return false for tablet boundary (768px)", () => {
      mockInnerWidth = 768;
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    it("should listen to media query changes", () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { unmount } = renderHook(() => useIsMobile());
      
      expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
      expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should update state when media query changes", () => {
      let mediaChangeHandler: Function;
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: (event: string, handler: Function) => {
          if (event === "change") {
            mediaChangeHandler = handler;
          }
        },
        removeEventListener: vi.fn(),
      });

      mockInnerWidth = 1200;
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);

      // Simulate screen resize to mobile
      act(() => {
        mockInnerWidth = 600;
        mediaChangeHandler();
      });

      expect(result.current).toBe(true);
    });
  });

  describe("useIsTablet", () => {
    it("should return true for tablet screen (768px)", () => {
      mockInnerWidth = 768;
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(true);
    });

    it("should return true for tablet screen (900px)", () => {
      mockInnerWidth = 900;
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(true);
    });

    it("should return true for tablet boundary (1023px)", () => {
      mockInnerWidth = 1023;
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(true);
    });

    it("should return false for desktop boundary (1024px)", () => {
      mockInnerWidth = 1024;
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(false);
    });

    it("should return false for mobile screen (600px)", () => {
      mockInnerWidth = 600;
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(false);
    });

    it("should return false for desktop screen (1200px)", () => {
      mockInnerWidth = 1200;
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(false);
    });

    it("should listen to media query changes", () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { unmount } = renderHook(() => useIsTablet());
      
      expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 768px) and (max-width: 1023px)");
      expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should update state when media query changes", () => {
      let mediaChangeHandler: Function;
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: (event: string, handler: Function) => {
          if (event === "change") {
            mediaChangeHandler = handler;
          }
        },
        removeEventListener: vi.fn(),
      });

      mockInnerWidth = 600; // mobile
      const { result } = renderHook(() => useIsTablet());
      
      expect(result.current).toBe(false);

      // Simulate screen resize to tablet
      act(() => {
        mockInnerWidth = 800;
        mediaChangeHandler();
      });

      expect(result.current).toBe(true);

      // Simulate screen resize to desktop
      act(() => {
        mockInnerWidth = 1200;
        mediaChangeHandler();
      });

      expect(result.current).toBe(false);
    });
  });

  describe("useIsDesktop", () => {
    it("should return true for desktop screen (1024px)", () => {
      mockInnerWidth = 1024;
      const { result } = renderHook(() => useIsDesktop());
      
      expect(result.current).toBe(true);
    });

    it("should return true for large desktop screen (1200px)", () => {
      mockInnerWidth = 1200;
      const { result } = renderHook(() => useIsDesktop());
      
      expect(result.current).toBe(true);
    });

    it("should return false for tablet screen (900px)", () => {
      mockInnerWidth = 900;
      const { result } = renderHook(() => useIsDesktop());
      
      expect(result.current).toBe(false);
    });

    it("should return false for mobile screen (600px)", () => {
      mockInnerWidth = 600;
      const { result } = renderHook(() => useIsDesktop());
      
      expect(result.current).toBe(false);
    });

    it("should return false for tablet boundary (1023px)", () => {
      mockInnerWidth = 1023;
      const { result } = renderHook(() => useIsDesktop());
      
      expect(result.current).toBe(false);
    });

    it("should listen to media query changes", () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { unmount } = renderHook(() => useIsDesktop());
      
      expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
      expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should update state when media query changes", () => {
      let mediaChangeHandler: Function;
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: (event: string, handler: Function) => {
          if (event === "change") {
            mediaChangeHandler = handler;
          }
        },
        removeEventListener: vi.fn(),
      });

      mockInnerWidth = 800; // tablet
      const { result } = renderHook(() => useIsDesktop());
      
      expect(result.current).toBe(false);

      // Simulate screen resize to desktop
      act(() => {
        mockInnerWidth = 1200;
        mediaChangeHandler();
      });

      expect(result.current).toBe(true);

      // Simulate screen resize back to tablet
      act(() => {
        mockInnerWidth = 900;
        mediaChangeHandler();
      });

      expect(result.current).toBe(false);
    });
  });

  describe("useScreenSize", () => {
    it("should return mobile for mobile screen", () => {
      mockInnerWidth = 600;
      const { result } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("mobile");
    });

    it("should return tablet for tablet screen", () => {
      mockInnerWidth = 800;
      const { result } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("tablet");
    });

    it("should return desktop for desktop screen", () => {
      mockInnerWidth = 1200;
      const { result } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("desktop");
    });

    it("should return wide for wide screen", () => {
      mockInnerWidth = 1400;
      const { result } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("wide");
    });

    it("should handle boundary values correctly", () => {
      // Test exact breakpoint values
      const testCases = [
        { width: 767, expected: "mobile" },
        { width: 768, expected: "tablet" },
        { width: 1023, expected: "tablet" },
        { width: 1024, expected: "desktop" },
        { width: 1279, expected: "desktop" },
        { width: 1280, expected: "wide" },
      ];

      testCases.forEach(({ width, expected }) => {
        mockInnerWidth = width;
        const { result } = renderHook(() => useScreenSize());
        expect(result.current).toBe(expected);
      });
    });

    it("should update when screen size changes", () => {
      let resizeHandler: Function;
      
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();
      
      // Mock window.addEventListener for resize event
      vi.spyOn(window, "addEventListener").mockImplementation((event, handler) => {
        if (event === "resize") {
          resizeHandler = handler as Function;
        }
        return mockAddEventListener(event, handler);
      });
      
      vi.spyOn(window, "removeEventListener").mockImplementation(mockRemoveEventListener);

      mockInnerWidth = 600; // mobile
      const { result, unmount } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("mobile");

      // Simulate resize to tablet
      act(() => {
        mockInnerWidth = 800;
        resizeHandler();
      });

      expect(result.current).toBe("tablet");

      // Simulate resize to desktop
      act(() => {
        mockInnerWidth = 1200;
        resizeHandler();
      });

      expect(result.current).toBe("desktop");

      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined window.innerWidth gracefully", () => {
      Object.defineProperty(window, "innerWidth", {
        get: () => undefined,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      // Should default to false when width is undefined
      expect(result.current).toBe(false);
    });

    it("should handle very large screen sizes", () => {
      mockInnerWidth = 5000;
      const { result } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("wide");
    });

    it("should handle very small screen sizes", () => {
      mockInnerWidth = 200;
      const { result } = renderHook(() => useScreenSize());
      
      expect(result.current).toBe("mobile");
    });

    it("should clean up event listeners on unmount", () => {
      const mockRemoveEventListener = vi.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
      });

      const { unmount: unmountMobile } = renderHook(() => useIsMobile());
      const { unmount: unmountTablet } = renderHook(() => useIsTablet());
      const { unmount: unmountDesktop } = renderHook(() => useIsDesktop());

      unmountMobile();
      unmountTablet();
      unmountDesktop();

      expect(mockRemoveEventListener).toHaveBeenCalledTimes(3);
    });
  });

  describe("Performance", () => {
    it("should not create new handlers on every render", () => {
      const mockAddEventListener = vi.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      });

      const { rerender } = renderHook(() => useIsMobile());
      
      const firstCallHandler = mockAddEventListener.mock.calls[0][1];
      
      rerender();
      
      // Should not add listener again on rerender
      expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    });

    it("should debounce rapid resize events correctly", () => {
      let resizeHandler: Function;
      
      vi.spyOn(window, "addEventListener").mockImplementation((event, handler) => {
        if (event === "resize") {
          resizeHandler = handler as Function;
        }
      });

      const { result } = renderHook(() => useScreenSize());
      
      mockInnerWidth = 600;
      
      // Simulate rapid resize events
      act(() => {
        resizeHandler();
        resizeHandler();
        resizeHandler();
      });

      expect(result.current).toBe("mobile");
    });
  });
});