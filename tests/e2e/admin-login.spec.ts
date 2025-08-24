import { test, expect } from '@playwright/test';

test.describe('Admin Login and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to admin login page', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin-login');
    
    // Check if we're on the admin login page
    await expect(page).toHaveTitle(/Elite Barber/);
    await expect(page.locator('h1')).toContainText('Painel Administrativo');
  });

  test('should show error for invalid admin credentials', async ({ page }) => {
    await page.goto('/admin-login');
    
    // Fill invalid credentials
    await page.fill('input[type="email"]', 'invalid@admin.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should login with demo admin credentials', async ({ page }) => {
    await page.goto('/admin-login');
    
    // Fill demo credentials
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to admin dashboard
    await page.waitForURL('/admin');
    
    // Check if we're on the admin dashboard
    await expect(page.locator('h1')).toContainText('Painel Administrativo');
    await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible();
  });

  test('should display admin dashboard features', async ({ page }) => {
    // Login as admin first
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Check dashboard stats cards
    await expect(page.locator('text=Agendamentos Hoje')).toBeVisible();
    await expect(page.locator('text=Receita do Mês')).toBeVisible();
    await expect(page.locator('text=Barbeiros Ativos')).toBeVisible();
    await expect(page.locator('text=Serviços Ativos')).toBeVisible();
    
    // Check tabs are present
    await expect(page.locator('text=Agenda')).toBeVisible();
    await expect(page.locator('text=Financeiro')).toBeVisible();
    await expect(page.locator('text=Barbeiros')).toBeVisible();
    await expect(page.locator('text=Serviços')).toBeVisible();
    await expect(page.locator('text=Clientes')).toBeVisible();
  });

  test('should be able to navigate between admin tabs', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Test navigation between tabs
    await page.click('text=Barbeiros');
    await expect(page.locator('text=Gerencie a equipe de barbeiros')).toBeVisible();
    
    await page.click('text=Serviços');
    await expect(page.locator('text=Gerencie os serviços oferecidos')).toBeVisible();
    
    await page.click('text=Clientes');
    await expect(page.locator('text=Gestão de Clientes')).toBeVisible();
    
    await page.click('text=Financeiro');
    await expect(page.locator('text=Relatórios e transações')).toBeVisible();
  });

  test('should allow admin to add new barber', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Navigate to Barbeiros tab
    await page.click('text=Barbeiros');
    
    // Click Add Barber button
    await page.click('button:has-text("Adicionar Barbeiro")');
    
    // Fill barber details
    await page.fill('input[id="barber-name"]', 'João Silva');
    await page.fill('input[id="barber-phone"]', '11999999999');
    
    // Submit form
    await page.click('button:has-text("Adicionar")');
    
    // Check for success message
    await expect(page.locator('.sonner-toast')).toContainText('Barbeiro adicionado com sucesso');
  });

  test('should allow admin to add new service', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Navigate to Serviços tab
    await page.click('text=Serviços');
    
    // Click Add Service button
    await page.click('button:has-text("Adicionar Serviço")');
    
    // Fill service details
    await page.fill('input[id="service-name"]', 'Corte Premium');
    await page.fill('input[id="service-duration"]', '45');
    await page.fill('input[id="service-price"]', '50.00');
    
    // Submit form
    await page.click('button:has-text("Adicionar")');
    
    // Check for success message
    await expect(page.locator('.sonner-toast')).toContainText('Serviço adicionado com sucesso');
  });

  test('should allow admin to logout', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Click logout button
    await page.click('button:has-text("Sair")');
    
    // Should redirect to homepage
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Elite Barber');
  });
});