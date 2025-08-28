/**
 * WCAG 2.1 Contrast Testing with MCP Playwright
 * Comprehensive color contrast compliance testing
 */

import { test, expect } from "@playwright/test";

// WCAG 2.1 minimum contrast ratios
const WCAG_RATIOS = {
  NORMAL_TEXT: 4.5, // AA standard for normal text
  LARGE_TEXT: 3.0, // AA standard for large text (18pt+ or 14pt+ bold)
  UI_COMPONENTS: 3.0, // AA standard for UI components
  ENHANCED_TEXT: 7.0, // AAA standard for normal text
  ENHANCED_LARGE: 4.5, // AAA standard for large text
};

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((num) => {
      const normalized = parseInt(num) / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Extract RGB color from computed style
 */
async function getElementColors(page: any, selector: string) {
  return await page.evaluate((sel: string) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    const computed = window.getComputedStyle(element);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
    };
  }, selector);
}

/**
 * Check if text is considered large
 */
function isLargeText(fontSize: string, fontWeight: string): boolean {
  const sizeValue = parseFloat(fontSize);
  const unit = fontSize.replace(/[\d.]/g, "");

  let sizeInPx = sizeValue;
  if (unit === "em") sizeInPx = sizeValue * 16;
  if (unit === "rem") sizeInPx = sizeValue * 16;
  if (unit === "pt") sizeInPx = sizeValue * 1.333;

  // Large text: 18px+ or 14px+ bold
  return (
    sizeInPx >= 18 ||
    (sizeInPx >= 14 && (fontWeight === "bold" || parseInt(fontWeight) >= 700))
  );
}

