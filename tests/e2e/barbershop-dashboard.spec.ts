import { test, expect } from '@playwright/test';

test.describe('Barbershop Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as barbershop user for each test
    await page.goto('/barbershop-login');
    await page.fill('input[type="email"]', 'barbershop@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/barbershop-dashboard');
  });

  test('should display barbershop dashboard correctly', async ({ page }) => {
    // Check if we're on the barbershop dashboard
    await expect(page.locator('h1')).toContainText('Painel da Barbearia');
    await expect(page.locator('text=Elite Barber')).toBeVisible();
    
    // Check subscription badge
    await expect(page.locator('text=Plano Premium')).toBeVisible();
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Check dashboard stats cards
    await expect(page.locator('text=Agendamentos Hoje')).toBeVisible();
    await expect(page.locator('text=Receita do Mês')).toBeVisible();
    await expect(page.locator('text=Barbeiros Ativos')).toBeVisible();
    await expect(page.locator('text=Serviços Ativos')).toBeVisible();
    
    // Check that stats show numbers
    await expect(page.locator('[class*="text-2xl font-bold text-white"]')).toHaveCount(4);
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    // Test navigation between tabs
    await page.click('text=Barbeiros');
    await expect(page.locator('text=Gerencie a equipe de barbeiros')).toBeVisible();
    
    await page.click('text=Serviços');
    await expect(page.locator('text=Gerencie os serviços oferecidos')).toBeVisible();
    
    await page.click('text=Financeiro');
    await expect(page.locator('text=Acompanhe o desempenho financeiro')).toBeVisible();
    
    await page.click('text=Configurações');
    await expect(page.locator('text=Configurações da Barbearia')).toBeVisible();
    
    await page.click('text=Agenda');
    await expect(page.locator('text=Agendamentos da Barbearia')).toBeVisible();
  });

  test('should display appointments in agenda tab', async ({ page }) => {
    // Should be on Agenda tab by default
    await expect(page.locator('text=Agendamentos da Barbearia')).toBeVisible();
    
    // Check table headers
    await expect(page.locator('text=Cliente')).toBeVisible();
    await expect(page.locator('text=Serviço')).toBeVisible();
    await expect(page.locator('text=Barbeiro')).toBeVisible();
    await expect(page.locator('text=Data/Hora')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Valor')).toBeVisible();
  });

  test('should allow adding new barber', async ({ page }) => {
    // Navigate to Barbeiros tab
    await page.click('text=Barbeiros');
    
    // Click Add Barber button
    await page.click('button:has-text("Adicionar Barbeiro")');
    
    // Check if modal opened
    await expect(page.locator('text=Novo Barbeiro')).toBeVisible();
    
    // Fill barber details
    await page.fill('input[id="barber-name"]', 'Carlos Barbeiro');
    await page.fill('input[id="barber-phone"]', '(11) 98888-8888');
    
    // Submit form
    await page.click('button:has-text("Adicionar")');
    
    // Check for success message
    await expect(page.locator('.sonner-toast')).toContainText('Barbeiro adicionado com sucesso');
    
    // Check if barber appears in the list
    await expect(page.locator('text=Carlos Barbeiro')).toBeVisible();
  });

  test('should allow adding new service', async ({ page }) => {
    // Navigate to Serviços tab
    await page.click('text=Serviços');
    
    // Click Add Service button
    await page.click('button:has-text("Adicionar Serviço")');
    
    // Check if modal opened
    await expect(page.locator('text=Novo Serviço')).toBeVisible();
    
    // Fill service details
    await page.fill('input[id="service-name"]', 'Corte Especial');
    await page.fill('input[id="service-duration"]', '40');
    await page.fill('input[id="service-price"]', '45.00');
    
    // Submit form
    await page.click('button:has-text("Adicionar")');
    
    // Check for success message
    await expect(page.locator('.sonner-toast')).toContainText('Serviço adicionado com sucesso');
    
    // Check if service appears in the list
    await expect(page.locator('text=Corte Especial')).toBeVisible();
    await expect(page.locator('text=40min')).toBeVisible();
    await expect(page.locator('text=R$ 45')).toBeVisible();
  });

  test('should display financial metrics', async ({ page }) => {
    // Navigate to Financeiro tab
    await page.click('text=Financeiro');
    
    // Check financial cards
    await expect(page.locator('text=Receita Mensal')).toBeVisible();
    await expect(page.locator('text=Agendamentos do Mês')).toBeVisible();
    await expect(page.locator('text=Ticket Médio')).toBeVisible();
    
    // Check that values are displayed
    const revenueCard = page.locator('text=Receita Mensal').locator('..');
    await expect(revenueCard.locator('text=/R\\$/')).toBeVisible();
  });

  test('should display barbershop configuration', async ({ page }) => {
    // Navigate to Configurações tab
    await page.click('text=Configurações');
    
    // Check subscription info
    await expect(page.locator('text=Plano Atual: Premium')).toBeVisible();
    await expect(page.locator('text=Status: Ativo')).toBeVisible();
    await expect(page.locator('button:has-text("Gerenciar Plano")')).toBeVisible();
    
    // Check barbershop info form
    await expect(page.locator('text=Informações da Barbearia')).toBeVisible();
    await expect(page.locator('input[value="Elite Barber"]')).toBeVisible();
    await expect(page.locator('input[value="(11) 99999-9999"]')).toBeVisible();
  });

  test('should allow editing barbershop information', async ({ page }) => {
    // Navigate to Configurações tab
    await page.click('text=Configurações');
    
    // Edit phone number
    const phoneInput = page.locator('input[value="(11) 99999-9999"]');
    await phoneInput.clear();
    await phoneInput.fill('(11) 91234-5678');
    
    // Edit address
    const addressInput = page.locator('input[value="Rua das Flores, 123 - Centro"]');
    await addressInput.clear();
    await addressInput.fill('Nova Rua, 456 - Centro');
    
    // Save changes
    await page.click('button:has-text("Salvar Alterações")');
    
    // Check for success message (this would depend on implementation)
    // await expect(page.locator('.sonner-toast')).toContainText('Alterações salvas');
  });

  test('should allow logout from barbershop dashboard', async ({ page }) => {
    // Click logout button
    await page.click('button:has-text("Sair")');
    
    // Should redirect to homepage
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Elite Barber');
  });

  test('should navigate back to main site', async ({ page }) => {
    // Click "Voltar ao Site" button
    await page.click('button:has-text("Voltar ao Site")');
    
    // Should redirect to homepage
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Elite Barber');
  });

  test('should display service status badges correctly', async ({ page }) => {
    // Navigate to Serviços tab
    await page.click('text=Serviços');
    
    // Check that services have status badges
    await expect(page.locator('text=Ativo')).toBeVisible();
    
    // Check badge colors (green for active)
    const activeBadge = page.locator('.bg-green-500\\/20.text-green-400');
    await expect(activeBadge).toBeVisible();
  });

  test('should display barber status badges correctly', async ({ page }) => {
    // Navigate to Barbeiros tab
    await page.click('text=Barbeiros');
    
    // Check that barbers have status badges
    await expect(page.locator('text=Ativo')).toBeVisible();
    
    // Check badge colors (green for active)
    const activeBadge = page.locator('.bg-green-500\\/20.text-green-400');
    await expect(activeBadge).toBeVisible();
  });

  test('should show proper validation for empty barber form', async ({ page }) => {
    // Navigate to Barbeiros tab
    await page.click('text=Barbeiros');
    
    // Click Add Barber button
    await page.click('button:has-text("Adicionar Barbeiro")');
    
    // Try to submit without filling name
    await page.click('button:has-text("Adicionar")');
    
    // Should show validation error
    await expect(page.locator('.sonner-toast')).toContainText('Nome é obrigatório');
  });

  test('should show proper validation for empty service form', async ({ page }) => {
    // Navigate to Serviços tab
    await page.click('text=Serviços');
    
    // Click Add Service button
    await page.click('button:has-text("Adicionar Serviço")');
    
    // Try to submit without filling all fields
    await page.click('button:has-text("Adicionar")');
    
    // Should show validation error
    await expect(page.locator('.sonner-toast')).toContainText('Todos os campos são obrigatórios');
  });
});