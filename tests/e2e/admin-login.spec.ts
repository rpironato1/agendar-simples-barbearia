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

  test('should display admin dashboard features - SaaS Platform Management', async ({ page }) => {
    // Login as admin first
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Check if we're now in the God Admin Dashboard
    await expect(page.locator('h1')).toContainText('Admin SaaS Platform');
    await expect(page.locator('text=Gestão Completa da Plataforma')).toBeVisible();
    
    // Check platform stats cards
    await expect(page.locator('text=Total Barbearias')).toBeVisible();
    await expect(page.locator('text=Barbearias Ativas')).toBeVisible();
    await expect(page.locator('text=Em Trial')).toBeVisible();
    await expect(page.locator('text=Receita Mensal')).toBeVisible();
    
    // Check tabs are present
    await expect(page.locator('text=Barbearias')).toBeVisible();
    await expect(page.locator('text=Planos')).toBeVisible();
    await expect(page.locator('text=Financeiro')).toBeVisible();
    await expect(page.locator('text=Sistema')).toBeVisible();
  });

  test('should be able to navigate between platform management tabs', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Test navigation between platform tabs
    await page.click('text=Barbearias');
    await expect(page.locator('text=Gestão de Barbearias')).toBeVisible();
    await expect(page.locator('text=Todas as barbearias cadastradas na plataforma')).toBeVisible();
    
    await page.click('text=Planos');
    await expect(page.locator('text=Planos de Assinatura')).toBeVisible();
    await expect(page.locator('text=Básico')).toBeVisible();
    await expect(page.locator('text=Premium')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
    
    await page.click('text=Financeiro');
    await expect(page.locator('text=Transações da Plataforma')).toBeVisible();
    
    await page.click('text=Sistema');
    await expect(page.locator('text=Status do Sistema')).toBeVisible();
    await expect(page.locator('text=Base de Dados:')).toBeVisible();
    await expect(page.locator('text=LocalStorage')).toBeVisible();
  });

  test('should allow platform admin to view subscription plans', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Navigate to Planos tab
    await page.click('text=Planos');
    
    // Verify subscription plans are displayed
    await expect(page.locator('text=Básico')).toBeVisible();
    await expect(page.locator('text=R$ 49.9')).toBeVisible();
    
    await expect(page.locator('text=Premium')).toBeVisible();
    await expect(page.locator('text=R$ 99.9')).toBeVisible();
    await expect(page.locator('text=Popular')).toBeVisible();
    
    await expect(page.locator('text=Enterprise')).toBeVisible();
    await expect(page.locator('text=R$ 199.9')).toBeVisible();
    
    // Check features are displayed
    await expect(page.locator('text=Barbeiros:')).toBeVisible();
    await expect(page.locator('text=Clientes:')).toBeVisible();
    await expect(page.locator('text=Ilimitado')).toBeVisible();
  });

  test('should allow platform admin to check system status', async ({ page }) => {
    // Login as admin
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    
    // Navigate to Sistema tab
    await page.click('text=Sistema');
    
    // Check system information
    await expect(page.locator('text=Status do Sistema')).toBeVisible();
    await expect(page.locator('text=Base de Dados:')).toBeVisible();
    await expect(page.locator('text=LocalStorage')).toBeVisible();
    await expect(page.locator('text=Versão:')).toBeVisible();
    await expect(page.locator('text=1.0.0')).toBeVisible();
    
    // Check development tools
    await expect(page.locator('button:has-text("Verificar Base de Dados")')).toBeVisible();
    await expect(page.locator('button:has-text("Exportar Dados")')).toBeVisible();
    
    // Test database verification button
    await page.click('button:has-text("Verificar Base de Dados")');
    await expect(page.locator('.sonner-toast')).toBeVisible();
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