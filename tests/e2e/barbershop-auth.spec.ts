import { test, expect } from "@playwright/test";

test.describe("Barbershop Registration and Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to barbershop signup page", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Check if we're on the signup page
    await expect(page).toHaveTitle(/Elite Barber/);
    await expect(page.locator("h1")).toContainText("Registre sua Barbearia");
  });

  test("should display subscription plans correctly", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Check if all plans are displayed
    await expect(page.locator("text=Básico")).toBeVisible();
    await expect(page.locator("text=Premium")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();

    // Check plan features
    await expect(page.locator("text=R$ 49,90")).toBeVisible();
    await expect(page.locator("text=R$ 99,90")).toBeVisible();
    await expect(page.locator("text=R$ 199,90")).toBeVisible();

    // Check "Mais Popular" badge
    await expect(page.locator("text=Mais Popular")).toBeVisible();
  });

  test("should allow plan selection", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Select Basic plan
    await page.click('[data-plan="basic"]');
    await expect(page.locator('[data-plan="basic"]')).toHaveClass(
      /border-blue-500/
    );

    // Select Premium plan
    await page.click('[data-plan="premium"]');
    await expect(page.locator('[data-plan="premium"]')).toHaveClass(
      /border-amber-500/
    );

    // Select Enterprise plan
    await page.click('[data-plan="enterprise"]');
    await expect(page.locator('[data-plan="enterprise"]')).toHaveClass(
      /border-purple-500/
    );
  });

  test("should validate required fields in step 1", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Try to go to next step without filling required fields
    await page.click('button:has-text("Próximo Passo")');

    // Should show validation error
    await expect(page.locator('[role="alert"]')).toContainText(
      "Preencha todos os campos obrigatórios"
    );
  });

  test("should complete step 1 with valid data", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Fill required fields
    await page.fill('input[id="barbershopName"]', "Barbearia Teste E2E");
    await page.fill('input[id="ownerName"]', "João da Silva");
    await page.fill('input[id="email"]', "joao@barbeariateste.com");
    await page.fill('input[id="phone"]', "(11) 99999-9999");

    // Optional fields
    await page.fill('input[id="address"]', "Rua Teste, 123");
    await page.fill('input[id="city"]', "São Paulo");

    // Go to next step
    await page.click('button:has-text("Próximo Passo")');

    // Should be on step 2
    await expect(page.locator("text=Criar Conta")).toBeVisible();
    await expect(
      page.locator("text=Defina sua senha e finalize o cadastro")
    ).toBeVisible();
  });

  test("should validate password requirements in step 2", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Complete step 1
    await page.fill('input[id="barbershopName"]', "Barbearia Teste E2E");
    await page.fill('input[id="ownerName"]', "João da Silva");
    await page.fill('input[id="email"]', "joao@barbeariateste.com");
    await page.fill('input[id="phone"]', "(11) 99999-9999");
    await page.click('button:has-text("Próximo Passo")');

    // Try weak password
    await page.fill('input[id="password"]', "123");
    await page.fill('input[id="confirmPassword"]', "123");
    await page.click('input[id="acceptTerms"]');
    await page.click('button[type="submit"]');

    // Should show password validation error
    await expect(page.locator('[role="alert"]')).toContainText(
      "Senha deve ter pelo menos 6 caracteres"
    );
  });

  test("should validate password confirmation", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Complete step 1
    await page.fill('input[id="barbershopName"]', "Barbearia Teste E2E");
    await page.fill('input[id="ownerName"]', "João da Silva");
    await page.fill('input[id="email"]', "joao@barbeariateste.com");
    await page.fill('input[id="phone"]', "(11) 99999-9999");
    await page.click('button:has-text("Próximo Passo")');

    // Passwords don't match
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "different123");
    await page.click('input[id="acceptTerms"]');
    await page.click('button[type="submit"]');

    // Should show confirmation error
    await expect(page.locator('[role="alert"]')).toContainText(
      "Senhas não coincidem"
    );
  });

  test("should require terms acceptance", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Complete step 1
    await page.fill('input[id="barbershopName"]', "Barbearia Teste E2E");
    await page.fill('input[id="ownerName"]', "João da Silva");
    await page.fill('input[id="email"]', "joao@barbeariateste.com");
    await page.fill('input[id="phone"]', "(11) 99999-9999");
    await page.click('button:has-text("Próximo Passo")');

    // Valid passwords but no terms acceptance
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Should show terms error
    await expect(page.locator('[role="alert"]')).toContainText(
      "Você deve aceitar os termos de uso"
    );
  });

  test("should display plan summary correctly", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Select Premium plan
    await page.click('[data-plan="premium"]');

    // Complete step 1
    await page.fill('input[id="barbershopName"]', "Barbearia Teste E2E");
    await page.fill('input[id="ownerName"]', "João da Silva");
    await page.fill('input[id="email"]', "joao@barbeariateste.com");
    await page.fill('input[id="phone"]', "(11) 99999-9999");
    await page.click('button:has-text("Próximo Passo")');

    // Check plan summary
    await expect(page.locator("text=Plano Premium")).toBeVisible();
    await expect(page.locator("text=R$ 99,90/mês")).toBeVisible();
    await expect(page.locator("text=7 dias grátis")).toBeVisible();
  });

  test("should allow going back to step 1", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Complete step 1
    await page.fill('input[id="barbershopName"]', "Barbearia Teste E2E");
    await page.fill('input[id="ownerName"]', "João da Silva");
    await page.fill('input[id="email"]', "joao@barbeariateste.com");
    await page.fill('input[id="phone"]', "(11) 99999-9999");
    await page.click('button:has-text("Próximo Passo")');

    // Go back to step 1
    await page.click('button:has-text("Voltar")');

    // Should be back on step 1
    await expect(page.locator("text=Escolha seu Plano")).toBeVisible();
    await expect(page.locator("text=Informações da Barbearia")).toBeVisible();

    // Data should be preserved
    await expect(page.locator('input[id="barbershopName"]')).toHaveValue(
      "Barbearia Teste E2E"
    );
  });

  test("should navigate to barbershop login page", async ({ page }) => {
    await page.goto("/barbershop-login");

    // Check if we're on the login page
    await expect(page).toHaveTitle(/Elite Barber/);
    await expect(page.locator("h1")).toContainText("Painel da Barbearia");
  });

  test("should show demo credentials on login page", async ({ page }) => {
    await page.goto("/barbershop-login");

    // Check if demo credentials are displayed
    await expect(
      page.locator("text=Credenciais de Demonstração")
    ).toBeVisible();
    await expect(page.locator("text=barbershop@demo.com")).toBeVisible();
    await expect(page.locator("text=demo123")).toBeVisible();
  });

  test("should validate barbershop login form", async ({ page }) => {
    await page.goto("/barbershop-login");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should prevent submission (HTML5 validation)
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
  });

  test("should show error for invalid barbershop credentials", async ({
    page,
  }) => {
    await page.goto("/barbershop-login");

    // Fill invalid credentials
    await page.fill('input[type="email"]', "invalid@barbershop.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/barbershop-login");

    // Fill password
    await page.fill('input[type="password"]', "testpassword");

    // Password should be hidden initially
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Click show password button
    await page.click('button[aria-label="Show password"]');

    // Password should now be visible
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // Click hide password button
    await page.click('button[aria-label="Hide password"]');

    // Password should be hidden again
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should navigate to signup from login page", async ({ page }) => {
    await page.goto("/barbershop-login");

    // Click register barbershop button
    await page.click('button:has-text("Registrar Barbearia")');

    // Should navigate to signup page
    await page.waitForURL("/barbershop-signup");
    await expect(page.locator("h1")).toContainText("Registre sua Barbearia");
  });

  test("should navigate to login from signup page", async ({ page }) => {
    await page.goto("/barbershop-signup");

    // Click login link at bottom
    await page.click('a:has-text("Fazer login")');

    // Should navigate to login page
    await page.waitForURL("/barbershop-login");
    await expect(page.locator("h1")).toContainText("Painel da Barbearia");
  });
});
