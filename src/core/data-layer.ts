// Platform-agnostic data layer - can be implemented for web, mobile, or any backend
import type { 
  User, 
  Barbershop, 
  Service, 
  Booking, 
  Payment, 
  Barbeiro,
  ApiResponse,
  PaginatedResponse 
} from './types';

// Abstract data provider interface - can be implemented for different platforms
export interface DataProvider {
  // Authentication
  login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>>;
  signup(userData: Partial<User>): Promise<ApiResponse<User>>;
  logout(): Promise<ApiResponse<void>>;
  refreshToken(): Promise<ApiResponse<{ token: string }>>;
  
  // User management
  getUser(id: string): Promise<ApiResponse<User>>;
  updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<void>>;
  
  // Barbershop management
  getBarbershop(id: string): Promise<ApiResponse<Barbershop>>;
  createBarbershop(data: Partial<Barbershop>): Promise<ApiResponse<Barbershop>>;
  updateBarbershop(id: string, data: Partial<Barbershop>): Promise<ApiResponse<Barbershop>>;
  deleteBarbershop(id: string): Promise<ApiResponse<void>>;
  listBarbershops(page?: number, limit?: number): Promise<PaginatedResponse<Barbershop>>;
  
  // Service management
  getService(id: string): Promise<ApiResponse<Service>>;
  createService(data: Partial<Service>): Promise<ApiResponse<Service>>;
  updateService(id: string, data: Partial<Service>): Promise<ApiResponse<Service>>;
  deleteService(id: string): Promise<ApiResponse<void>>;
  listServices(barbershopId: string): Promise<ApiResponse<Service[]>>;
  
  // Barbeiro management
  getBarbeiro(id: string): Promise<ApiResponse<Barbeiro>>;
  createBarbeiro(data: Partial<Barbeiro>): Promise<ApiResponse<Barbeiro>>;
  updateBarbeiro(id: string, data: Partial<Barbeiro>): Promise<ApiResponse<Barbeiro>>;
  deleteBarbeiro(id: string): Promise<ApiResponse<void>>;
  listBarbeiros(barbershopId: string): Promise<ApiResponse<Barbeiro[]>>;
  
  // Booking management
  getBooking(id: string): Promise<ApiResponse<Booking>>;
  createBooking(data: Partial<Booking>): Promise<ApiResponse<Booking>>;
  updateBooking(id: string, data: Partial<Booking>): Promise<ApiResponse<Booking>>;
  deleteBooking(id: string): Promise<ApiResponse<void>>;
  listBookings(filters?: {
    barbershopId?: string;
    clientId?: string;
    barbeiroId?: string;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>>;
  
  // Payment management
  getPayment(id: string): Promise<ApiResponse<Payment>>;
  createPayment(data: Partial<Payment>): Promise<ApiResponse<Payment>>;
  updatePayment(id: string, data: Partial<Payment>): Promise<ApiResponse<Payment>>;
  listPayments(filters?: {
    barbershopId?: string;
    bookingId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>>;
  
  // Analytics
  getDashboardStats(barbershopId: string): Promise<ApiResponse<{
    totalBookings: number;
    totalRevenue: number;
    totalClients: number;
    recentBookings: Booking[];
    recentPayments: Payment[];
  }>>;
  
  getFinancialReport(barbershopId: string, startDate: string, endDate: string): Promise<ApiResponse<{
    totalRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
    paymentMethods: Record<string, { count: number; total: number }>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
  }>>;
}

// Repository pattern for data access
export class Repository<T extends { id: string }> {
  constructor(
    private provider: DataProvider,
    private entityName: string
  ) {}
  
  async findById(id: string): Promise<T | null> {
    try {
      const method = `get${this.entityName}` as keyof DataProvider;
      const response = await (this.provider[method] as any)(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error finding ${this.entityName} by id:`, error);
      return null;
    }
  }
  
  async create(data: Partial<T>): Promise<T | null> {
    try {
      const method = `create${this.entityName}` as keyof DataProvider;
      const response = await (this.provider[method] as any)(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error creating ${this.entityName}:`, error);
      return null;
    }
  }
  
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const method = `update${this.entityName}` as keyof DataProvider;
      const response = await (this.provider[method] as any)(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error updating ${this.entityName}:`, error);
      return null;
    }
  }
  
  async delete(id: string): Promise<boolean> {
    try {
      const method = `delete${this.entityName}` as keyof DataProvider;
      const response = await (this.provider[method] as any)(id);
      return response.success;
    } catch (error) {
      console.error(`Error deleting ${this.entityName}:`, error);
      return false;
    }
  }
}

// Specific repositories
export class UserRepository extends Repository<User> {
  constructor(provider: DataProvider) {
    super(provider, 'User');
  }
}

export class BarbershopRepository extends Repository<Barbershop> {
  constructor(provider: DataProvider) {
    super(provider, 'Barbershop');
  }
  
  async list(page = 1, limit = 10): Promise<PaginatedResponse<Barbershop>> {
    try {
      return await this.provider.listBarbershops(page, limit);
    } catch (error) {
      console.error('Error listing barbershops:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasNext: false,
        hasPrev: false
      };
    }
  }
}

export class ServiceRepository extends Repository<Service> {
  constructor(provider: DataProvider) {
    super(provider, 'Service');
  }
  
  async listByBarbershop(barbershopId: string): Promise<Service[]> {
    try {
      const response = await this.provider.listServices(barbershopId);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error listing services:', error);
      return [];
    }
  }
}

export class BookingRepository extends Repository<Booking> {
  constructor(provider: DataProvider) {
    super(provider, 'Booking');
  }
  
  async list(filters?: {
    barbershopId?: string;
    clientId?: string;
    barbeiroId?: string;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    try {
      return await this.provider.listBookings(filters);
    } catch (error) {
      console.error('Error listing bookings:', error);
      return {
        data: [],
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        hasNext: false,
        hasPrev: false
      };
    }
  }
}

export class PaymentRepository extends Repository<Payment> {
  constructor(provider: DataProvider) {
    super(provider, 'Payment');
  }
  
  async list(filters?: {
    barbershopId?: string;
    bookingId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> {
    try {
      return await this.provider.listPayments(filters);
    } catch (error) {
      console.error('Error listing payments:', error);
      return {
        data: [],
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        hasNext: false,
        hasPrev: false
      };
    }
  }
}

// Data access layer factory
export class DataAccessLayer {
  constructor(private provider: DataProvider) {}
  
  get users() {
    return new UserRepository(this.provider);
  }
  
  get barbershops() {
    return new BarbershopRepository(this.provider);
  }
  
  get services() {
    return new ServiceRepository(this.provider);
  }
  
  get bookings() {
    return new BookingRepository(this.provider);
  }
  
  get payments() {
    return new PaymentRepository(this.provider);
  }
  
  // Direct provider access for complex operations
  get provider() {
    return this.provider;
  }
}

// Cache interface for offline capabilities
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
}

// Offline-capable data layer with cache
export class CachedDataLayer extends DataAccessLayer {
  constructor(
    provider: DataProvider,
    private cache: CacheProvider
  ) {
    super(provider);
  }
  
  async getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.cache.get<T>(key);
      if (cached) {
        return cached;
      }
      
      // Fetch from provider if not in cache
      const data = await fetcher();
      
      // Cache the result
      await this.cache.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Error in cached data layer:', error);
      // Fallback to fetcher without cache
      return await fetcher();
    }
  }
  
  async invalidateCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await this.cache.keys(pattern);
        await Promise.all(keys.map(key => this.cache.delete(key)));
      } else {
        await this.cache.clear();
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }
}