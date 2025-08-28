import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the supabase module
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

// Mock the localStorage module
vi.mock("./localStorage", () => ({
  localDb: {
    profiles: {},
    barbershops: {},
    services: {},
  },
  createLocalClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
    setContext: vi.fn(),
  })),
}));

// Mock environment variable
const mockEnv = vi.hoisted(() => ({
  VITE_USE_SUPABASE: "false",
  DEV: false,
}));

vi.stubGlobal("import.meta", {
  env: mockEnv,
});

// Mock URL and Blob for export functionality
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "mock-url"),
  revokeObjectURL: vi.fn(),
});

vi.stubGlobal("Blob", vi.fn(() => ({ size: 1024 })));

describe("Database Module", () => {
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("Database Adapter Initialization", () => {
    it("should initialize with localStorage when VITE_USE_SUPABASE is false", async () => {
      mockEnv.VITE_USE_SUPABASE = "false";
      
      // Re-import the module to trigger initialization
      await vi.importActual("./database");
      
      expect(consoleSpy).toHaveBeenCalledWith("🟡 Using localStorage database (test mode)");
    });

    it("should initialize with Supabase when VITE_USE_SUPABASE is true", async () => {
      mockEnv.VITE_USE_SUPABASE = "true";
      
      // Clear module cache and re-import
      vi.resetModules();
      await vi.importActual("./database");
      
      expect(consoleSpy).toHaveBeenCalledWith("🟢 Using Supabase database");
    });
  });

  describe("Database Operations", () => {
    it("should proxy from() method correctly", async () => {
      const { db } = await import("./database");
      
      // Mock the from method
      const mockFrom = vi.fn();
      (db as any).client = { from: mockFrom, auth: {}, rpc: vi.fn() };
      
      db.from("profiles");
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });

    it("should proxy auth property correctly", async () => {
      const { db } = await import("./database");
      
      const mockAuth = { signIn: vi.fn(), signOut: vi.fn() };
      (db as any).client = { from: vi.fn(), auth: mockAuth, rpc: vi.fn() };
      
      expect(db.auth).toBe(mockAuth);
    });

    it("should proxy rpc() method correctly", async () => {
      const { db } = await import("./database");
      
      const mockRpc = vi.fn().mockResolvedValue({ data: "test" });
      (db as any).client = { from: vi.fn(), auth: {}, rpc: mockRpc };
      
      await db.rpc("get_user_stats", { user_id: "123" });
      expect(mockRpc).toHaveBeenCalledWith("get_user_stats", { user_id: "123" });
    });
  });

  describe("Context Management", () => {
    it("should handle setContext correctly", async () => {
      const { db } = await import("./database");
      
      const mockSetContext = vi.fn();
      (db as any).client = { 
        from: vi.fn(), 
        auth: {}, 
        rpc: vi.fn(),
        setContext: mockSetContext 
      };
      
      db.setContext("barbershop-123", "user-456", "admin");
      expect(mockSetContext).toHaveBeenCalledWith("barbershop-123", "user-456", "admin");
    });

    it("should not fail when setContext is unavailable", async () => {
      const { db } = await import("./database");
      
      (db as any).client = { from: vi.fn(), auth: {}, rpc: vi.fn() };
      
      expect(() => {
        db.setContext("barbershop-123", "user-456", "admin");
      }).not.toThrow();
    });
  });

  describe("Data Export/Import", () => {
    it("should export data from localStorage", async () => {
      mockEnv.VITE_USE_SUPABASE = "false";
      
      // Mock localStorage data
      const mockLocalStorage = {
        "barbershop_db_profiles": JSON.stringify([{ id: "1", name: "Test" }]),
        "barbershop_db_services": JSON.stringify([{ id: "1", name: "Haircut" }]),
        "other_key": "should not be included",
      };
      
      // Mock localStorage methods
      vi.stubGlobal("localStorage", {
        getItem: vi.fn((key) => mockLocalStorage[key] || null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });
      
      Object.defineProperty(global, "localStorage", {
        value: {
          ...localStorage,
          [Symbol.iterator]: function* () {
            for (const key in mockLocalStorage) {
              yield [key, mockLocalStorage[key]];
            }
          },
        },
        writable: true,
      });
      
      // Mock Object.keys for localStorage
      vi.spyOn(Object, "keys").mockImplementation((obj) => {
        if (obj === localStorage) {
          return Object.keys(mockLocalStorage);
        }
        return vi.fn().getMockImplementation()(obj);
      });
      
      const { db } = await import("./database");
      
      const exportData = await db.exportData();
      
      expect(exportData).toHaveProperty("profiles");
      expect(exportData).toHaveProperty("services");
      expect(exportData.profiles).toEqual([{ id: "1", name: "Test" }]);
    });

    it("should handle storage info correctly", async () => {
      const { db } = await import("./database");
      
      const storageInfo = db.getStorageInfo();
      
      expect(storageInfo).toHaveProperty("type");
      expect(["localStorage", "Supabase"]).toContain(storageInfo.type);
    });
  });

  describe("Development Utilities", () => {
    it("should clear localStorage data in development", async () => {
      mockEnv.VITE_USE_SUPABASE = "false";
      
      const mockRemoveItem = vi.fn();
      vi.stubGlobal("localStorage", {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: mockRemoveItem,
      });
      
      // Mock Object.keys to return keys starting with barbershop_db_
      vi.spyOn(Object, "keys").mockReturnValue([
        "barbershop_db_profiles",
        "barbershop_db_services",
        "other_key",
      ]);
      
      const { db } = await import("./database");
      
      db.clearAllData();
      
      expect(mockRemoveItem).toHaveBeenCalledWith("barbershop_db_profiles");
      expect(mockRemoveItem).toHaveBeenCalledWith("barbershop_db_services");
      expect(mockRemoveItem).not.toHaveBeenCalledWith("other_key");
    });

    it("should not clear Supabase data from client", async () => {
      mockEnv.VITE_USE_SUPABASE = "true";
      
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      const { db } = await import("./database");
      
      db.clearAllData();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Cannot clear Supabase data from client. Use Supabase dashboard."
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle RPC errors gracefully", async () => {
      const { db } = await import("./database");
      
      const mockError = new Error("RPC failed");
      const mockRpc = vi.fn().mockRejectedValue(mockError);
      (db as any).client = { from: vi.fn(), auth: {}, rpc: mockRpc };
      
      await expect(db.rpc("failing_function", {})).rejects.toThrow("RPC failed");
    });

    it("should handle missing client properties", async () => {
      const { db } = await import("./database");
      
      (db as any).client = { from: vi.fn() };
      
      expect(() => db.auth).not.toThrow();
      expect(db.auth).toBeUndefined();
    });
  });

  describe("Migration Functionality", () => {
    it("should handle migration when using localStorage", async () => {
      mockEnv.VITE_USE_SUPABASE = "false";
      
      const { db } = await import("./database");
      
      // Mock the migration process
      await db.migrateToSupabase();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔄 Starting migration from localStorage to Supabase..."
      );
    });

    it("should skip migration when already using Supabase", async () => {
      mockEnv.VITE_USE_SUPABASE = "true";
      
      const { db } = await import("./database");
      
      await db.migrateToSupabase();
      
      expect(consoleSpy).toHaveBeenCalledWith("Already using Supabase");
    });
  });
});