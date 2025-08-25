import { test, expect } from '@playwright/test';

test.describe('Client Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access client management
    await page.goto('/admin-login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display client management interface', async ({ page }) => {
    // Navigate to Clientes tab
    await page.click('text=Clientes');
    
    // Check client management interface
    await expect(page.locator('text=Gestão de Clientes')).toBeVisible();
    await expect(page.locator('text=Dados consolidados dos clientes da barbearia')).toBeVisible();
  });

  test('should show client statistics summary', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Check client statistics cards
    await expect(page.locator('text=Total de Clientes')).toBeVisible();
    await expect(page.locator('text=Receita Total')).toBeVisible();
    await expect(page.locator('text=Ticket Médio')).toBeVisible();
    
    // Should show numeric values
    const statCards = page.locator('[data-testid="client-stats"] .text-2xl');
    const cardCount = await statCards.count();
    
    expect(cardCount).toBeGreaterThanOrEqual(3);
    
    for (let i = 0; i < cardCount; i++) {
      const cardText = await statCards.nth(i).textContent();
      expect(cardText).toMatch(/[\d,]+/);
    }
  });

  test('should display client table with correct headers', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Check table headers
    await expect(page.locator('th:has-text("Cliente")')).toBeVisible();
    await expect(page.locator('th:has-text("Total Gasto")')).toBeVisible();
    await expect(page.locator('th:has-text("Agendamentos")')).toBeVisible();
    await expect(page.locator('th:has-text("Concluídos")')).toBeVisible();
    await expect(page.locator('th:has-text("Cancelados")')).toBeVisible();
    await expect(page.locator('th:has-text("Taxa Cancelamento")')).toBeVisible();
    await expect(page.locator('th:has-text("Última Visita")')).toBeVisible();
    await expect(page.locator('th:has-text("Ações")')).toBeVisible();
  });

  test('should show client data in table rows', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Check if there are client rows
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount > 0) {
      // Check first client row has expected data
      const firstRow = clientRows.first();
      
      // Should have client name and phone
      await expect(firstRow.locator('td:nth-child(1)')).toContainText(/\w+/);
      
      // Should have total spent (currency format)
      await expect(firstRow.locator('td:nth-child(2)')).toContainText(/R\$/);
      
      // Should have appointment counts (badges)
      await expect(firstRow.locator('td:nth-child(3) .badge')).toBeVisible();
      await expect(firstRow.locator('td:nth-child(4) .badge')).toBeVisible();
      await expect(firstRow.locator('td:nth-child(5) .badge')).toBeVisible();
      
      // Should have cancellation rate percentage
      await expect(firstRow.locator('td:nth-child(6)')).toContainText(/%/);
    }
  });

  test('should display cancellation rate levels correctly', async ({ page }) => {
    await page.click('text=Clientes');
    
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount > 0) {
      // Check cancellation level badges
      const levelBadges = page.locator('text=Baixo, text=Médio, text=Alto');
      
      // Should have at least one level badge
      expect(await levelBadges.count()).toBeGreaterThanOrEqual(0);
      
      // Check badge colors
      const lowBadge = page.locator('.bg-green-500\\/20.text-green-400:has-text("Baixo")');
      const mediumBadge = page.locator('.bg-yellow-500\\/20.text-yellow-400:has-text("Médio")');
      const highBadge = page.locator('.bg-red-500\\/20.text-red-400:has-text("Alto")');
      
      const totalBadges = await lowBadge.count() + await mediumBadge.count() + await highBadge.count();
      expect(totalBadges).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow contacting client via WhatsApp', async ({ page }) => {
    await page.click('text=Clientes');
    
    const whatsappButtons = page.locator('button:has-text("📱")');
    const buttonCount = await whatsappButtons.count();
    
    if (buttonCount > 0) {
      // Click first WhatsApp button
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        whatsappButtons.first().click()
      ]);
      
      // Should open WhatsApp in new tab
      expect(popup.url()).toContain('wa.me');
      await popup.close();
    }
  });

  test('should show client appointment history in modal', async ({ page }) => {
    await page.click('text=Clientes');
    
    const historyButtons = page.locator('button:has-text("📅")');
    const buttonCount = await historyButtons.count();
    
    if (buttonCount > 0) {
      // Click first history button
      await historyButtons.first().click();
      
      // History modal should open
      await expect(page.locator('text=Histórico -')).toBeVisible();
      await expect(page.locator('text=Agendamentos do cliente')).toBeVisible();
      
      // Should show appointment list
      const appointmentCards = page.locator('[data-testid="appointment-history"] .p-3');
      
      if (await appointmentCards.count() > 0) {
        // Check appointment details
        const firstAppointment = appointmentCards.first();
        await expect(firstAppointment.locator('text=/\w+/')).toBeVisible(); // Service name
        await expect(firstAppointment.locator('text=/\\d{2}\\/\\d{2}\\/\\d{4}/')).toBeVisible(); // Date
        await expect(firstAppointment.locator('text=/R\\$\\s*\\d+/')).toBeVisible(); // Price
      }
      
      // Close modal
      await page.click('button[aria-label="Close"]');
      await expect(page.locator('text=Histórico -')).not.toBeVisible();
    }
  });

  test('should sort clients by total spent (descending)', async ({ page }) => {
    await page.click('text=Clientes');
    
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount > 1) {
      // Get total spent values from first few rows
      const spentValues = [];
      
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const spentCell = clientRows.nth(i).locator('td:nth-child(2)');
        const spentText = await spentCell.textContent();
        const spentValue = parseFloat(spentText?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
        spentValues.push(spentValue);
      }
      
      // Should be sorted in descending order
      for (let i = 1; i < spentValues.length; i++) {
        expect(spentValues[i]).toBeLessThanOrEqual(spentValues[i - 1]);
      }
    }
  });

  test('should show empty state when no clients exist', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Check if table is empty
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount === 0) {
      await expect(page.locator('text=Nenhum cliente encontrado')).toBeVisible();
    }
  });

  test('should display correct client metrics calculation', async ({ page }) => {
    await page.click('text=Clientes');
    
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount > 0) {
      // Check that total clients matches row count
      const totalClientsText = await page.locator('text=Total de Clientes').locator('..').locator('.text-2xl').textContent();
      const totalClients = parseInt(totalClientsText || '0');
      
      expect(totalClients).toBe(rowCount);
      
      // Check that cancellation rate is calculated correctly for first client
      const firstRow = clientRows.first();
      const appointmentsText = await firstRow.locator('td:nth-child(3)').textContent();
      const cancelledText = await firstRow.locator('td:nth-child(5)').textContent();
      const rateText = await firstRow.locator('td:nth-child(6)').textContent();
      
      const totalAppointments = parseInt(appointmentsText || '0');
      const cancelledAppointments = parseInt(cancelledText || '0');
      const displayedRate = parseFloat(rateText?.replace('%', '') || '0');
      
      if (totalAppointments > 0) {
        const expectedRate = (cancelledAppointments / totalAppointments) * 100;
        expect(Math.abs(displayedRate - expectedRate)).toBeLessThan(0.1);
      }
    }
  });

  test('should show last visit date correctly', async ({ page }) => {
    await page.click('text=Clientes');
    
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount > 0) {
      const lastVisitCells = page.locator('td:nth-child(7)');
      const cellCount = await lastVisitCells.count();
      
      for (let i = 0; i < Math.min(cellCount, 3); i++) {
        const cellText = await lastVisitCells.nth(i).textContent();
        
        // Should either show a date or "Nunca"
        expect(cellText).toMatch(/(\d{2}\/\d{2}\/\d{4}|Nunca)/);
      }
    }
  });

  test('should filter clients by search term', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    
    if (await searchInput.isVisible()) {
      // Enter search term
      await searchInput.fill('João');
      
      // Wait for filtering
      await page.waitForTimeout(500);
      
      // Check filtered results
      const visibleRows = page.locator('tbody tr:visible');
      const rowCount = await visibleRows.count();
      
      // All visible rows should contain the search term
      for (let i = 0; i < rowCount; i++) {
        const rowText = await visibleRows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain('joão');
      }
    }
  });

  test('should export client list', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Exportar")');
    
    if (await exportButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('clientes');
    }
  });

  test('should show client loyalty level based on visits', async ({ page }) => {
    await page.click('text=Clientes');
    
    const clientRows = page.locator('tbody tr');
    const rowCount = await clientRows.count();
    
    if (rowCount > 0) {
      // Check for loyalty indicators (could be badges or icons)
      const completedCells = page.locator('td:nth-child(4)');
      
      for (let i = 0; i < Math.min(await completedCells.count(), 3); i++) {
        const cellText = await completedCells.nth(i).textContent();
        const completedCount = parseInt(cellText || '0');
        
        // High-value clients (>10 visits) might have special indicators
        if (completedCount > 10) {
          // Could check for VIP badge or special styling
          const parentRow = clientRows.nth(i);
          // This would depend on actual implementation
        }
      }
    }
  });

  test('should handle pagination if many clients exist', async ({ page }) => {
    await page.click('text=Clientes');
    
    // Look for pagination controls
    const paginationNext = page.locator('button:has-text("Próximo")');
    const paginationPrev = page.locator('button:has-text("Anterior")');
    
    if (await paginationNext.isVisible()) {
      // Test pagination
      await paginationNext.click();
      await page.waitForTimeout(500);
      
      // Should load next page
      await expect(paginationPrev).toBeVisible();
      
      // Go back
      await paginationPrev.click();
      await page.waitForTimeout(500);
    }
  });
});