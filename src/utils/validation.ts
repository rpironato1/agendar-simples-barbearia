// Input validation and sanitization utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");
  // Brazilian phone: 10 or 11 digits
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateCPF = (cpf: string): boolean => {
  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

// ✅ Nova função específica para sanitizar nomes preservando espaços
export const sanitizeName = (name: string): string => {
  return name
    .replace(/[<>]/g, "") // Remove apenas caracteres perigosos
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único espaço
    .replace(/^\s+|\s+$/g, ""); // Remove espaços apenas do início e fim
};

export const validateName = (name: string): boolean => {
  const sanitized = sanitizeName(name); // ✅ Usar função específica para nomes
  return (
    sanitized.length >= 2 &&
    sanitized.length <= 100 &&
    /^[a-zA-ZÀ-ÿ\s]+$/.test(sanitized)
  );
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateAppointmentDate = (date: Date): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointmentDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // Cannot book appointments for past dates
  return appointmentDate >= today;
};

export const validateAppointmentTime = (time: string, date: Date): boolean => {
  const now = new Date();
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  // Cannot book appointments for past times on today
  if (date.toDateString() === now.toDateString()) {
    return appointmentDateTime > now;
  }

  return true;
};

export const sanitizePhoneNumber = (phone: string): string => {
  // Remove all non-digits and return
  return phone.replace(/\D/g, "");
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

// ✅ Função para formatar CPF
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length <= 3) {
    return cleanCPF;
  } else if (cleanCPF.length <= 6) {
    return cleanCPF.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  } else if (cleanCPF.length <= 9) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  }
};

// ✅ Função para sanitizar CPF (apenas números)
export const sanitizeCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, "").slice(0, 11);
};
