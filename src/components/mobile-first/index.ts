// Mobile-first component library exports
export * from "./ResponsiveLayout";
export * from "./TouchComponents";

// Re-export core utilities for mobile development
export {
  BREAKPOINTS,
  TOUCH_SIZES,
  MOBILE_FIRST_QUERIES,
} from "@/core/constants";
export { isMobile, isTablet, isDesktop, getDeviceInfo } from "@/core/utils";
export {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useScreenSize,
} from "@/hooks/use-mobile";
