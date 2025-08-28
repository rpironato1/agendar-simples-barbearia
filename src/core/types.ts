// Platform-agnostic types for maximum compatibility with React Native
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "client" | "barbershop" | "admin";
  barbershopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Barbershop {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  subscriptionPlan: "basic" | "premium" | "enterprise";
  subscriptionStatus: "active" | "cancelled" | "trial";
  subscriptionExpiresAt: string;
  settings: {
    workingHours: {
      [key: string]: { start: string; end: string; enabled: boolean };
    };
    services: Service[];
    barbeiros: Barbeiro[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: "hair" | "beard" | "combo" | "extras";
  barbershopId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Barbeiro {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  barbershopId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  barbershopId: string;
  barbeiroId: string;
  serviceId: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  barbershopId: string;
  amount: number;
  method: "cash" | "card" | "pix" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Mobile-specific interfaces
export interface TouchEvent {
  clientX: number;
  clientY: number;
  touches: Touch[];
}

export interface DeviceInfo {
  platform: "web" | "ios" | "android";
  isTablet: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Navigation types for cross-platform routing
export interface NavigationRoute {
  name: string;
  path: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
  roles?: User["role"][];
}

// State management types
export interface AppState {
  user: User | null;
  barbershop: Barbershop | null;
  isLoading: boolean;
  isOnline: boolean;
  deviceInfo: DeviceInfo;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

// Component prop types for reusability
export interface BaseComponentProps {
  className?: string;
  testId?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
