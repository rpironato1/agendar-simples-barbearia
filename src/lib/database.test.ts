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

  describe("Database Adapter Basic Functionality", () => {
    it("should have database instance available", async () => {
      const { db } = await import("./database");
      
      expect(db).toBeDefined();
      expect(typeof db.from).toBe("function");
      expect(db.auth).toBeDefined();
      expect(typeof db.rpc).toBe("function");
      expect(typeof db.setContext).toBe("function");
    });

    it("should handle from() method calls", async () => {
      const { db } = await import("./database");
      
      expect(() => db.from("profiles")).not.toThrow();
    });

    it("should handle auth property access", async () => {
      const { db } = await import("./database");
      
      expect(() => db.auth).not.toThrow();
    });

    it("should handle rpc calls", async () => {
      const { db } = await import("./database");
      
      expect(() => db.rpc("test_function", {})).not.toThrow();
    });

    it("should handle setContext calls", async () => {
      const { db } = await import("./database");
      
      expect(() => db.setContext("test-shop", "test-user", "admin")).not.toThrow();
    });
  });

  describe("Storage Information", () => {
    it("should provide storage info", async () => {
      const { db } = await import("./database");
      
      const storageInfo = db.getStorageInfo();
      
      expect(storageInfo).toBeDefined();
      expect(storageInfo).toHaveProperty("type");
      expect(["localStorage", "Supabase"]).toContain(storageInfo.type);
    });
  });

  describe("Migration Functionality", () => {
    it("should handle migration calls", async () => {
      const { db } = await import("./database");
      
      expect(() => db.migrateToSupabase()).not.toThrow();
    });
  });

  describe("Data Export", () => {
    it("should handle export data calls", async () => {
      const { db } = await import("./database");
      
      expect(() => db.exportData()).not.toThrow();
    });
  });

  describe("Development Utilities", () => {
    it("should handle clear data calls", async () => {
      const { db } = await import("./database");
      
      expect(() => db.clearAllData()).not.toThrow();
    });
  });
});