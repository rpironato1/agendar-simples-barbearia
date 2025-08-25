import { test, expect } from '@playwright/test';

test.describe('Appointment Booking and Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to booking page from homepage', async ({ page }) => {
    // Click on booking button from homepage
    await page.click('button:has-text("Agendar Horário")');
    
    // Should navigate to booking page
    await page.waitForURL('/booking');
    await expect(page.locator('h1')).toContainText('Agendar Serviço');
  });

  test('should display booking form with all required fields', async ({ page }) => {
    await page.goto('/booking');
    
    // Check form fields are present
    await expect(page.locator('text=Nome Completo')).toBeVisible();
    await expect(page.locator('text=Telefone')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Serviço')).toBeVisible();
    await expect(page.locator('text=Barbeiro')).toBeVisible();
    await expect(page.locator('text=Data')).toBeVisible();
    await expect(page.locator('text=Horário')).toBeVisible();
  });

  test('should load available services in dropdown', async ({ page }) => {
    await page.goto('/booking');
    
    // Click on service dropdown
    await page.click('[data-testid="service-select"]');
    
    // Check if services are loaded
    await expect(page.locator('text=Corte Clássico')).toBeVisible();
    await expect(page.locator('text=Barba Completa')).toBeVisible();
    await expect(page.locator('text=Combo Premium')).toBeVisible();
  });

  test('should load available barbers in dropdown', async ({ page }) => {
    await page.goto('/booking');
    
    // Click on barber dropdown
    await page.click('[data-testid="barber-select"]');
    
    // Check if "Qualquer barbeiro" option is available
    await expect(page.locator('text=Qualquer barbeiro')).toBeVisible();
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto('/booking');
    
    // Try to submit form without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('input:invalid')).toHaveCount(5); // HTML5 validation
  });

  test('should allow selecting date from calendar', async ({ page }) => {
    await page.goto('/booking');
    
    // Click on date picker
    await page.click('button:has-text("Selecionar data")');
    
    // Calendar should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Janeiro')).toBeVisible(); // or current month
    
    // Select a future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    // Calendar should close and date should be selected
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/booking');
    
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show email validation error
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
  });

  test('should validate phone format', async ({ page }) => {
    await page.goto('/booking');
    
    // Fill all required fields with valid data
    await page.fill('input[placeholder="João Silva"]', 'Teste Cliente');
    await page.fill('input[type="email"]', 'teste@email.com');
    await page.fill('input[placeholder*="telefone"]', '123'); // Invalid phone
    
    // Select service
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    // Select time
    await page.click('[data-testid="time-select"]');
    await page.click('text=09:00');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show phone validation error
    await expect(page.locator('text=Telefone inválido')).toBeVisible();
  });

  test('should successfully create appointment with valid data', async ({ page }) => {
    await page.goto('/booking');
    
    // Fill all required fields with valid data
    await page.fill('input[placeholder="João Silva"]', 'Cliente Teste E2E');
    await page.fill('input[type="email"]', 'cliente@teste.com');
    await page.fill('input[placeholder*="telefone"]', '(11) 99999-9999');
    
    // Select service
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    // Select time
    await page.click('[data-testid="time-select"]');
    await page.click('text=09:00');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.sonner-toast')).toContainText('Agendamento criado com sucesso');
  });

  test('should show appointment details in confirmation', async ({ page }) => {
    await page.goto('/booking');
    
    // Fill form and create appointment (similar to previous test)
    await page.fill('input[placeholder="João Silva"]', 'Cliente Teste E2E');
    await page.fill('input[type="email"]', 'cliente@teste.com');
    await page.fill('input[placeholder*="telefone"]', '(11) 99999-9999');
    
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    await page.click('[data-testid="time-select"]');
    await page.click('text=09:00');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to confirmation page or show details
    await expect(page.locator('text=Cliente Teste E2E')).toBeVisible();
    await expect(page.locator('text=Corte Clássico')).toBeVisible();
  });

  test('should toggle between login and register mode', async ({ page }) => {
    await page.goto('/booking');
    
    // Should be in register mode by default
    await expect(page.locator('text=Criar conta e agendar')).toBeVisible();
    
    // Switch to login mode
    await page.click('button:has-text("Já tenho conta")');
    
    // Should show login fields
    await expect(page.locator('text=Fazer login e agendar')).toBeVisible();
    await expect(page.locator('text=Senha')).toBeVisible();
    
    // Switch back to register mode
    await page.click('button:has-text("Criar nova conta")');
    
    // Should show register fields
    await expect(page.locator('text=Criar conta e agendar')).toBeVisible();
  });

  test('should validate CPF format if provided', async ({ page }) => {
    await page.goto('/booking');
    
    // Fill CPF field with invalid format
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00'); // Invalid CPF
    
    // Try to submit (fill other required fields first)
    await page.fill('input[placeholder="João Silva"]', 'Cliente Teste');
    await page.fill('input[type="email"]', 'teste@email.com');
    await page.fill('input[placeholder*="telefone"]', '(11) 99999-9999');
    
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    await page.click('[data-testid="time-select"]');
    await page.click('text=09:00');
    
    await page.click('button[type="submit"]');
    
    // Should show CPF validation error
    await expect(page.locator('text=CPF inválido')).toBeVisible();
  });

  test('should prevent selecting past dates', async ({ page }) => {
    await page.goto('/booking');
    
    // Click on date picker
    await page.click('button:has-text("Selecionar data")');
    
    // Try to select yesterday (should be disabled)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayButton = page.locator(`button:has-text("${yesterday.getDate()}")`);
    if (await yesterdayButton.isVisible()) {
      await expect(yesterdayButton).toBeDisabled();
    }
  });

  test('should show available time slots for selected date', async ({ page }) => {
    await page.goto('/booking');
    
    // Select a service first (required for time slots)
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    // Select date
    await page.click('button:has-text("Selecionar data")');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    // Check time slots dropdown
    await page.click('[data-testid="time-select"]');
    
    // Should show available time slots
    await expect(page.locator('text=09:00')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();
    await expect(page.locator('text=11:00')).toBeVisible();
  });

  test('should update price when service is selected', async ({ page }) => {
    await page.goto('/booking');
    
    // Select a service
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    // Should show price
    await expect(page.locator('text=/R\\$\\s*35/')).toBeVisible();
  });

  test('should allow user to login during booking process', async ({ page }) => {
    await page.goto('/booking');
    
    // Switch to login mode
    await page.click('button:has-text("Já tenho conta")');
    
    // Fill login credentials
    await page.fill('input[type="email"]', 'usuario@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    
    // Fill booking details
    await page.click('[data-testid="service-select"]');
    await page.click('text=Corte Clássico');
    
    await page.click('button:has-text("Selecionar data")');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);
    
    await page.click('[data-testid="time-select"]');
    await page.click('text=09:00');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should process the booking (might show error for invalid credentials)
    await expect(page.locator('button[type="submit"]')).toBeDisabled(); // During loading
  });
});