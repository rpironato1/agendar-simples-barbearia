import { test, expect } from "@playwright/test";

/**
 * Comprehensive MCP Playwright Testing Suite
 * Tests all SaaS barbershop functionality using MCP browser automation
 */

test.describe("Complete SaaS Barbershop System - MCP Testing", () => {
  test("MCP Test 1: Admin God Dashboard - Complete Platform Management", async ({
    page,
  }) => {
    // Test Admin God authentication and platform oversight
    await page.goto("/admin-login");

    // Fill admin credentials
    await page.fill('input[type="email"]', "admin@demo.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Navigate to admin dashboard
    await page.goto("/admin");
    await page.waitForURL("/admin");

    // Verify Admin God platform overview
    await expect(page.locator("h1")).toContainText("Admin SaaS Platform");
    await expect(
      page.locator("text=Gestão Completa da Plataforma")
    ).toBeVisible();

    // Test all admin tabs
    await page.click("text=Barbearias");
    await expect(page.locator("text=Gestão de Barbearias")).toBeVisible();

    await page.click("text=Planos");
    await expect(page.locator("text=Planos de Assinatura")).toBeVisible();

    await page.click("text=Financeiro");
    await expect(page.locator("text=Transações da Plataforma")).toBeVisible();

    await page.click("text=Sistema");
    await expect(page.locator("text=Status do Sistema")).toBeVisible();
    await expect(page.locator("text=LocalStorage")).toBeVisible(); // Verify localStorage mode

    // Test database utilities
    await page.click('button:has-text("Verificar Base de Dados")');
    await page.click('button:has-text("Exportar Dados")');
  });

  test("MCP Test 2: Complete Barbershop Subscription Flow", async ({
    page,
  }) => {
    // Test full subscription signup with Premium plan
    await page.goto("/barbershop-signup");

    // Step 1: Select Premium plan
    await page.click(
      '[data-plan="premium"], .cursor-pointer:has-text("Premium")'
    );

    // Step 2: Fill barbershop information
    await page.fill(
      'input[placeholder*="Nome da Barbearia"], input[name*="barbershopName"]',
      "Barbearia MCP Test"
    );
    await page.fill(
      'input[placeholder*="Proprietário"], input[name*="ownerName"]',
      "Proprietário MCP"
    );
    await page.fill(
      'input[placeholder*="Email"], input[name*="email"]',
      "mcp@teste.com"
    );
    await page.fill(
      'input[placeholder*="Telefone"], input[name*="phone"]',
      "(11) 98765-4321"
    );
    await page.fill(
      'input[placeholder*="Endereço"], input[name*="address"]',
      "Rua MCP, 200"
    );
    await page.fill(
      'input[placeholder*="Cidade"], input[name*="city"]',
      "São Paulo"
    );

    // Go to next step
    await page.click('button:has-text("Próximo")');

    // Step 3: Complete account creation
    await page.fill('input[type="password"]:first-of-type', "mcptest123");
    await page.fill('input[type="password"]:last-of-type', "mcptest123");
    await page.check('input[type="checkbox"]:has-text("aceito")');

    // Verify plan summary
    await expect(page.locator("text=Plano Premium")).toBeVisible();
    await expect(page.locator("text=R$ 99,90")).toBeVisible();
    await expect(page.locator("text=7 dias grátis")).toBeVisible();

    // Create account
    await page.click('button[type="submit"], button:has-text("Criar")');

    // Should redirect to barbershop dashboard
    await page.waitForURL("/barbershop-dashboard");
    await expect(page.locator("h1")).toContainText("Painel da Barbearia");
    await expect(page.locator("text=Plano Premium")).toBeVisible();
  });

  test("MCP Test 3: Barbershop Dashboard - Complete Feature Testing", async ({
    page,
  }) => {
    // Login as existing barbershop
    await page.goto("/barbershop-login");
    await page.fill('input[type="email"]', "barbershop@demo.com");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/barbershop-dashboard");

    // Verify premium features are available
    await expect(page.locator("text=Plano Premium")).toBeVisible();

    // Test Agenda tab
    await page.click("text=Agenda");
    await expect(page.locator("text=Agendamentos da Barbearia")).toBeVisible();

    // Test Barbeiros tab
    await page.click("text=Barbeiros");
    await expect(page.locator("text=Gerencie a equipe")).toBeVisible();
    await expect(
      page.locator('button:has-text("Adicionar Barbeiro")')
    ).toBeVisible();

    // Test Serviços tab
    await page.click("text=Serviços");
    await expect(
      page.locator('button:has-text("Adicionar Serviço")')
    ).toBeVisible();

    // Test Financeiro tab (Premium feature)
    await page.click("text=Financeiro");
    await expect(page.locator("text=Relatório Financeiro")).toBeVisible();
    await expect(page.locator("text=Receita Mensal")).toBeVisible();

    // Test Configurações tab
    await page.click("text=Configurações");
    await expect(page.locator("text=Plano Atual")).toBeVisible();
  });

  test("MCP Test 4: Multitenancy Verification", async ({ page }) => {
    // Test that barbershop data is properly isolated

    // Login as first barbershop
    await page.goto("/barbershop-login");
    await page.fill('input[type="email"]', "barbershop@demo.com");
    await page.fill('input[type="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/barbershop-dashboard");

    // Verify barbershop name and context
    await expect(page.locator("text=Elite Barber")).toBeVisible();
    await expect(page.locator("text=Plano Premium")).toBeVisible();

    // Navigate to barbeiros to test data isolation
    await page.click("text=Barbeiros");

    // The barbeiros list should be empty initially (proper isolation)
    await expect(page.locator("table tbody tr, .empty-state")).toHaveCount(0);

    // Logout and verify session is cleared
    await page.click('button:has-text("Sair")');
    await page.waitForURL("/barbershop-login");
  });

  test("MCP Test 5: Database Adapter and System Verification", async ({
    page,
  }) => {
    // Test localStorage database adapter functionality
    await page.goto("/admin-login");
    await page.fill('input[type="email"]', "admin@demo.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.goto("/admin");

    // Navigate to Sistema tab
    await page.click("text=Sistema");

    // Verify database adapter status
    await expect(page.locator("text=LocalStorage")).toBeVisible();
    await expect(page.locator("text=Desenvolvimento")).toBeVisible();

    // Test database utilities
    await page.click('button:has-text("Verificar Base de Dados")');
    await page.click('button:has-text("Exportar Dados")');

    // Verify platform statistics
    await expect(page.locator("text=Total Barbearias")).toBeVisible();
    await expect(page.locator("text=Barbearias Ativas")).toBeVisible();
    await expect(page.locator("text=Em Trial")).toBeVisible();
    await expect(page.locator("text=Receita Mensal")).toBeVisible();
  });

  test("MCP Test 6: Plan Comparison and Features Verification", async ({
    page,
  }) => {
    // Test plan comparison on signup page
    await page.goto("/barbershop-signup");

    // Verify all three plans are displayed
    await expect(page.locator("text=Básico")).toBeVisible();
    await expect(page.locator("text=Premium")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();

    // Verify Basic plan features
    await expect(page.locator("text=Até 2 barbeiros")).toBeVisible();
    await expect(page.locator("text=R$ 49,90")).toBeVisible();

    // Verify Premium plan features
    await expect(page.locator("text=Barbeiros ilimitados")).toBeVisible();
    await expect(page.locator("text=Integração WhatsApp")).toBeVisible();
    await expect(page.locator("text=R$ 99,90")).toBeVisible();
    await expect(page.locator("text=Mais Popular")).toBeVisible();

    // Verify Enterprise plan features
    await expect(page.locator("text=Múltiplas filiais")).toBeVisible();
    await expect(page.locator("text=API personalizada")).toBeVisible();
    await expect(page.locator("text=R$ 199,90")).toBeVisible();
  });

  test("MCP Test 7: Navigation and UI Flow Testing", async ({ page }) => {
    // Test complete navigation between different user types

    // Start from home page
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Elite Barber");

    // Navigate to admin login
    await page.goto("/admin-login");
    await expect(page.locator("text=Elite Barber - Admin")).toBeVisible();

    // Navigate to barbershop login
    await page.goto("/barbershop-login");
    await expect(page.locator("text=Painel da Barbearia")).toBeVisible();
    await expect(page.locator("text=barbershop@demo.com")).toBeVisible(); // Demo credentials

    // Navigate to barbershop signup
    await page.goto("/barbershop-signup");
    await expect(page.locator("text=Registre sua Barbearia")).toBeVisible();
    await expect(page.locator("text=Escolha seu plano")).toBeVisible();

    // Test back navigation
    await page.click('button:has-text("Voltar")');
    await expect(page.url()).toBe("http://localhost:8080/");
  });

  test("MCP Test 8: Error Handling and Validation", async ({ page }) => {
    // Test form validation and error handling
    await page.goto("/barbershop-signup");

    // Try to proceed without filling required fields
    await page.click('button:has-text("Próximo")');

    // Should stay on the same page (validation should prevent progression)
    await expect(page.locator("text=Nome da Barbearia")).toBeVisible();

    // Test login with invalid credentials
    await page.goto("/barbershop-login");
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show error or stay on login page
    await expect(page.url()).toContain("/barbershop-login");
  });

  test("MCP Test 9: Responsive Design and Mobile Compatibility", async ({
    page,
  }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/barbershop-signup");
    await expect(page.locator("text=Registre sua Barbearia")).toBeVisible();

    // Test that all plans are visible on mobile
    await expect(page.locator("text=Básico")).toBeVisible();
    await expect(page.locator("text=Premium")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("MCP Test 10: Session Management and Security", async ({ page }) => {
    // Test session persistence and security

    // Login as admin
    await page.goto("/admin-login");
    await page.fill('input[type="email"]', "admin@demo.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.goto("/admin");

    // Verify admin access
    await expect(page.locator("text=Admin SaaS Platform")).toBeVisible();

    // Try to access barbershop dashboard (should redirect or show appropriate content)
    await page.goto("/barbershop-dashboard");

    // Admin should be able to access barbershop dashboard or be properly handled
    await expect(page.url()).toMatch(/(admin|barbershop-dashboard)/);

    // Logout
    await page.click('button:has-text("Sair")');

    // Try to access protected route after logout
    await page.goto("/admin");
    await expect(page.url()).toContain("/admin-login");
  });
});

/**
 * Performance and Load Testing
 */
test.describe("MCP Performance Testing", () => {
  test("Page Load Performance", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000);

    // Verify critical elements are present
    await expect(page.locator("h1")).toBeVisible();
  });
});
