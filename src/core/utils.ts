// Platform-agnostic utility functions
import { BREAKPOINTS } from "./constants";
import type { DeviceInfo, ValidationResult } from "./types";

// Device detection utilities
export const getDeviceInfo = (): DeviceInfo => {
  const width = typeof window !== "undefined" ? window.innerWidth : 375;
  const height = typeof window !== "undefined" ? window.innerHeight : 667;

  return {
    platform: "web", // Can be overridden in React Native
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isMobile: width < BREAKPOINTS.tablet,
    screenWidth: width,
    screenHeight: height,
  };
};

// Responsive utility functions
export const isMobile = (width?: number): boolean => {
  const screenWidth =
    width || (typeof window !== "undefined" ? window.innerWidth : 375);
  return screenWidth < BREAKPOINTS.tablet;
};

export const isTablet = (width?: number): boolean => {
  const screenWidth =
    width || (typeof window !== "undefined" ? window.innerWidth : 768);
  return screenWidth >= BREAKPOINTS.tablet && screenWidth < BREAKPOINTS.desktop;
};

export const isDesktop = (width?: number): boolean => {
  const screenWidth =
    width || (typeof window !== "undefined" ? window.innerWidth : 1024);
  return screenWidth >= BREAKPOINTS.desktop;
};

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (password.length < 8) {
    errors.length = "Senha deve ter pelo menos 8 caracteres";
  }

  if (!/[A-Z]/.test(password)) {
    errors.uppercase = "Senha deve conter pelo menos uma letra maiúscula";
  }

  if (!/[a-z]/.test(password)) {
    errors.lowercase = "Senha deve conter pelo menos uma letra minúscula";
  }

  if (!/\d/.test(password)) {
    errors.number = "Senha deve conter pelo menos um número";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Date utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:MM
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
};

export const isTimeSlotAvailable = (
  time: string,
  bookedSlots: string[],
  duration: number
): boolean => {
  const [hours, minutes] = time.split(":").map(Number);
  const startTime = hours * 60 + minutes;
  const endTime = startTime + duration;

  return !bookedSlots.some((bookedTime) => {
    const [bookedHours, bookedMinutes] = bookedTime.split(":").map(Number);
    const bookedStart = bookedHours * 60 + bookedMinutes;
    const bookedEnd = bookedStart + duration; // Assuming same duration

    return startTime < bookedEnd && endTime > bookedStart;
  });
};

// Currency utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// Storage utilities (platform-agnostic)
export const storage = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },

  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};

// Async utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
