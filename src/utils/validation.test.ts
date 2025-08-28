import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePhone,
  validateCPF,
  sanitizeInput,
  sanitizeName,
  validateName,
  validatePassword,
  validateAppointmentDate,
  validateAppointmentTime,
  sanitizePhoneNumber,
  formatPhoneForDisplay,
  formatCPF,
  sanitizeCPF,
} from "./validation";

describe("Validation Utils", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(validateEmail("simple@test.br")).toBe(true);
      expect(validateEmail("test123@domain123.org")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
      expect(validateEmail("test.domain.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("test@domain")).toBe(false);
      expect(validateEmail("test space@domain.com")).toBe(false);
    });
  });

  describe("validatePhone", () => {
    it("should validate Brazilian phone numbers", () => {
      expect(validatePhone("11999999999")).toBe(true); // 11 digits
      expect(validatePhone("1199999999")).toBe(true); // 10 digits
      expect(validatePhone("(11) 99999-9999")).toBe(true); // formatted - digits only matter
      expect(validatePhone("11 99999-9999")).toBe(true); // formatted - digits only matter
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("123456789")).toBe(false); // too short (9 digits)
      expect(validatePhone("123456789012")).toBe(false); // too long (12 digits)
      expect(validatePhone("")).toBe(false);
    });
  });

  describe("validateCPF", () => {
    it("should validate correct CPF numbers", () => {
      expect(validateCPF("11144477735")).toBe(true);
      expect(validateCPF("111.444.777-35")).toBe(true);
      expect(validateCPF("52998224725")).toBe(true);
    });

    it("should reject invalid CPF numbers", () => {
      expect(validateCPF("11111111111")).toBe(false); // all same digits
      expect(validateCPF("12345678901")).toBe(false); // invalid check digits
      expect(validateCPF("123.456.789-10")).toBe(false); // invalid format
      expect(validateCPF("000.000.000-00")).toBe(false); // invalid CPF
      expect(validateCPF("")).toBe(false);
      expect(validateCPF("123")).toBe(false); // too short
    });
  });

  describe("sanitizeInput", () => {
    it("should remove dangerous characters", () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(sanitizeInput("Hello <world>")).toBe("Hello world");
      expect(sanitizeInput("Safe text")).toBe("Safe text");
    });

    it("should remove javascript protocols", () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeInput("JAVASCRIPT:malicious()")).toBe("malicious()");
    });

    it("should remove event handlers", () => {
      expect(sanitizeInput("onclick=malicious()")).toBe("malicious()");
      expect(sanitizeInput("onload=bad()")).toBe("bad()");
      expect(sanitizeInput("onmouseover=evil()")).toBe("evil()");
    });

    it("should handle normal text safely", () => {
      expect(sanitizeInput("Normal text input")).toBe("Normal text input");
      expect(sanitizeInput("Email: test@example.com")).toBe(
        "Email: test@example.com"
      );
    });
  });

  describe("validatePassword", () => {
    it("should validate passwords with minimum length", () => {
      expect(validatePassword("123456")).toBe(true); // exactly 6 chars
      expect(validatePassword("password123")).toBe(true); // longer than 6
    });

    it("should reject passwords that are too short", () => {
      expect(validatePassword("12345")).toBe(false); // 5 chars
      expect(validatePassword("")).toBe(false);
      expect(validatePassword("abc")).toBe(false);
    });
  });

  describe("sanitizeName", () => {
    it("should sanitize names while preserving spaces", () => {
      expect(sanitizeName("João  Silva")).toBe("João Silva");
      expect(sanitizeName("  Maria  Santos  ")).toBe("Maria Santos");
      expect(sanitizeName("Test<script>Name")).toBe("TestscriptName");
    });

    it("should remove dangerous content", () => {
      expect(sanitizeName('javascript:alert("test")')).toBe('alert("test")');
      expect(sanitizeName("onclick=malicious()")).toBe("malicious()");
    });
  });

  describe("validateName", () => {
    it("should validate correct names", () => {
      expect(validateName("João Silva")).toBe(true);
      expect(validateName("Maria")).toBe(true);
      expect(validateName("José da Silva")).toBe(true);
    });

    it("should reject invalid names", () => {
      expect(validateName("J")).toBe(false); // too short
      expect(validateName("João123")).toBe(false); // contains numbers
      expect(validateName("Maria@Silva")).toBe(false); // contains special chars
      expect(validateName("")).toBe(false);
    });
  });

  describe("validateAppointmentDate", () => {
    it("should validate future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(validateAppointmentDate(tomorrow)).toBe(true);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(validateAppointmentDate(nextWeek)).toBe(true);
    });

    it("should reject past dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(validateAppointmentDate(yesterday)).toBe(false);
    });

    it("should allow today", () => {
      const today = new Date();
      expect(validateAppointmentDate(today)).toBe(true);
    });
  });

  describe("validateAppointmentTime", () => {
    it("should validate future times for today", () => {
      const today = new Date();
      const futureTime = new Date(today.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const timeString = `${futureTime.getHours().toString().padStart(2, "0")}:${futureTime.getMinutes().toString().padStart(2, "0")}`;

      expect(validateAppointmentTime(timeString, today)).toBe(true);
    });

    it("should allow any time for future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(validateAppointmentTime("09:00", tomorrow)).toBe(true);
      expect(validateAppointmentTime("18:00", tomorrow)).toBe(true);
    });
  });

  describe("sanitizePhoneNumber", () => {
    it("should remove all non-digits", () => {
      expect(sanitizePhoneNumber("(11) 99999-9999")).toBe("11999999999");
      expect(sanitizePhoneNumber("11 99999-9999")).toBe("11999999999");
      expect(sanitizePhoneNumber("+55 11 99999-9999")).toBe("5511999999999");
    });

    it("should handle clean numbers", () => {
      expect(sanitizePhoneNumber("11999999999")).toBe("11999999999");
    });
  });

  describe("formatPhoneForDisplay", () => {
    it("should format 11-digit numbers", () => {
      expect(formatPhoneForDisplay("11999999999")).toBe("(11) 99999-9999");
    });

    it("should format 10-digit numbers", () => {
      expect(formatPhoneForDisplay("1199999999")).toBe("(11) 9999-9999");
    });

    it("should handle invalid numbers", () => {
      expect(formatPhoneForDisplay("123")).toBe("123");
      expect(formatPhoneForDisplay("")).toBe("");
    });
  });

  describe("formatCPF", () => {
    it("should format CPF numbers correctly", () => {
      expect(formatCPF("11144477735")).toBe("111.444.777-35");
      expect(formatCPF("52998224725")).toBe("529.982.247-25");
    });

    it("should handle pre-formatted CPF", () => {
      expect(formatCPF("111.444.777-35")).toBe("111.444.777-35");
    });

    it("should handle invalid input gracefully", () => {
      expect(formatCPF("")).toBe("");
      expect(formatCPF("123")).toBe("123");
    });
  });

  describe("sanitizeCPF", () => {
    it("should remove all non-digits and limit to 11", () => {
      expect(sanitizeCPF("111.444.777-35")).toBe("11144477735");
      expect(sanitizeCPF("111 444 777 35")).toBe("11144477735");
      expect(sanitizeCPF("111444777359999")).toBe("11144477735"); // truncated to 11
    });

    it("should handle clean numbers", () => {
      expect(sanitizeCPF("11144477735")).toBe("11144477735");
    });
  });
});
