import { describe, it, expect } from 'vitest';
import { AuthService } from './business-logic';

describe('AuthService', () => {
  describe('validateLoginCredentials', () => {
    it('should validate correct email and password', () => {
      const result = AuthService.validateLoginCredentials('test@example.com', '123456');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation with empty email', () => {
      const result = AuthService.validateLoginCredentials('', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email é obrigatório');
    });

    it('should fail validation with invalid email', () => {
      const result = AuthService.validateLoginCredentials('invalid-email', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email inválido');
    });

    it('should fail validation with empty password', () => {
      const result = AuthService.validateLoginCredentials('test@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Senha é obrigatória');
    });

    it('should fail validation with short password', () => {
      const result = AuthService.validateLoginCredentials('test@example.com', '123');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Senha deve ter pelo menos 6 caracteres');
    });

    it('should return multiple errors for invalid email and password', () => {
      const result = AuthService.validateLoginCredentials('invalid', '123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email inválido');
      expect(result.errors.password).toBe('Senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('validateSignupData', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com', 
      phone: '(11) 99999-9999',
      password: 'Password123',
      confirmPassword: 'Password123'
    };

    it('should validate correct signup data', () => {
      const result = AuthService.validateSignupData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation with empty name', () => {
      const data = { ...validData, name: '' };
      const result = AuthService.validateSignupData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    it('should fail validation with short name', () => {
      const data = { ...validData, name: 'J' };
      const result = AuthService.validateSignupData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    it('should fail validation with invalid email', () => {
      const data = { ...validData, email: 'invalid-email' };
      const result = AuthService.validateSignupData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email inválido');
    });

    it('should fail validation with invalid phone', () => {
      const data = { ...validData, phone: '123456789' };
      const result = AuthService.validateSignupData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('Telefone inválido. Use o formato (11) 99999-9999');
    });

    it('should fail validation with password mismatch', () => {
      const data = { ...validData, confirmPassword: 'different123' };
      const result = AuthService.validateSignupData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Senhas não coincidem');
    });
  });
});