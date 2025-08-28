// Business logic layer - platform agnostic business rules and operations
import type {
  User,
  Barbershop,
  Service,
  Booking,
  Payment,
  ApiResponse,
  ValidationResult,
} from "./types";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  formatCurrency,
} from "./utils";

// Authentication business logic
export class AuthService {
  static validateLoginCredentials(
    email: string,
    password: string
  ): ValidationResult {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      errors.email = "Email inválido";
    }

    if (!password) {
      errors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateSignupData(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!data.email) {
      errors.email = "Email é obrigatório";
    } else if (!validateEmail(data.email)) {
      errors.email = "Email inválido";
    }

    if (!data.phone) {
      errors.phone = "Telefone é obrigatório";
    } else if (!validatePhone(data.phone)) {
      errors.phone = "Telefone inválido. Use o formato (11) 99999-9999";
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = Object.values(passwordValidation.errors)[0];
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Senhas não coincidem";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Barbershop business logic
export class BarbershopService {
  static validateSubscriptionPlan(plan: string): boolean {
    return ["basic", "premium", "enterprise"].includes(plan);
  }

  static getSubscriptionFeatures(plan: "basic" | "premium" | "enterprise") {
    const features = {
      basic: {
        maxBarbeiros: 2,
        maxServicos: 10,
        maxAgendamentos: 50,
        relatorios: false,
        integracao: false,
        suporte: "email",
      },
      premium: {
        maxBarbeiros: 5,
        maxServicos: 25,
        maxAgendamentos: 200,
        relatorios: true,
        integracao: false,
        suporte: "chat",
      },
      enterprise: {
        maxBarbeiros: -1, // unlimited
        maxServicos: -1,
        maxAgendamentos: -1,
        relatorios: true,
        integracao: true,
        suporte: "telefone",
      },
    };

    return features[plan];
  }

  static calculateMonthlyRevenue(payments: Payment[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return payments
      .filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear &&
          payment.status === "completed"
        );
      })
      .reduce((total, payment) => total + payment.amount, 0);
  }
}

// Booking business logic
export class BookingService {
  static validateBookingData(data: {
    serviceId: string;
    barbeiroId: string;
    date: string;
    time: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.serviceId) {
      errors.serviceId = "Serviço é obrigatório";
    }

    if (!data.barbeiroId) {
      errors.barbeiroId = "Barbeiro é obrigatório";
    }

    if (!data.date) {
      errors.date = "Data é obrigatória";
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = "Data não pode ser no passado";
      }
    }

    if (!data.time) {
      errors.time = "Horário é obrigatório";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static isWorkingDay(date: Date, workingHours: Record<string, any>): boolean {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[date.getDay()];

    return workingHours[dayName]?.enabled || false;
  }

  static getAvailableTimeSlots(
    date: string,
    service: Service,
    bookedSlots: string[],
    workingHours: { start: string; end: string }
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = workingHours.start.split(":").map(Number);
    const [endHour, endMin] = workingHours.end.split(":").map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    const serviceDuration = service.duration;

    for (let time = startTime; time <= endTime - serviceDuration; time += 30) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeSlot = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      if (!bookedSlots.includes(timeSlot)) {
        slots.push(timeSlot);
      }
    }

    return slots;
  }

  static calculateTotalPrice(services: Service[]): number {
    return services.reduce((total, service) => total + service.price, 0);
  }
}

// Service business logic
export class ServiceManagement {
  static validateServiceData(data: {
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.description = "Descrição deve ter pelo menos 10 caracteres";
    }

    if (!data.duration || data.duration < 5) {
      errors.duration = "Duração deve ser de pelo menos 5 minutos";
    }

    if (!data.price || data.price < 1) {
      errors.price = "Preço deve ser maior que R$ 1,00";
    }

    if (
      !data.category ||
      !["hair", "beard", "combo", "extras"].includes(data.category)
    ) {
      errors.category = "Categoria inválida";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static generateServiceSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}

// Financial business logic
export class FinancialService {
  static calculateDailyRevenue(payments: Payment[], date: string): number {
    return payments
      .filter((payment) => {
        const paymentDate = new Date(payment.createdAt).toDateString();
        const targetDate = new Date(date).toDateString();
        return paymentDate === targetDate && payment.status === "completed";
      })
      .reduce((total, payment) => total + payment.amount, 0);
  }

  static getPaymentMethodStats(
    payments: Payment[]
  ): Record<string, { count: number; total: number }> {
    const stats: Record<string, { count: number; total: number }> = {};

    payments
      .filter((payment) => payment.status === "completed")
      .forEach((payment) => {
        if (!stats[payment.method]) {
          stats[payment.method] = { count: 0, total: 0 };
        }
        stats[payment.method].count++;
        stats[payment.method].total += payment.amount;
      });

    return stats;
  }

  static generateFinancialReport(
    payments: Payment[],
    startDate: string,
    endDate: string
  ) {
    const filteredPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return (
        paymentDate >= new Date(startDate) &&
        paymentDate <= new Date(endDate) &&
        payment.status === "completed"
      );
    });

    const totalRevenue = filteredPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
    const totalTransactions = filteredPayments.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const paymentMethods = this.getPaymentMethodStats(filteredPayments);

    return {
      period: { startDate, endDate },
      totalRevenue,
      totalTransactions,
      averageTransaction,
      paymentMethods,
      formattedRevenue: formatCurrency(totalRevenue),
      formattedAverage: formatCurrency(averageTransaction),
    };
  }
}

// Export all business logic modules
export const BusinessLogic = {
  Auth: AuthService,
  Barbershop: BarbershopService,
  Booking: BookingService,
  Service: ServiceManagement,
  Financial: FinancialService,
};
