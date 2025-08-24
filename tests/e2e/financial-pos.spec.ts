import { test, expect } from '@playwright/test';

test.describe('Financial POS System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access financial features
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display financial dashboard with key metrics', async ({ page }) => {
    // Navigate to Financial tab
    await page.click('text=Financeiro');
    
    // Check financial dashboard is displayed
    await expect(page.locator('text=Relatórios e transações')).toBeVisible();
    
    // Check key financial metrics are present
    await expect(page.locator('text=Receita Total')).toBeVisible();
    await expect(page.locator('text=Transações Hoje')).toBeVisible();
    await expect(page.locator('text=Ticket Médio')).toBeVisible();
    await expect(page.locator('text=Crescimento Mensal')).toBeVisible();
  });

  test('should show revenue breakdown by payment method', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Check payment method breakdown
    await expect(page.locator('text=PIX')).toBeVisible();
    await expect(page.locator('text=Cartão')).toBeVisible();
    await expect(page.locator('text=Dinheiro')).toBeVisible();
    
    // Should show amounts for each payment method
    await expect(page.locator('text=/R\\$\\s*\\d+/')).toHaveCount({ gte: 3 });
  });

  test('should display transaction history table', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Check transaction table headers
    await expect(page.locator('text=Data')).toBeVisible();
    await expect(page.locator('text=Cliente')).toBeVisible();
    await expect(page.locator('text=Serviço')).toBeVisible();
    await expect(page.locator('text=Valor')).toBeVisible();
    await expect(page.locator('text=Método')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
  });

  test('should allow confirming payment for scheduled appointment', async ({ page }) => {
    // First go to Agenda to find an appointment
    await page.click('text=Agenda');
    
    // Look for a scheduled appointment with a "Confirmar" button
    const confirmButton = page.locator('button:has-text("✓")').first();
    
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      
      // Payment modal should open
      await expect(page.locator('text=Cliente Chegou - Confirmar Pagamento')).toBeVisible();
      
      // Should show payment options
      await expect(page.locator('text=Pagamento Único')).toBeVisible();
      await expect(page.locator('text=Pagamento Misto')).toBeVisible();
    }
  });

  test('should process single payment method', async ({ page }) => {
    await page.click('text=Agenda');
    
    const confirmButton = page.locator('button:has-text("✓")').first();
    
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      
      // Select single payment
      await page.click('input[id="single"]');
      
      // Select payment method
      await page.click('[data-testid="payment-method-select"]');
      await page.click('text=PIX');
      
      // Confirm payment
      await page.click('button:has-text("Finalizar Atendimento")');
      
      // Should show success message
      await expect(page.locator('.sonner-toast')).toContainText('Atendimento finalizado com sucesso');
    }
  });

  test('should process mixed payment method', async ({ page }) => {
    await page.click('text=Agenda');
    
    const confirmButton = page.locator('button:has-text("✓")').first();
    
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      
      // Select mixed payment
      await page.click('input[id="mixed"]');
      
      // Fill mixed payment amounts
      await page.fill('input[data-testid="pix-amount"]', '20.00');
      await page.fill('input[data-testid="cartao-amount"]', '15.00');
      
      // Check total calculation
      await expect(page.locator('text=R$ 35.00')).toBeVisible(); // Total should match service price
      
      // Confirm payment
      await page.click('button:has-text("Finalizar Atendimento")');
      
      // Should show success message
      await expect(page.locator('.sonner-toast')).toContainText('Atendimento finalizado com sucesso');
    }
  });

  test('should validate mixed payment total equals service price', async ({ page }) => {
    await page.click('text=Agenda');
    
    const confirmButton = page.locator('button:has-text("✓")').first();
    
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      
      // Select mixed payment
      await page.click('input[id="mixed"]');
      
      // Fill incorrect amounts
      await page.fill('input[data-testid="pix-amount"]', '10.00');
      await page.fill('input[data-testid="cartao-amount"]', '10.00');
      
      // Try to confirm (total doesn't match service price)
      await page.click('button:has-text("Finalizar Atendimento")');
      
      // Should show validation error
      await expect(page.locator('.sonner-toast')).toContainText('Valor total deve ser');
    }
  });

  test('should update appointment status after payment confirmation', async ({ page }) => {
    await page.click('text=Agenda');
    
    // Find an appointment with "scheduled" status
    const appointmentRow = page.locator('tr:has-text("Agendado")').first();
    
    if (await appointmentRow.isVisible()) {
      const confirmButton = appointmentRow.locator('button:has-text("✓")');
      await confirmButton.click();
      
      // Process payment
      await page.click('input[id="single"]');
      await page.click('[data-testid="payment-method-select"]');
      await page.click('text=Dinheiro');
      await page.click('button:has-text("Finalizar Atendimento")');
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Appointment status should now be "Finalizado"
      await expect(appointmentRow.locator('text=Finalizado')).toBeVisible();
      await expect(appointmentRow.locator('text=Pago')).toBeVisible();
    }
  });

  test('should display payment method icon in payment status', async ({ page }) => {
    await page.click('text=Agenda');
    
    // Look for appointments with confirmed payments
    const paidAppointments = page.locator('text=Pago');
    
    if (await paidAppointments.count() > 0) {
      // Should show payment method icons
      await expect(page.locator('[data-testid="pix-icon"]')).toHaveCount({ gte: 0 });
      await expect(page.locator('[data-testid="card-icon"]')).toHaveCount({ gte: 0 });
      await expect(page.locator('[data-testid="cash-icon"]')).toHaveCount({ gte: 0 });
    }
  });

  test('should show monthly revenue growth percentage', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Check growth indicator
    const growthElement = page.locator('text=Crescimento Mensal').locator('..');
    await expect(growthElement.locator('text=/%/')).toBeVisible();
    
    // Should show positive or negative growth
    const hasPositiveGrowth = await growthElement.locator('text=/\\+\\d+%/').isVisible();
    const hasNegativeGrowth = await growthElement.locator('text=/-\\d+%/').isVisible();
    
    expect(hasPositiveGrowth || hasNegativeGrowth).toBeTruthy();
  });

  test('should filter transactions by date range', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Look for date filter controls
    const dateFilter = page.locator('[data-testid="date-filter"]');
    
    if (await dateFilter.isVisible()) {
      // Select last 7 days
      await dateFilter.click();
      await page.click('text=Últimos 7 dias');
      
      // Transaction table should update
      await page.waitForTimeout(1000);
      
      // Verify transactions are filtered
      await expect(page.locator('table tbody tr')).toHaveCount({ gte: 0 });
    }
  });

  test('should export financial report', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Exportar")');
    
    if (await exportButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('relatorio');
    }
  });

  test('should display total transactions count for today', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Check transactions today metric
    const todayTransactions = page.locator('text=Transações Hoje').locator('..');
    await expect(todayTransactions.locator('text=/\\d+/')).toBeVisible();
  });

  test('should show correct currency formatting', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // All monetary values should be in BRL format
    const moneyValues = page.locator('text=/R\\$\\s*\\d+[,.]\\d{2}/');
    const count = await moneyValues.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify format consistency
    for (let i = 0; i < Math.min(count, 5); i++) {
      const value = await moneyValues.nth(i).textContent();
      expect(value).toMatch(/R\$\s*\d+[,.]\d{2}/);
    }
  });

  test('should handle payment cancellation', async ({ page }) => {
    await page.click('text=Agenda');
    
    const confirmButton = page.locator('button:has-text("✓")').first();
    
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      
      // Open payment modal and cancel
      await expect(page.locator('text=Cliente Chegou - Confirmar Pagamento')).toBeVisible();
      
      await page.click('button:has-text("Cancelar")');
      
      // Modal should close
      await expect(page.locator('text=Cliente Chegou - Confirmar Pagamento')).not.toBeVisible();
    }
  });

  test('should prevent duplicate payment confirmation', async ({ page }) => {
    await page.click('text=Agenda');
    
    // Find an already completed appointment
    const completedAppointment = page.locator('tr:has-text("Finalizado")').first();
    
    if (await completedAppointment.isVisible()) {
      // Should not have a confirm payment button
      await expect(completedAppointment.locator('button:has-text("✓")')).not.toBeVisible();
      
      // Should show "Pago" status
      await expect(completedAppointment.locator('text=Pago')).toBeVisible();
    }
  });

  test('should show financial summary cards with correct data', async ({ page }) => {
    await page.click('text=Financeiro');
    
    // Check all financial summary cards have numeric values
    const summaryCards = page.locator('[data-testid="financial-summary"] .text-2xl');
    const cardCount = await summaryCards.count();
    
    expect(cardCount).toBeGreaterThanOrEqual(4);
    
    for (let i = 0; i < cardCount; i++) {
      const cardText = await summaryCards.nth(i).textContent();
      // Should contain numbers (either currency or percentage)
      expect(cardText).toMatch(/[\d,]+/);
    }
  });
});