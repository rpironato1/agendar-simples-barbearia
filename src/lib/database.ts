/**
 * Database adapter that can switch between localStorage and Supabase
 * Allows testing with localStorage and easy migration to Supabase
 */

import { supabase } from "./supabase";
import { localDb, createLocalClient } from "./localStorage";

// Environment variable to control database type
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === "true";

// Interface that both implementations must follow
export interface DatabaseClient {
  from(table: string): any;
  auth: any;
  rpc(functionName: string, params: any): Promise<any>;
  setContext?(
    barbershopId: string | null,
    userId: string | null,
    userRole: string | null
  ): void;
}

class DatabaseAdapter {
  private client: DatabaseClient;

  constructor() {
    if (USE_SUPABASE) {
      console.log("🟢 Using Supabase database");
      this.client = supabase;
    } else {
      console.log("🟡 Using localStorage database (test mode)");
      this.client = createLocalClient();
    }
  }

  // Proxy all methods to the active client
  from(table: string) {
    return this.client.from(table);
  }

  get auth() {
    return this.client.auth;
  }

  rpc(functionName: string, params: any) {
    return this.client.rpc(functionName, params);
  }

  // Set context for multitenancy (only works with localStorage)
  setContext(
    barbershopId: string | null,
    userId: string | null,
    userRole: string | null
  ) {
    if (this.client.setContext) {
      this.client.setContext(barbershopId, userId, userRole);
    }
  }

  // Migration utilities
  async migrateToSupabase() {
    if (USE_SUPABASE) {
      console.log("Already using Supabase");
      return;
    }

    console.log("🔄 Starting migration from localStorage to Supabase...");

    const tables = [
      "subscription_plans",
      "barbershops",
      "barbershop_users",
      "user_roles",
      "profiles",
      "clients",
      "services",
      "barbers",
      "appointments",
      "financial_transactions",
      "payment_transactions",
      "cost_items",
      "cost_records",
      "promotions",
    ];

    for (const table of tables) {
      try {
        const localData = localStorage.getItem(`barbershop_db_${table}`);
        if (localData) {
          const data = JSON.parse(localData);
          if (data.length > 0) {
            console.log(`Migrating ${data.length} records from ${table}...`);

            // Insert data to Supabase
            const { error } = await supabase.from(table).insert(data);

            if (error) {
              console.error(`Error migrating ${table}:`, error);
            } else {
              console.log(`✅ Successfully migrated ${table}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error migrating ${table}:`, error);
      }
    }

    console.log("🔄 Migration completed!");
  }

  async exportData() {
    const tables = [
      "subscription_plans",
      "barbershops",
      "barbershop_users",
      "user_roles",
      "profiles",
      "clients",
      "services",
      "barbers",
      "appointments",
      "financial_transactions",
      "payment_transactions",
      "cost_items",
      "cost_records",
      "promotions",
    ];

    const exportData: Record<string, any[]> = {};

    for (const table of tables) {
      if (USE_SUPABASE) {
        const { data } = await supabase.from(table).select("*");
        exportData[table] = data || [];
      } else {
        const localData = localStorage.getItem(`barbershop_db_${table}`);
        exportData[table] = localData ? JSON.parse(localData) : [];
      }
    }

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barbershop-data-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  }

  async importData(data: Record<string, any[]>) {
    const tables = Object.keys(data);

    for (const table of tables) {
      try {
        const tableData = data[table];
        if (tableData && tableData.length > 0) {
          console.log(`Importing ${tableData.length} records to ${table}...`);

          if (USE_SUPABASE) {
            // Clear existing data
            await supabase.from(table).delete().neq("id", "");
            // Insert new data
            const { error } = await supabase.from(table).insert(tableData);
            if (error) throw error;
          } else {
            localStorage.setItem(
              `barbershop_db_${table}`,
              JSON.stringify(tableData)
            );
          }

          console.log(`✅ Successfully imported ${table}`);
        }
      } catch (error) {
        console.error(`Error importing ${table}:`, error);
      }
    }

    console.log("✅ Import completed!");
  }

  // Development utilities
  clearAllData() {
    if (USE_SUPABASE) {
      console.warn(
        "Cannot clear Supabase data from client. Use Supabase dashboard."
      );
      return;
    }

    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("barbershop_db_")
    );
    keys.forEach((key) => localStorage.removeItem(key));

    // Reinitialize
    localDb.constructor();

    console.log("🗑️ All localStorage data cleared and reinitialized");
  }

  getStorageInfo() {
    if (USE_SUPABASE) {
      return {
        type: "Supabase",
        url: "https://dikfrwaqwbtibasxdvie.supabase.co",
      };
    } else {
      const tables = Object.keys(localStorage)
        .filter((key) => key.startsWith("barbershop_db_"))
        .map((key) => {
          const data = JSON.parse(localStorage.getItem(key) || "[]");
          return {
            table: key.replace("barbershop_db_", ""),
            records: data.length,
          };
        });

      return {
        type: "localStorage",
        tables,
        totalSize: new Blob([JSON.stringify(localStorage)]).size + " bytes",
      };
    }
  }
}

// Create singleton instance
export const db = new DatabaseAdapter();

// Export for backward compatibility
export { supabase } from "./supabase";
export * from "./supabase";

// Development helper - expose on window in dev mode
if (import.meta.env.DEV) {
  (window as any).barbershopDb = {
    adapter: db,
    migrateToSupabase: () => db.migrateToSupabase(),
    exportData: () => db.exportData(),
    clearData: () => db.clearAllData(),
    getInfo: () => db.getStorageInfo(),
  };
}
