import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDeviceInfo,
  isMobile,
  isTablet,
  isDesktop,
  validateEmail,
  validatePhone,
  validatePassword,
  formatDate,
  formatTime,
  formatDateTime,
  isTimeSlotAvailable
} from './utils';

// Mock window object for testing
const mockWindow = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('Device Detection Utils', () => {
  beforeEach(() => {
    // Reset window mock
    mockWindow(1024, 768);
  });

  describe('getDeviceInfo', () => {
    it('should return desktop info for large screens', () => {
      mockWindow(1200, 800);
      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.platform).toBe('web');
      expect(deviceInfo.isTablet).toBe(false);
      expect(deviceInfo.isMobile).toBe(false);
      expect(deviceInfo.screenWidth).toBe(1200);
      expect(deviceInfo.screenHeight).toBe(800);
    });

    it('should return tablet info for medium screens', () => {
      mockWindow(800, 600);
      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.platform).toBe('web');
      expect(deviceInfo.isTablet).toBe(true);
      expect(deviceInfo.isMobile).toBe(false);
      expect(deviceInfo.screenWidth).toBe(800);
      expect(deviceInfo.screenHeight).toBe(600);
    });

    it('should return mobile info for small screens', () => {
      mockWindow(400, 600);
      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.platform).toBe('web');
      expect(deviceInfo.isTablet).toBe(false);
      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.screenWidth).toBe(400);
      expect(deviceInfo.screenHeight).toBe(600);
    });
  });

  describe('isMobile', () => {
    it('should return true for mobile widths', () => {
      expect(isMobile(320)).toBe(true);
      expect(isMobile(480)).toBe(true);
      expect(isMobile(767)).toBe(true);
    });

    it('should return false for non-mobile widths', () => {
      expect(isMobile(768)).toBe(false);
      expect(isMobile(1024)).toBe(false);
      expect(isMobile(1200)).toBe(false);
    });

    it('should use window width when no parameter provided', () => {
      mockWindow(400, 600);
      expect(isMobile()).toBe(true);
    });
  });

  describe('isTablet', () => {
    it('should return true for tablet widths', () => {
      expect(isTablet(768)).toBe(true);
      expect(isTablet(900)).toBe(true);
      expect(isTablet(1023)).toBe(true);
    });

    it('should return false for non-tablet widths', () => {
      expect(isTablet(767)).toBe(false);
      expect(isTablet(1024)).toBe(false);
      expect(isTablet(1200)).toBe(false);
    });
  });

  describe('isDesktop', () => {
    it('should return true for desktop widths', () => {
      expect(isDesktop(1024)).toBe(true);
      expect(isDesktop(1200)).toBe(true);
      expect(isDesktop(1920)).toBe(true);
    });

    it('should return false for non-desktop widths', () => {
      expect(isDesktop(767)).toBe(false);
      expect(isDesktop(800)).toBe(false);
      expect(isDesktop(1023)).toBe(false);
    });
  });
});

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('simple@test.br')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test.domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct Brazilian phone formats', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('(21) 8888-8888')).toBe(true);
      expect(validatePhone('(85) 98765-4321')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('11999999999')).toBe(false);
      expect(validatePhone('11 99999-9999')).toBe(false);
      expect(validatePhone('(111) 99999-9999')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should require minimum length', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe('Senha deve ter pelo menos 8 caracteres');
    });

    it('should require uppercase letter', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.uppercase).toBe('Senha deve conter pelo menos uma letra maiúscula');
    });

    it('should require lowercase letter', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors.lowercase).toBe('Senha deve conter pelo menos uma letra minúscula');
    });

    it('should require number', () => {
      const result = validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors.number).toBe('Senha deve conter pelo menos um número');
    });
  });
});

describe('Date and Time Utils', () => {
  describe('formatDate', () => {
    it('should format dates in Brazilian format', () => {
      const date = new Date('2024-12-20');
      expect(formatDate(date)).toBe('20/12/2024');
    });

    it('should handle ISO date strings', () => {
      expect(formatDate('2024-12-20')).toBe('20/12/2024');
    });
  });

  describe('formatTime', () => {
    it('should format time to HH:MM', () => {
      expect(formatTime('14:30:00')).toBe('14:30');
      expect(formatTime('09:15:45')).toBe('09:15');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-12-20T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('20/12/2024');
      expect(formatted).toContain('14:30');
    });
  });

  describe('isTimeSlotAvailable', () => {
    it('should return true for available time slot', () => {
      const bookedSlots = ['10:00', '14:00', '16:00'];
      expect(isTimeSlotAvailable('12:00', bookedSlots, 60)).toBe(true);
    });

    it('should return false for occupied time slot', () => {
      const bookedSlots = ['10:00', '14:00', '16:00'];
      expect(isTimeSlotAvailable('10:00', bookedSlots, 60)).toBe(false);
    });

    it('should handle duration overlaps', () => {
      const bookedSlots = ['10:00'];
      // 10:30 would overlap with 10:00 + 60 min duration
      expect(isTimeSlotAvailable('10:30', bookedSlots, 60)).toBe(false);
    });
  });
});