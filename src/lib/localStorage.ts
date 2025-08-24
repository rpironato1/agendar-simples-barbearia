/**
 * LocalStorage system optimized for Supabase migration
 * Provides the same interface as Supabase with complete data isolation
 */

// Types matching Supabase structure
export interface LocalStorageQuery<T = any> {
  select(columns?: string): LocalStorageQuery<T>;
  eq(column: string, value: any): LocalStorageQuery<T>;
  neq(column: string, value: any): LocalStorageQuery<T>;
  gt(column: string, value: any): LocalStorageQuery<T>;
  gte(column: string, value: any): LocalStorageQuery<T>;
  lt(column: string, value: any): LocalStorageQuery<T>;
  lte(column: string, value: any): LocalStorageQuery<T>;
  like(column: string, pattern: string): LocalStorageQuery<T>;
  ilike(column: string, pattern: string): LocalStorageQuery<T>;
  in(column: string, values: any[]): LocalStorageQuery<T>;
  or(filter: string): LocalStorageQuery<T>;
  order(column: string, options?: { ascending?: boolean }): LocalStorageQuery<T>;
  limit(count: number): LocalStorageQuery<T>;
  single(): Promise<{ data: T | null; error: any }>;
  maybeSingle(): Promise<{ data: T | null; error: any }>;
  then(): Promise<{ data: T[] | null; error: any }>;
}

export interface LocalStorageInsert<T = any> {
  insert(values: Partial<T> | Partial<T>[]): Promise<{ data: T[] | null; error: any }>;
}

export interface LocalStorageUpdate<T = any> {
  update(values: Partial<T>): LocalStorageQuery<T>;
}

export interface LocalStorageDelete<T = any> {
  delete(): LocalStorageQuery<T>;
}

export interface LocalStorageTable<T = any> extends LocalStorageQuery<T>, LocalStorageInsert<T>, LocalStorageUpdate<T>, LocalStorageDelete<T> {
  from(table: string): LocalStorageTable<T>;
}

class LocalStorageDatabase {
  private currentBarbershopId: string | null = null;
  private currentUserId: string | null = null;
  private currentUserRole: string | null = null;

  constructor() {
    this.initializeDatabase();
  }

  // Initialize database with default tables
  private initializeDatabase() {
    const tables = [
      'subscription_plans',
      'barbershops', 
      'barbershop_users',
      'user_roles',
      'profiles',
      'clients',
      'services',
      'barbers', 
      'appointments',
      'financial_transactions',
      'payment_transactions',
      'cost_items',
      'cost_records',
      'promotions'
    ];

    tables.forEach(table => {
      if (!this.getTable(table)) {
        this.setTable(table, []);
      }
    });

    // Initialize subscription plans if empty
    const plans = this.getTable('subscription_plans');
    if (!plans || plans.length === 0) {
      this.initializeSubscriptionPlans();
    }

    // Initialize admin user if not exists
    this.initializeAdminUser();
  }

