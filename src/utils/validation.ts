
// Input validation and sanitization utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Brazilian phone: 10 or 11 digits
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateCPF = (cpf: string): boolean => {
  // Remove all non-digits
  const cleaned = cpf.replace(/\D/g, '');
  
  // CPF must have 11 digits
  if (cleaned.length !== 11) return false;
  
  // Check for repeated digits (invalid CPFs)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 2 && sanitized.length <= 100 && /^[a-zA-ZÀ-ÿ\s]+$/.test(sanitized);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos um número' };
  }
  
  return { valid: true };
};

export const validateAppointmentDate = (date: Date): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Cannot book appointments for past dates
  return appointmentDate >= today;
};

export const validateAppointmentTime = (time: string, date: Date): boolean => {
  const now = new Date();
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  // Cannot book appointments for past times on today
  if (date.toDateString() === now.toDateString()) {
    return appointmentDateTime > now;
  }
  
  return true;
};

export const sanitizePhoneNumber = (phone: string): string => {
  // Remove all non-digits and return
  return phone.replace(/\D/g, '');
};

export const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = sanitizePhoneNumber(phone);
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
};
