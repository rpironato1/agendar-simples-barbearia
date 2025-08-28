import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, MockedFunction } from "vitest";
import { AuthProvider, useAuth } from "./useAuth";
import { db } from "@/lib/database";
import type { User, Session, AuthResponse, AuthError } from "@supabase/supabase-js";

// Mock the database module
vi.mock("@/lib/database", () => ({
  db: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockDb = db as any;

// Mock user and session data
const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: {},
  app_metadata: {},
  aud: "authenticated",
  created_at: "2023-01-01T00:00:00Z",
} as User;

const mockSession: Session = {
  access_token: "mock-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  refresh_token: "mock-refresh",
  user: mockUser,
} as Session;

const mockProfile = {
  id: "test-profile-id",
  user_id: "test-user-id",
  name: "Test User",
  phone: "123456789",
  role: "user",
};

const mockBarbershopData = {
  id: "test-barbershop-id",
  name: "Test Barbershop",
  address: "Test Address",
  phone: "987654321",
};

// Helper to render hook with provider
const renderUseAuth = () => {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
};

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockDb.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockDb.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockDb.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    
    // Mock database queries
    mockDb.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
    });
  });

  describe("Initial State", () => {
    it("initializes with loading state", () => {
      const { result } = renderUseAuth();
      
      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.session).toBe(null);
      expect(result.current.profile).toBe(null);
      expect(result.current.userRole).toBe(null);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isBarbershop).toBe(false);
    });

    it("provides all required auth methods", () => {
      const { result } = renderUseAuth();
      
      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
      expect(typeof result.current.signUpBarbershop).toBe("function");
      expect(typeof result.current.signOut).toBe("function");
    });
  });

  describe("User Authentication", () => {
    it("handles successful sign in", async () => {
      const signInResponse: AuthResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      };
      
      mockDb.auth.signInWithPassword.mockResolvedValue(signInResponse);
      
      const { result } = renderUseAuth();
      
      await act(async () => {
        const response = await result.current.signIn("test@example.com", "password");
        expect(response.data).toEqual(signInResponse.data);
        expect(response.error).toBe(null);
      });
      
      expect(mockDb.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password",
      });
    });

    it("handles sign in error", async () => {
      const authError: AuthError = {
        name: "AuthError",
        message: "Invalid credentials",
        status: 400,
      };
      
      const signInResponse: AuthResponse = {
        data: { user: null, session: null },
        error: authError,
      };
      
      mockDb.auth.signInWithPassword.mockResolvedValue(signInResponse);
      
      const { result } = renderUseAuth();
      
      await act(async () => {
        const response = await result.current.signIn("wrong@example.com", "wrongpassword");
        expect(response.error).toEqual(authError);
        expect(response.data.user).toBe(null);
      });
    });

    it("handles successful sign up", async () => {
      const signUpResponse: AuthResponse = {
        data: { user: mockUser, session: null },
        error: null,
      };
      
      mockDb.auth.signUp.mockResolvedValue(signUpResponse);
      mockDb.from().insert().mockResolvedValue({ data: mockProfile, error: null });
      
      const { result } = renderUseAuth();
      
      await act(async () => {
        const response = await result.current.signUp(
          "new@example.com",
          "password",
          "New User",
          "123456789"
        );
        expect(response.data).toEqual(signUpResponse.data);
        expect(response.error).toBe(null);
      });
      
      expect(mockDb.auth.signUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password",
        options: {
          data: {
            name: "New User",
            phone: "123456789",
          },
        },
      });
    });

    it("handles barbershop sign up", async () => {
      const signUpResponse: AuthResponse = {
        data: { user: mockUser, session: null },
        error: null,
      };
      
      mockDb.auth.signUp.mockResolvedValue(signUpResponse);
      mockDb.from().insert().mockResolvedValue({ data: mockProfile, error: null });
      mockDb.from().upsert().mockResolvedValue({ data: mockBarbershopData, error: null });
      
      const { result } = renderUseAuth();
      
      const barbershopData = {
        name: "Test Barbershop",
        address: "Test Address",
        phone: "987654321",
      };
      
      await act(async () => {
        const response = await result.current.signUpBarbershop(
          "barbershop@example.com",
          "password",
          barbershopData
        );
        expect(response.data).toEqual(signUpResponse.data);
        expect(response.error).toBe(null);
      });
    });

    it("handles sign out", async () => {
      mockDb.auth.signOut.mockResolvedValue({ error: null });
      
      const { result } = renderUseAuth();
      
      await act(async () => {
        await result.current.signOut();
      });
      
      expect(mockDb.auth.signOut).toHaveBeenCalled();
    });
  });

  describe("Role Management", () => {
    it("correctly identifies admin role", async () => {
      const adminProfile = { ...mockProfile, role: "admin" };
      mockDb.from().select().eq().single.mockResolvedValue({ data: adminProfile, error: null });
      mockDb.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockDb.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isBarbershop).toBe(false);
      expect(result.current.userRole).toBe("admin");
    });

    it("correctly identifies barbershop role", async () => {
      const barbershopProfile = { ...mockProfile, role: "barbershop" };
      mockDb.from().select().eq().single.mockResolvedValue({ data: barbershopProfile, error: null });
      mockDb.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockDb.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isBarbershop).toBe(true);
      expect(result.current.userRole).toBe("barbershop");
    });

    it("correctly identifies regular user role", async () => {
      mockDb.from().select().eq().single.mockResolvedValue({ data: mockProfile, error: null });
      mockDb.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockDb.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isBarbershop).toBe(false);
      expect(result.current.userRole).toBe("user");
    });
  });

  describe("Profile Loading", () => {
    it("loads user profile on authentication", async () => {
      mockDb.from().select().eq().single.mockResolvedValue({ data: mockProfile, error: null });
      mockDb.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockDb.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.profile).toEqual(mockProfile);
    });

    it("loads barbershop data for barbershop users", async () => {
      const barbershopProfile = { ...mockProfile, role: "barbershop" };
      mockDb.from().select().eq().single
        .mockResolvedValueOnce({ data: barbershopProfile, error: null })
        .mockResolvedValueOnce({ data: mockBarbershopData, error: null });
      
      mockDb.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockDb.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.barbershopData).toEqual(mockBarbershopData);
      expect(result.current.currentBarbershopId).toBe(mockBarbershopData.id);
    });

    it("handles profile loading errors gracefully", async () => {
      mockDb.from().select().eq().single.mockResolvedValue({ 
        data: null, 
        error: { message: "Profile not found" } 
      });
      mockDb.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockDb.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.profile).toBe(null);
      expect(result.current.userRole).toBe(null);
    });
  });

  describe("Error Handling", () => {
    it("handles context usage outside provider", () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");
    });

    it("handles database connection errors", async () => {
      mockDb.auth.getUser.mockRejectedValue(new Error("Database connection failed"));
      
      const { result } = renderUseAuth();
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.user).toBe(null);
      expect(result.current.session).toBe(null);
    });
  });

  describe("State Updates", () => {
    it("updates state when auth state changes", async () => {
      let authStateCallback: Function;
      
      mockDb.auth.onAuthStateChange.mockImplementation((callback: Function) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });
      
      const { result } = renderUseAuth();
      
      // Simulate auth state change
      await act(async () => {
        authStateCallback("SIGNED_IN", mockSession);
      });
      
      // Verify that the callback was registered
      expect(mockDb.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it("cleans up auth listener on unmount", () => {
      const unsubscribeMock = vi.fn();
      mockDb.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      });
      
      const { unmount } = renderUseAuth();
      
      unmount();
      
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});