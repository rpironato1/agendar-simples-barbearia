// Mobile-first responsive breakpoints optimized for React Native compatibility
export const BREAKPOINTS = {
  mobile: 375, // iPhone SE and similar
  tablet: 768, // iPad mini and similar
  desktop: 1024, // Laptop and up
  wide: 1440, // Desktop wide
} as const;

export const MOBILE_FIRST_QUERIES = {
  mobile: `(min-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
} as const;

// Touch-optimized sizes for mobile-first design
export const TOUCH_SIZES = {
  minTouch: 44, // Minimum touch target (iOS/Android guidelines)
  comfortableTouch: 48, // Comfortable touch target
  iconSize: 24, // Standard icon size
  buttonHeight: 44, // Standard button height
  inputHeight: 48, // Standard input height
} as const;

// App configuration constants
export const APP_CONFIG = {
  name: "Elite Barber",
  version: "1.0.0",
  api: {
    timeout: 30000,
    retries: 3,
  },
  storage: {
    prefix: "eliteBarber_",
    version: "1.0",
  },
} as const;

// Business constants
export const BUSINESS_CONSTANTS = {
  maxBookingsPerDay: 20,
  workingHours: {
    start: 9,
    end: 19,
  },
  serviceCategories: ["hair", "beard", "combo", "extras"] as const,
  subscriptionPlans: ["basic", "premium", "enterprise"] as const,
} as const;
