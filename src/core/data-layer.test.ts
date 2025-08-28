import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DataProvider } from "./data-layer";
import type {
  User,
  Barbershop,
  Service,
  Booking,
  Payment,
  Barbeiro,
  ApiResponse,
  PaginatedResponse,
} from "./types";

// Mock implementation of DataProvider for testing
class MockDataProvider implements DataProvider {
  // Mock data stores
  private users: Map<string, User> = new Map();
  private barbershops: Map<string, Barbershop> = new Map();
  private services: Map<string, Service> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private payments: Map<string, Payment> = new Map();
  private barbeiros: Map<string, Barbeiro> = new Map();
  private currentToken: string | null = null;

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    if (email === "admin@test.com" && password === "password123") {
      const user: User = {
        id: "user-1",
        name: "Admin User",
        email: "admin@test.com",
        phone: "123456789",
        role: "admin",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };
      this.currentToken = "mock-jwt-token";
      return { success: true, data: { user, token: this.currentToken } };
    }
    return { success: false, error: "Invalid credentials" };
  }

  async signup(userData: Partial<User>): Promise<ApiResponse<User>> {
    if (!userData.email || !userData.name) {
      return { success: false, error: "Email and name are required" };
    }
    
    const user: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      role: userData.role || "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.users.set(user.id, user);
    return { success: true, data: user };
  }

  async logout(): Promise<ApiResponse<void>> {
    this.currentToken = null;
    return { success: true, data: undefined };
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    if (!this.currentToken) {
      return { success: false, error: "No active session" };
    }
    
    const newToken = "new-mock-jwt-token";
    this.currentToken = newToken;
    return { success: true, data: { token: newToken } };
  }

  // User management
  async getUser(id: string): Promise<ApiResponse<User>> {
    const user = this.users.get(id);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    const updatedUser: User = {
      ...existingUser,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    return { success: true, data: updatedUser };
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    if (!this.users.has(id)) {
      return { success: false, error: "User not found" };
    }
    
    this.users.delete(id);
    return { success: true, data: undefined };
  }

  // Barbershop management
  async getBarbershop(id: string): Promise<ApiResponse<Barbershop>> {
    const barbershop = this.barbershops.get(id);
    if (!barbershop) {
      return { success: false, error: "Barbershop not found" };
    }
    return { success: true, data: barbershop };
  }

  async createBarbershop(data: Partial<Barbershop>): Promise<ApiResponse<Barbershop>> {
    if (!data.name || !data.address) {
      return { success: false, error: "Name and address are required" };
    }

    const barbershop: Barbershop = {
      id: `barbershop-${Date.now()}`,
      name: data.name,
      address: data.address,
      phone: data.phone || "",
      email: data.email || "",
      description: data.description || "",
      owner_id: data.owner_id || "",
      status: data.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.barbershops.set(barbershop.id, barbershop);
    return { success: true, data: barbershop };
  }

  async updateBarbershop(id: string, data: Partial<Barbershop>): Promise<ApiResponse<Barbershop>> {
    const existingBarbershop = this.barbershops.get(id);
    if (!existingBarbershop) {
      return { success: false, error: "Barbershop not found" };
    }

    const updatedBarbershop: Barbershop = {
      ...existingBarbershop,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.barbershops.set(id, updatedBarbershop);
    return { success: true, data: updatedBarbershop };
  }

  async deleteBarbershop(id: string): Promise<ApiResponse<void>> {
    if (!this.barbershops.has(id)) {
      return { success: false, error: "Barbershop not found" };
    }
    
    this.barbershops.delete(id);
    return { success: true, data: undefined };
  }

  async listBarbershops(page = 1, limit = 10): Promise<PaginatedResponse<Barbershop>> {
    const allBarbershops = Array.from(this.barbershops.values());
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = allBarbershops.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: allBarbershops.length,
        totalPages: Math.ceil(allBarbershops.length / limit),
      },
    };
  }

  // Service management
  async getService(id: string): Promise<ApiResponse<Service>> {
    const service = this.services.get(id);
    if (!service) {
      return { success: false, error: "Service not found" };
    }
    return { success: true, data: service };
  }

  async createService(data: Partial<Service>): Promise<ApiResponse<Service>> {
    if (!data.name || !data.price || !data.barbershop_id) {
      return { success: false, error: "Name, price, and barbershop_id are required" };
    }

    const service: Service = {
      id: `service-${Date.now()}`,
      name: data.name,
      description: data.description || "",
      price: data.price,
      duration: data.duration || 30,
      barbershop_id: data.barbershop_id,
      status: data.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.services.set(service.id, service);
    return { success: true, data: service };
  }

  async updateService(id: string, data: Partial<Service>): Promise<ApiResponse<Service>> {
    const existingService = this.services.get(id);
    if (!existingService) {
      return { success: false, error: "Service not found" };
    }

    const updatedService: Service = {
      ...existingService,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.services.set(id, updatedService);
    return { success: true, data: updatedService };
  }

  async deleteService(id: string): Promise<ApiResponse<void>> {
    if (!this.services.has(id)) {
      return { success: false, error: "Service not found" };
    }
    
    this.services.delete(id);
    return { success: true, data: undefined };
  }

  async listServices(barbershopId: string): Promise<ApiResponse<Service[]>> {
    const services = Array.from(this.services.values())
      .filter(service => service.barbershop_id === barbershopId);
    return { success: true, data: services };
  }

  // Booking management
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    const booking = this.bookings.get(id);
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }
    return { success: true, data: booking };
  }

  async createBooking(data: Partial<Booking>): Promise<ApiResponse<Booking>> {
    if (!data.user_id || !data.service_id || !data.date_time) {
      return { success: false, error: "User ID, service ID, and date/time are required" };
    }

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      user_id: data.user_id,
      service_id: data.service_id,
      barbeiro_id: data.barbeiro_id || "",
      date_time: data.date_time,
      status: data.status || "pending",
      notes: data.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.bookings.set(booking.id, booking);
    return { success: true, data: booking };
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<ApiResponse<Booking>> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) {
      return { success: false, error: "Booking not found" };
    }

    const updatedBooking: Booking = {
      ...existingBooking,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.bookings.set(id, updatedBooking);
    return { success: true, data: updatedBooking };
  }

  async deleteBooking(id: string): Promise<ApiResponse<void>> {
    if (!this.bookings.has(id)) {
      return { success: false, error: "Booking not found" };
    }
    
    this.bookings.delete(id);
    return { success: true, data: undefined };
  }

  async listBookings(userId?: string, barbershopId?: string): Promise<ApiResponse<Booking[]>> {
    let bookings = Array.from(this.bookings.values());
    
    if (userId) {
      bookings = bookings.filter(booking => booking.user_id === userId);
    }
    
    // For barbershop filtering, we'd need to join with services
    return { success: true, data: bookings };
  }

  // Payment management
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    const payment = this.payments.get(id);
    if (!payment) {
      return { success: false, error: "Payment not found" };
    }
    return { success: true, data: payment };
  }

  async createPayment(data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    if (!data.booking_id || !data.amount) {
      return { success: false, error: "Booking ID and amount are required" };
    }

    const payment: Payment = {
      id: `payment-${Date.now()}`,
      booking_id: data.booking_id,
      amount: data.amount,
      method: data.method || "credit_card",
      status: data.status || "pending",
      transaction_id: data.transaction_id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.payments.set(payment.id, payment);
    return { success: true, data: payment };
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) {
      return { success: false, error: "Payment not found" };
    }

    const updatedPayment: Payment = {
      ...existingPayment,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.payments.set(id, updatedPayment);
    return { success: true, data: updatedPayment };
  }

  async listPayments(bookingId?: string): Promise<ApiResponse<Payment[]>> {
    let payments = Array.from(this.payments.values());
    
    if (bookingId) {
      payments = payments.filter(payment => payment.booking_id === bookingId);
    }
    
    return { success: true, data: payments };
  }

  // Barbeiro management
  async getBarbeiro(id: string): Promise<ApiResponse<Barbeiro>> {
    const barbeiro = this.barbeiros.get(id);
    if (!barbeiro) {
      return { success: false, error: "Barbeiro not found" };
    }
    return { success: true, data: barbeiro };
  }

  async createBarbeiro(data: Partial<Barbeiro>): Promise<ApiResponse<Barbeiro>> {
    if (!data.name || !data.barbershop_id) {
      return { success: false, error: "Name and barbershop ID are required" };
    }

    const barbeiro: Barbeiro = {
      id: `barbeiro-${Date.now()}`,
      name: data.name,
      phone: data.phone || "",
      barbershop_id: data.barbershop_id,
      status: data.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.barbeiros.set(barbeiro.id, barbeiro);
    return { success: true, data: barbeiro };
  }

  async updateBarbeiro(id: string, data: Partial<Barbeiro>): Promise<ApiResponse<Barbeiro>> {
    const existingBarbeiro = this.barbeiros.get(id);
    if (!existingBarbeiro) {
      return { success: false, error: "Barbeiro not found" };
    }

    const updatedBarbeiro: Barbeiro = {
      ...existingBarbeiro,
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    this.barbeiros.set(id, updatedBarbeiro);
    return { success: true, data: updatedBarbeiro };
  }

  async deleteBarbeiro(id: string): Promise<ApiResponse<void>> {
    if (!this.barbeiros.has(id)) {
      return { success: false, error: "Barbeiro not found" };
    }
    
    this.barbeiros.delete(id);
    return { success: true, data: undefined };
  }

  async listBarbeiros(barbershopId: string): Promise<ApiResponse<Barbeiro[]>> {
    const barbeiros = Array.from(this.barbeiros.values())
      .filter(barbeiro => barbeiro.barbershop_id === barbershopId);
    return { success: true, data: barbeiros };
  }
}

describe("DataProvider Interface", () => {
  let dataProvider: MockDataProvider;

  beforeEach(() => {
    dataProvider = new MockDataProvider();
  });

  describe("Authentication", () => {
    it("should authenticate valid user", async () => {
      const result = await dataProvider.login("admin@test.com", "password123");
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.user.email).toBe("admin@test.com");
      expect(result.data!.token).toBeTruthy();
    });

    it("should reject invalid credentials", async () => {
      const result = await dataProvider.login("wrong@test.com", "wrongpassword");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid credentials");
    });

    it("should create new user on signup", async () => {
      const userData = {
        name: "New User",
        email: "new@test.com",
        phone: "123456789",
      };
      
      const result = await dataProvider.signup(userData);
      
      expect(result.success).toBe(true);
      expect(result.data!.name).toBe("New User");
      expect(result.data!.email).toBe("new@test.com");
      expect(result.data!.id).toBeTruthy();
    });

    it("should require email and name for signup", async () => {
      const result = await dataProvider.signup({ phone: "123456789" });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Email and name are required");
    });

    it("should handle logout", async () => {
      await dataProvider.login("admin@test.com", "password123");
      const result = await dataProvider.logout();
      
      expect(result.success).toBe(true);
    });

    it("should refresh token when authenticated", async () => {
      await dataProvider.login("admin@test.com", "password123");
      const result = await dataProvider.refreshToken();
      
      expect(result.success).toBe(true);
      expect(result.data!.token).toBeTruthy();
    });

    it("should fail to refresh token when not authenticated", async () => {
      const result = await dataProvider.refreshToken();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("No active session");
    });
  });

  describe("User Management", () => {
    it("should create and retrieve user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        phone: "123456789",
      };
      
      const createResult = await dataProvider.signup(userData);
      expect(createResult.success).toBe(true);
      
      const userId = createResult.data!.id;
      const getResult = await dataProvider.getUser(userId);
      
      expect(getResult.success).toBe(true);
      expect(getResult.data!.name).toBe("Test User");
    });

    it("should update user data", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
      };
      
      const createResult = await dataProvider.signup(userData);
      const userId = createResult.data!.id;
      
      const updateResult = await dataProvider.updateUser(userId, {
        name: "Updated Name",
        phone: "987654321",
      });
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.data!.name).toBe("Updated Name");
      expect(updateResult.data!.phone).toBe("987654321");
    });

    it("should delete user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
      };
      
      const createResult = await dataProvider.signup(userData);
      const userId = createResult.data!.id;
      
      const deleteResult = await dataProvider.deleteUser(userId);
      expect(deleteResult.success).toBe(true);
      
      const getResult = await dataProvider.getUser(userId);
      expect(getResult.success).toBe(false);
    });
  });

  describe("Barbershop Management", () => {
    it("should create and retrieve barbershop", async () => {
      const barbershopData = {
        name: "Test Barbershop",
        address: "123 Test St",
        phone: "555-1234",
      };
      
      const createResult = await dataProvider.createBarbershop(barbershopData);
      expect(createResult.success).toBe(true);
      
      const barbershopId = createResult.data!.id;
      const getResult = await dataProvider.getBarbershop(barbershopId);
      
      expect(getResult.success).toBe(true);
      expect(getResult.data!.name).toBe("Test Barbershop");
    });

    it("should list barbershops with pagination", async () => {
      // Create multiple barbershops
      for (let i = 1; i <= 15; i++) {
        await dataProvider.createBarbershop({
          name: `Barbershop ${i}`,
          address: `Address ${i}`,
        });
      }
      
      const result = await dataProvider.listBarbershops(1, 10);
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(10);
      expect(result.pagination!.total).toBe(15);
      expect(result.pagination!.totalPages).toBe(2);
    });
  });

  describe("Service Management", () => {
    it("should create and manage services", async () => {
      // First create a barbershop
      const barbershopResult = await dataProvider.createBarbershop({
        name: "Test Barbershop",
        address: "123 Test St",
      });
      const barbershopId = barbershopResult.data!.id;
      
      // Create a service
      const serviceData = {
        name: "Haircut",
        description: "Basic haircut service",
        price: 25.00,
        duration: 30,
        barbershop_id: barbershopId,
      };
      
      const createResult = await dataProvider.createService(serviceData);
      expect(createResult.success).toBe(true);
      
      // List services for barbershop
      const listResult = await dataProvider.listServices(barbershopId);
      expect(listResult.success).toBe(true);
      expect(listResult.data.length).toBe(1);
      expect(listResult.data[0].name).toBe("Haircut");
    });
  });

  describe("Booking Management", () => {
    it("should create and manage bookings", async () => {
      // Create user
      const userResult = await dataProvider.signup({
        name: "Test User",
        email: "user@test.com",
      });
      const userId = userResult.data!.id;
      
      // Create barbershop
      const barbershopResult = await dataProvider.createBarbershop({
        name: "Test Barbershop",
        address: "123 Test St",
      });
      const barbershopId = barbershopResult.data!.id;
      
      // Create service
      const serviceResult = await dataProvider.createService({
        name: "Haircut",
        price: 25.00,
        barbershop_id: barbershopId,
      });
      const serviceId = serviceResult.data!.id;
      
      // Create booking
      const bookingData = {
        user_id: userId,
        service_id: serviceId,
        date_time: "2023-12-01T10:00:00Z",
        notes: "Please be quick",
      };
      
      const createResult = await dataProvider.createBooking(bookingData);
      expect(createResult.success).toBe(true);
      expect(createResult.data!.notes).toBe("Please be quick");
      
      // List bookings for user
      const listResult = await dataProvider.listBookings(userId);
      expect(listResult.success).toBe(true);
      expect(listResult.data.length).toBe(1);
    });
  });

  describe("Payment Management", () => {
    it("should create and manage payments", async () => {
      // Create a booking first
      const userResult = await dataProvider.signup({
        name: "Test User",
        email: "user@test.com",
      });
      const userId = userResult.data!.id;
      
      const barbershopResult = await dataProvider.createBarbershop({
        name: "Test Barbershop",
        address: "123 Test St",
      });
      const barbershopId = barbershopResult.data!.id;
      
      const serviceResult = await dataProvider.createService({
        name: "Haircut",
        price: 25.00,
        barbershop_id: barbershopId,
      });
      const serviceId = serviceResult.data!.id;
      
      const bookingResult = await dataProvider.createBooking({
        user_id: userId,
        service_id: serviceId,
        date_time: "2023-12-01T10:00:00Z",
      });
      const bookingId = bookingResult.data!.id;
      
      // Create payment
      const paymentData = {
        booking_id: bookingId,
        amount: 25.00,
        method: "credit_card" as const,
        transaction_id: "txn_123456",
      };
      
      const createResult = await dataProvider.createPayment(paymentData);
      expect(createResult.success).toBe(true);
      expect(createResult.data!.amount).toBe(25.00);
      
      // List payments for booking
      const listResult = await dataProvider.listPayments(bookingId);
      expect(listResult.success).toBe(true);
      expect(listResult.data.length).toBe(1);
    });
  });

  describe("Barbeiro Management", () => {
    it("should create and manage barbeiros", async () => {
      // Create barbershop first
      const barbershopResult = await dataProvider.createBarbershop({
        name: "Test Barbershop",
        address: "123 Test St",
      });
      const barbershopId = barbershopResult.data!.id;
      
      // Create barbeiro
      const barbeiroData = {
        name: "John Barber",
        phone: "555-9876",
        barbershop_id: barbershopId,
      };
      
      const createResult = await dataProvider.createBarbeiro(barbeiroData);
      expect(createResult.success).toBe(true);
      expect(createResult.data!.name).toBe("John Barber");
      
      // List barbeiros for barbershop
      const listResult = await dataProvider.listBarbeiros(barbershopId);
      expect(listResult.success).toBe(true);
      expect(listResult.data.length).toBe(1);
      expect(listResult.data[0].name).toBe("John Barber");
    });
  });

  describe("Error Handling", () => {
    it("should handle not found errors consistently", async () => {
      const userResult = await dataProvider.getUser("non-existent-id");
      expect(userResult.success).toBe(false);
      expect(userResult.error).toBe("User not found");
      
      const barbershopResult = await dataProvider.getBarbershop("non-existent-id");
      expect(barbershopResult.success).toBe(false);
      expect(barbershopResult.error).toBe("Barbershop not found");
      
      const serviceResult = await dataProvider.getService("non-existent-id");
      expect(serviceResult.success).toBe(false);
      expect(serviceResult.error).toBe("Service not found");
    });

    it("should validate required fields", async () => {
      const barbershopResult = await dataProvider.createBarbershop({});
      expect(barbershopResult.success).toBe(false);
      expect(barbershopResult.error).toBe("Name and address are required");
      
      const serviceResult = await dataProvider.createService({});
      expect(serviceResult.success).toBe(false);
      expect(serviceResult.error).toBe("Name, price, and barbershop_id are required");
    });
  });
});