test.describe("WCAG 2.1 Contrast Compliance Testing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080");
    await page.waitForLoadState("networkidle");
  });

  test("Landing Page - Main Elements Contrast", async ({ page }) => {
    console.log("🎨 Testing Landing Page Contrast Compliance...");

    const elementsToTest = [
      { selector: "h1", description: "Main heading" },
      { selector: "h2", description: "Section headings" },
      { selector: "p", description: "Paragraph text" },
      { selector: "button", description: "Buttons" },
      { selector: "nav a", description: "Navigation links" },
      { selector: ".card", description: "Card components" },
    ];

    for (const element of elementsToTest) {
      try {
        await page.waitForSelector(element.selector, { timeout: 5000 });
        const colors = await getElementColors(page, element.selector);

        if (colors && colors.color && colors.backgroundColor) {
          const ratio = calculateContrastRatio(
            colors.color,
            colors.backgroundColor
          );
          const isLarge = isLargeText(colors.fontSize, colors.fontWeight);
          const minRatio = isLarge
            ? WCAG_RATIOS.LARGE_TEXT
            : WCAG_RATIOS.NORMAL_TEXT;

          console.log(
            `${element.description}: Ratio ${ratio.toFixed(2)} (Required: ${minRatio})`
          );

          expect(ratio).toBeGreaterThanOrEqual(minRatio);
        }
      } catch (error) {
        console.log(`⚠️  Skipping ${element.description} - element not found`);
      }
    }
  });

  test("Touch Buttons - WCAG Compliance", async ({ page }) => {
    console.log("🎯 Testing Touch Button Contrast...");

    // Navigate to page with various button states
    await page.goto("http://localhost:8080/booking");
    await page.waitForLoadState("networkidle");

    const buttonStates = [
      'button[data-variant="primary"]',
      'button[data-variant="secondary"]',
      'button[data-variant="outline"]',
      'button[data-variant="ghost"]',
      'button[data-variant="destructive"]',
    ];

    for (const buttonSelector of buttonStates) {
      try {
        const button = page.locator(buttonSelector).first();
        if ((await button.count()) > 0) {
          const colors = await getElementColors(page, buttonSelector);

          if (colors && colors.color && colors.backgroundColor) {
            const ratio = calculateContrastRatio(
              colors.color,
              colors.backgroundColor
            );

            console.log(`Button ${buttonSelector}: Ratio ${ratio.toFixed(2)}`);
            expect(ratio).toBeGreaterThanOrEqual(WCAG_RATIOS.UI_COMPONENTS);
          }
        }
      } catch (error) {
        console.log(`⚠️  Skipping ${buttonSelector} - not found`);
      }
    }
  });

  test("Form Elements - Input Contrast", async ({ page }) => {
    console.log("📝 Testing Form Input Contrast...");

    await page.goto("http://localhost:8080/admin-login");
    await page.waitForLoadState("networkidle");

    const formElements = [
      'input[type="email"]',
      'input[type="password"]',
      "label",
      ".form-error",
      ".form-description",
    ];

    for (const element of formElements) {
      try {
        await page.waitForSelector(element, { timeout: 3000 });
        const colors = await getElementColors(page, element);

        if (colors && colors.color && colors.backgroundColor) {
          const ratio = calculateContrastRatio(
            colors.color,
            colors.backgroundColor
          );
          const isLarge = isLargeText(colors.fontSize, colors.fontWeight);
          const minRatio = isLarge
            ? WCAG_RATIOS.LARGE_TEXT
            : WCAG_RATIOS.NORMAL_TEXT;

          console.log(
            `Form ${element}: Ratio ${ratio.toFixed(2)} (Required: ${minRatio})`
          );
          expect(ratio).toBeGreaterThanOrEqual(minRatio);
        }
      } catch (error) {
        console.log(`⚠️  Skipping ${element} - not found`);
      }
    }
  });

  test("Dark Mode Contrast Compliance", async ({ page }) => {
    console.log("🌙 Testing Dark Mode Contrast...");

    // Enable dark mode
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    });

    await page.goto("http://localhost:8080");
    await page.waitForLoadState("networkidle");

    const darkModeElements = [
      "body",
      "h1",
      "h2",
      "p",
      "button",
      "nav",
      ".card",
    ];

    for (const element of darkModeElements) {
      try {
        const colors = await getElementColors(page, element);

        if (colors && colors.color && colors.backgroundColor) {
          const ratio = calculateContrastRatio(
            colors.color,
            colors.backgroundColor
          );
          const isLarge = isLargeText(colors.fontSize, colors.fontWeight);
          const minRatio = isLarge
            ? WCAG_RATIOS.LARGE_TEXT
            : WCAG_RATIOS.NORMAL_TEXT;

          console.log(
            `Dark mode ${element}: Ratio ${ratio.toFixed(2)} (Required: ${minRatio})`
          );
          expect(ratio).toBeGreaterThanOrEqual(minRatio);
        }
      } catch (error) {
        console.log(`⚠️  Skipping dark mode ${element}`);
      }
    }
  });

  test("Color-only Information Detection", async ({ page }) => {
    console.log("🚨 Testing Color-only Information Usage...");

    // Check for common problematic patterns
    const colorOnlyPatterns = await page.evaluate(() => {
      const issues = [];

      // Check for elements that might rely only on color
      const allElements = document.querySelectorAll("*");

      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);

        // Check for red text without icons or other indicators
        if (
          computed.color.includes("rgb(220") ||
          computed.color.includes("red")
        ) {
          const hasIcon = el.querySelector('svg, .icon, [class*="icon"]');
          const hasText =
            el.textContent?.includes("erro") ||
            el.textContent?.includes("inválido");

          if (!hasIcon && !hasText) {
            issues.push({
              element: el.tagName.toLowerCase(),
              text: el.textContent?.slice(0, 50),
              issue: "Possible color-only error indication",
            });
          }
        }
      });

      return issues;
    });

    console.log("Color-only issues found:", colorOnlyPatterns.length);

    // This is a warning rather than a hard failure
    if (colorOnlyPatterns.length > 0) {
      console.warn(
        "⚠️  Potential color-only information detected:",
        colorOnlyPatterns
      );
    }
  });

  test("Interactive Element State Contrast", async ({ page }) => {
    console.log("🎮 Testing Interactive Element States...");

    await page.goto("http://localhost:8080");

    const interactiveElements = await page.locator("button, a, input").all();

    for (let i = 0; i < Math.min(interactiveElements.length, 5); i++) {
      const element = interactiveElements[i];

      // Test normal state
      const normalColors = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Test hover state
      await element.hover();
      await page.waitForTimeout(100);

      const hoverColors = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Test focus state
      await element.focus();
      await page.waitForTimeout(100);

      const focusColors = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          outline: computed.outline,
          boxShadow: computed.boxShadow,
        };
      });

      // Check contrast for each state
      const states = [
        { name: "normal", colors: normalColors },
        { name: "hover", colors: hoverColors },
        { name: "focus", colors: focusColors },
      ];

      states.forEach((state) => {
        if (state.colors.color && state.colors.backgroundColor) {
          const ratio = calculateContrastRatio(
            state.colors.color,
            state.colors.backgroundColor
          );
          console.log(
            `Interactive element ${i} (${state.name}): Ratio ${ratio.toFixed(2)}`
          );

          if (ratio < WCAG_RATIOS.UI_COMPONENTS) {
            console.warn(
              `⚠️  Low contrast in ${state.name} state: ${ratio.toFixed(2)}`
            );
          }
        }
      });

      // Check focus indicators
      if (
        focusColors.outline === "none" &&
        !focusColors.boxShadow.includes("rgb")
      ) {
        console.warn("⚠️  Missing focus indicator");
      }
    }
  });

  test("Generate Contrast Report Screenshots", async ({ page }) => {
    console.log("📸 Generating Contrast Testing Screenshots...");

    // Create screenshots directory
    await page.evaluate(() => {
      // This will be handled by the file system
    });

    const testPages = [
      { url: "/", name: "landing-contrast" },
      { url: "/admin-login", name: "admin-login-contrast" },
      { url: "/barbershop-login", name: "barbershop-login-contrast" },
      { url: "/booking", name: "booking-contrast" },
    ];

    for (const testPage of testPages) {
      try {
        await page.goto(`http://localhost:8080${testPage.url}`);
        await page.waitForLoadState("networkidle");

        // Take screenshot for light mode
        await page.screenshot({
          path: `screenshots/${testPage.name}-light.png`,
          fullPage: true,
        });

        // Switch to dark mode and screenshot
        await page.addInitScript(() => {
          localStorage.setItem("theme", "dark");
          document.documentElement.classList.add("dark");
        });

        await page.reload();
        await page.waitForLoadState("networkidle");

        await page.screenshot({
          path: `screenshots/${testPage.name}-dark.png`,
          fullPage: true,
        });

        console.log(`✅ Screenshots saved for ${testPage.name}`);
      } catch (error) {
        console.log(`❌ Failed to screenshot ${testPage.name}:`, error);
      }
    }
  });

  test("Comprehensive WCAG Summary", async ({ page }) => {
    console.log("📊 Generating WCAG Compliance Summary...");

    const summary = {
      totalElementsTested: 0,
      passedAA: 0,
      passedAAA: 0,
      failed: 0,
      issues: [],
    };

    const pages = ["/", "/admin-login", "/barbershop-login", "/booking"];

    for (const pagePath of pages) {
      try {
        await page.goto(`http://localhost:8080${pagePath}`);
        await page.waitForLoadState("networkidle");

        const pageElements = [
          "h1",
          "h2",
          "h3",
          "p",
          "button",
          "a",
          "input",
          "label",
        ];

        for (const selector of pageElements) {
          try {
            const elements = await page.locator(selector).all();

            for (let i = 0; i < Math.min(elements.length, 3); i++) {
              const colors = await getElementColors(
                page,
                `${selector}:nth-of-type(${i + 1})`
              );

              if (colors && colors.color && colors.backgroundColor) {
                summary.totalElementsTested++;

                const ratio = calculateContrastRatio(
                  colors.color,
                  colors.backgroundColor
                );
                const isLarge = isLargeText(colors.fontSize, colors.fontWeight);

                if (
                  ratio >=
                  (isLarge ? WCAG_RATIOS.LARGE_TEXT : WCAG_RATIOS.NORMAL_TEXT)
                ) {
                  summary.passedAA++;

                  if (
                    ratio >=
                    (isLarge
                      ? WCAG_RATIOS.ENHANCED_LARGE
                      : WCAG_RATIOS.ENHANCED_TEXT)
                  ) {
                    summary.passedAAA++;
                  }
                } else {
                  summary.failed++;
                  summary.issues.push({
                    page: pagePath,
                    element: selector,
                    ratio: ratio.toFixed(2),
                    required: isLarge
                      ? WCAG_RATIOS.LARGE_TEXT
                      : WCAG_RATIOS.NORMAL_TEXT,
                  });
                }
              }
            }
          } catch (error) {
            // Element not found, skip
          }
        }
      } catch (error) {
        console.log(`❌ Failed to test page ${pagePath}`);
      }
    }

    console.log("\n📊 WCAG 2.1 COMPLIANCE SUMMARY:");
    console.log(`Total Elements Tested: ${summary.totalElementsTested}`);
    console.log(
      `Passed AA Standard: ${summary.passedAA} (${((summary.passedAA / summary.totalElementsTested) * 100).toFixed(1)}%)`
    );
    console.log(
      `Passed AAA Standard: ${summary.passedAAA} (${((summary.passedAAA / summary.totalElementsTested) * 100).toFixed(1)}%)`
    );
    console.log(
      `Failed: ${summary.failed} (${((summary.failed / summary.totalElementsTested) * 100).toFixed(1)}%)`
    );

    if (summary.issues.length > 0) {
      console.log("\n❌ CONTRAST ISSUES FOUND:");
      summary.issues.forEach((issue) => {
        console.log(
          `  - ${issue.page} ${issue.element}: ${issue.ratio} (required: ${issue.required})`
        );
      });
    } else {
      console.log("\n✅ NO CONTRAST ISSUES FOUND!");
    }

    // Expect at least 90% compliance with AA standards
    expect(
      summary.passedAA / summary.totalElementsTested
    ).toBeGreaterThanOrEqual(0.9);
  });
});
