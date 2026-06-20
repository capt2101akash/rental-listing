import { test, expect } from '@playwright/test';

test.describe('Dashboard & Admin', () => {
  test('should redirect unauthenticated users away from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // NextAuth should redirect to login when not authenticated
    await page.waitForURL(/\/(auth\/login|api\/auth)/, { timeout: 10000 });
  });

  test('should redirect unauthenticated users away from dashboard/properties', async ({ page }) => {
    await page.goto('/dashboard/properties');

    await page.waitForURL(/\/(auth\/login|api\/auth)/, { timeout: 10000 });
  });

  test('should load the home page with call-to-action buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Find Your Perfect');
    await expect(page.locator('text=Browse Properties')).toBeVisible();
    await expect(page.locator('text=Property Owner Login')).toBeVisible();
  });

  test('should navigate from home to properties page', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Browse Properties').click();
    await expect(page).toHaveURL(/\/properties/);
  });

  test('should navigate from home to login page', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Property Owner Login').click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should have a working navbar with Properties and Login links', async ({ page }) => {
    await page.goto('/');

    // Navbar should be present
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Properties link in navbar
    const propertiesLink = navbar.locator('a[href="/properties"]');
    await expect(propertiesLink).toBeVisible();
    await propertiesLink.click();
    await expect(page).toHaveURL(/\/properties/);
  });

  test('should render footer on every page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=© 2026 CSUNHousing')).toBeVisible();

    await page.goto('/properties');
    await expect(page.locator('text=© 2026 CSUNHousing')).toBeVisible();

    await page.goto('/auth/login');
    await expect(page.locator('text=© 2026 CSUNHousing')).toBeVisible();
  });
});