  private initializeSubscriptionPlans() {
    const plans = [
      {
        id: 'basic',
        name: 'Básico',
        price: 49.90,
        interval: 'month',
        features: {
          barber_limit: 2,
          client_limit: 100,
          appointment_limit: 200,
          financial_reports: false,
          whatsapp_integration: false,
          advanced_analytics: false,
          custom_branding: false,
          priority_support: false
        },
        description: 'Ideal para barbearias pequenas iniciando no digital',
        most_popular: false,
        trial_days: 7,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 99.90,
        interval: 'month',
        features: {
          barber_limit: 5,
          client_limit: 500,
          appointment_limit: 1000,
          financial_reports: true,
          whatsapp_integration: true,
          advanced_analytics: true,
          custom_branding: false,
          priority_support: false
        },
        description: 'Para barbearias em crescimento que precisam de mais recursos',
        most_popular: true,
        trial_days: 7,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199.90,
        interval: 'month',
        features: {
          barber_limit: -1, // unlimited
          client_limit: -1, // unlimited
          appointment_limit: -1, // unlimited
          financial_reports: true,
          whatsapp_integration: true,
          advanced_analytics: true,
          custom_branding: true,
          priority_support: true
        },
        description: 'Solução completa para grandes redes de barbearias',
        most_popular: false,
        trial_days: 7,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.setTable('subscription_plans', plans);
  }

  private initializeAdminUser() {
    const users = this.getTable('profiles') || [];
    const roles = this.getTable('user_roles') || [];
    
    const adminExists = roles.find(r => r.role === 'admin');
    if (!adminExists) {
      const adminId = 'admin-user-id';
      
      // Create admin profile
      users.push({
        id: adminId,
        name: 'Admin Sistema',
        phone: '+55 11 99999-9999',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Create admin role
      roles.push({
        user_id: adminId,
        role: 'admin',
        created_at: new Date().toISOString()
      });

      this.setTable('profiles', users);
      this.setTable('user_roles', roles);
    }
  }

  // Set current context for multitenancy
  setContext(barbershopId: string | null, userId: string | null, userRole: string | null) {
    this.currentBarbershopId = barbershopId;
    this.currentUserId = userId;
    this.currentUserRole = userRole;
  }

  // Get table data with RLS simulation
  private getTable(tableName: string): any[] {
    const data = localStorage.getItem(`barbershop_db_${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  // Set table data
  private setTable(tableName: string, data: any[]) {
    localStorage.setItem(`barbershop_db_${tableName}`, JSON.stringify(data));
  }

  // Apply Row Level Security (RLS) filters
  private applyRLS(tableName: string, data: any[]): any[] {
    // Admin can see everything
    if (this.currentUserRole === 'admin') {
      return data;
    }

    // Tables that need barbershop isolation
    const barbershopTables = ['clients', 'services', 'barbers', 'appointments', 'financial_transactions', 'cost_items', 'cost_records'];
    
    if (barbershopTables.includes(tableName) && this.currentBarbershopId) {
      return data.filter(item => item.barbershop_id === this.currentBarbershopId);
    }

    // User-specific tables
    if (tableName === 'profiles' && this.currentUserId) {
      return data.filter(item => item.id === this.currentUserId);
    }

    if (tableName === 'barbershop_users' && this.currentUserId) {
      return data.filter(item => item.user_id === this.currentUserId);
    }

    return data;
  }

  // Generate UUID
  private generateId(): string {
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Query builder implementation
  from(tableName: string): LocalStorageTable {
    const queryState = {
      tableName,
      selectColumns: '*',
      filters: [] as any[],
      orderBy: null as any,
      limitCount: null as number | null,
      updateData: null as any,
      deleteMode: false
    };

    const query: any = {
      select: (columns = '*') => {
        queryState.selectColumns = columns;
        return query;
      },

      eq: (column: string, value: any) => {
        queryState.filters.push({ type: 'eq', column, value });
        return query;
      },

      neq: (column: string, value: any) => {
        queryState.filters.push({ type: 'neq', column, value });
        return query;
      },

      gt: (column: string, value: any) => {
        queryState.filters.push({ type: 'gt', column, value });
        return query;
      },

      gte: (column: string, value: any) => {
        queryState.filters.push({ type: 'gte', column, value });
        return query;
      },

      lt: (column: string, value: any) => {
        queryState.filters.push({ type: 'lt', column, value });
        return query;
      },

      lte: (column: string, value: any) => {
        queryState.filters.push({ type: 'lte', column, value });
        return query;
      },

      like: (column: string, pattern: string) => {
        queryState.filters.push({ type: 'like', column, value: pattern });
        return query;
      },

      ilike: (column: string, pattern: string) => {
        queryState.filters.push({ type: 'ilike', column, value: pattern });
        return query;
      },

      in: (column: string, values: any[]) => {
        queryState.filters.push({ type: 'in', column, value: values });
        return query;
      },

      or: (filter: string) => {
        // Simple OR implementation
        queryState.filters.push({ type: 'or', filter });
        return query;
      },

      order: (column: string, options = { ascending: true }) => {
        queryState.orderBy = { column, ascending: options.ascending };
        return query;
      },

      limit: (count: number) => {
        queryState.limitCount = count;
        return query;
      },

      insert: async (values: any) => {
        try {
          const table = this.getTable(queryState.tableName);
          const items = Array.isArray(values) ? values : [values];
          
          const newItems = items.map(item => ({
            ...item,
            id: item.id || this.generateId(),
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            // Add barbershop_id to barbershop-scoped tables
            ...(this.currentBarbershopId && ['clients', 'services', 'barbers', 'appointments', 'financial_transactions', 'cost_items', 'cost_records'].includes(queryState.tableName) 
                ? { barbershop_id: this.currentBarbershopId } 
                : {})
          }));

          table.push(...newItems);
          this.setTable(queryState.tableName, table);

          return { data: newItems, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },

      update: (values: any) => {
        queryState.updateData = values;
        return query;
      },

      delete: () => {
        queryState.deleteMode = true;
        return query;
      },

      // Execute query
      then: async () => {
        return this.executeQuery(queryState);
      },

      single: async () => {
        queryState.limitCount = 1;
        const result = await this.executeQuery(queryState);
        return {
          data: result.data && result.data.length > 0 ? result.data[0] : null,
          error: result.error
        };
      },

      maybeSingle: async () => {
        queryState.limitCount = 1;
        const result = await this.executeQuery(queryState);
        return {
          data: result.data && result.data.length > 0 ? result.data[0] : null,
          error: result.error
        };
      }
    };

    return query;
  }

  private async executeQuery(queryState: any) {
    try {
      let data = this.getTable(queryState.tableName);
      
      // Apply RLS
      data = this.applyRLS(queryState.tableName, data);

      // Apply filters
      for (const filter of queryState.filters) {
        data = this.applyFilter(data, filter);
      }

      // Handle update
      if (queryState.updateData) {
        const originalTable = this.getTable(queryState.tableName);
        const updatedItems: any[] = [];
        
        for (let i = 0; i < originalTable.length; i++) {
          const item = originalTable[i];
          const shouldUpdate = this.matchesFilters(item, queryState.filters) && 
                              this.applyRLS(queryState.tableName, [item]).length > 0;
          
          if (shouldUpdate) {
            const updatedItem = {
              ...item,
              ...queryState.updateData,
              updated_at: new Date().toISOString()
            };
            originalTable[i] = updatedItem;
            updatedItems.push(updatedItem);
          }
        }
        
        this.setTable(queryState.tableName, originalTable);
        return { data: updatedItems, error: null };
      }

      // Handle delete
      if (queryState.deleteMode) {
        const originalTable = this.getTable(queryState.tableName);
        const deletedItems: any[] = [];
        
        const remainingItems = originalTable.filter(item => {
          const shouldDelete = this.matchesFilters(item, queryState.filters) && 
                              this.applyRLS(queryState.tableName, [item]).length > 0;
          if (shouldDelete) {
            deletedItems.push(item);
            return false;
          }
          return true;
        });
        
        this.setTable(queryState.tableName, remainingItems);
        return { data: deletedItems, error: null };
      }

      // Apply ordering
      if (queryState.orderBy) {
        data.sort((a, b) => {
          const aVal = a[queryState.orderBy.column];
          const bVal = b[queryState.orderBy.column];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return queryState.orderBy.ascending ? comparison : -comparison;
        });
      }

      // Apply limit
      if (queryState.limitCount) {
        data = data.slice(0, queryState.limitCount);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private applyFilter(data: any[], filter: any): any[] {
    switch (filter.type) {
      case 'eq':
        return data.filter(item => item[filter.column] === filter.value);
      case 'neq':
        return data.filter(item => item[filter.column] !== filter.value);
      case 'gt':
        return data.filter(item => item[filter.column] > filter.value);
      case 'gte':
        return data.filter(item => item[filter.column] >= filter.value);
      case 'lt':
        return data.filter(item => item[filter.column] < filter.value);
      case 'lte':
        return data.filter(item => item[filter.column] <= filter.value);
      case 'like':
      case 'ilike':
        const pattern = filter.value.replace(/%/g, '.*');
        const regex = new RegExp(pattern, filter.type === 'ilike' ? 'i' : '');
        return data.filter(item => regex.test(item[filter.column] || ''));
      case 'in':
        return data.filter(item => filter.value.includes(item[filter.column]));
      case 'or':
        // Simple OR implementation - would need more complex parsing in real scenario
        return data;
      default:
        return data;
    }
  }

  private matchesFilters(item: any, filters: any[]): boolean {
    return filters.every(filter => {
      const filtered = this.applyFilter([item], filter);
      return filtered.length > 0;
    });
  }

  // Auth simulation
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Simulate admin login
      if (email === 'admin@demo.com' && password === 'admin123') {
        const user = {
          id: 'admin-user-id',
          email: 'admin@demo.com',
          user_metadata: { name: 'Admin Sistema' }
        };
        const session = { user, access_token: 'mock-token' };
        
        // Store session
        localStorage.setItem('barbershop_session', JSON.stringify(session));
        
        return { data: { user, session }, error: null };
      }

      // Simulate barbershop login
      if (email === 'barbershop@demo.com' && password === 'demo123') {
        const user = {
          id: 'barbershop-user-id',
          email: 'barbershop@demo.com',
          user_metadata: { name: 'Demo Barbershop' }
        };
        const session = { user, access_token: 'mock-token' };
        
        // Store session
        localStorage.setItem('barbershop_session', JSON.stringify(session));
        
        return { data: { user, session }, error: null };
      }

      return { data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } };
    },

    signUp: async ({ email, password, options }: any) => {
      const user = {
        id: this.generateId(),
        email,
        user_metadata: options?.data || {}
      };
      const session = { user, access_token: 'mock-token' };
      
      // Store session
      localStorage.setItem('barbershop_session', JSON.stringify(session));
      
      return { data: { user, session }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('barbershop_session');
      return { error: null };
    },

    getSession: async () => {
      const session = localStorage.getItem('barbershop_session');
      return { 
        data: { session: session ? JSON.parse(session) : null }, 
        error: null 
      };
    },

    onAuthStateChange: (callback: any) => {
      // Simple implementation - in real app would use proper event system
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  // RPC functions simulation
  rpc = async (functionName: string, params: any) => {
    switch (functionName) {
      case 'create_barbershop_with_defaults':
        return this.createBarbershopWithDefaults(params);
      default:
        return { data: null, error: { message: `Function ${functionName} not implemented` } };
    }
  };

  private async createBarbershopWithDefaults(params: any) {
    try {
      const barbershopId = this.generateId();
      
      // Create barbershop
      const barbershop = {
        id: barbershopId,
        name: params.barbershop_name,
        owner_name: params.owner_name,
        email: params.email,
        phone: params.phone,
        address: params.address,
        city: params.city,
        state: params.state,
        zip_code: params.zip_code,
        plan_id: params.plan_id || 'basic',
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const barbershops = this.getTable('barbershops');
      barbershops.push(barbershop);
      this.setTable('barbershops', barbershops);

      // Create default services
      const defaultServices = [
        { name: 'Corte Simples', description: 'Corte básico de cabelo', price: 25.00, duration: 30, active: true },
        { name: 'Corte + Barba', description: 'Corte de cabelo + barba', price: 35.00, duration: 45, active: true },
        { name: 'Barba', description: 'Apenas barba', price: 15.00, duration: 20, active: true }
      ];

      const services = this.getTable('services');
      defaultServices.forEach(service => {
        services.push({
          ...service,
          id: this.generateId(),
          barbershop_id: barbershopId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
      this.setTable('services', services);

      // Create default barber
      const barbers = this.getTable('barbers');
      barbers.push({
        id: this.generateId(),
        name: params.owner_name,
        phone: params.phone,
        barbershop_id: barbershopId,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      this.setTable('barbers', barbers);

      return { data: barbershopId, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Create singleton instance
export const localDb = new LocalStorageDatabase();

// Export interface that matches Supabase
export const createLocalClient = () => localDb;