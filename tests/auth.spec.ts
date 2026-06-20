import { test, expect } from '@playwright/test';

const TEST_TIMESTAMP = Date.now();
const TEST_EMAIL = `testuser_${TEST_TIMESTAMP}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_PHONE = '(555) 999-0001';
const TEST_ADDRESS = '123 Test Ave, Northridge, CA 91325';

test.describe('Authentication Flow', () => {
  test('should load the signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('h1')).toContainText('Owner Signup');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should submit a signup request successfully', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill out the signup form
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="tel"]').fill(TEST_PHONE);
    // The address field uses AddressAutocomplete; fill it directly by targeting the input
    await page.locator('input[name="address"]').fill(TEST_ADDRESS);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);

    // Submit the form
    await page.locator('button[type="submit"]').click();

    // Expect the success message to appear
    await expect(page.locator('text=Request Submitted!')).toBeVisible({ timeout: 10000 });
  });

  test('should prevent duplicate signup requests', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="tel"]').fill(TEST_PHONE);
    await page.locator('input[name="address"]').fill(TEST_ADDRESS);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Should show an error about existing pending request
    await expect(page.locator('text=already pending')).toBeVisible({ timeout: 10000 });
  });

  test('should load the login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show an error on invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('input[type="email"]').fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('WrongPassword');
    await page.locator('button[type="submit"]').click();

    // Expect the error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('a[href="/auth/signup"]').click();
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('h1')).toContainText('Owner Signup');

    await page.getByRole('link', { name: 'Login here' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('h1')).toContainText('Login');
  });
});
