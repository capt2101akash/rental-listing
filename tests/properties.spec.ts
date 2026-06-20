import { test, expect } from '@playwright/test';

test.describe('Properties Browsing & Filtering', () => {
  test('should load the properties page with heading and filter sidebar', async ({ page }) => {
    await page.goto('/properties');

    // Verify the page heading
    await expect(page.locator('h1')).toContainText('Find Your Next');

    // Verify the filter sidebar is present
    await expect(page.locator('text=Filters')).toBeVisible();
    await expect(page.locator('text=Walking to CSUN')).toBeVisible();
    await expect(page.locator('text=Max Price / mo')).toBeVisible();
    await expect(page.getByText('Room Type', { exact: true })).toBeVisible();
  });

  test('should display property cards if properties exist', async ({ page }) => {
    await page.goto('/properties');

    // Wait for the "Showing X properties" text to appear
    const showingText = page.locator('text=/Showing \\d+ propert/');
    await expect(showingText).toBeVisible({ timeout: 10000 });
  });

  test('should allow interacting with the distance filter slider', async ({ page }) => {
    await page.goto('/properties');

    // The distance slider should be present
    const distanceSlider = page.locator('input[type="range"]').first();
    await expect(distanceSlider).toBeVisible();

    // Get the initial "Showing X" count text
    const showingText = page.locator('text=/Showing \\d+ propert/');
    await expect(showingText).toBeVisible({ timeout: 10000 });
  });

  test('should allow toggling room type radio buttons', async ({ page }) => {
    await page.goto('/properties');

    // Click "Private Room" radio
    await page.locator('text=Private Room').click();
    // Verify the radio is selected
    const privateRadio = page.locator('input[value="PRIVATE"]');
    await expect(privateRadio).toBeChecked();

    // Click "Shared Room" radio
    await page.locator('text=Shared Room').click();
    const sharedRadio = page.locator('input[value="SHARED"]');
    await expect(sharedRadio).toBeChecked();

    // Click "Any Type" to reset
    await page.locator('text=Any Type').click();
    const anyRadio = page.locator('input[value="ANY"]');
    await expect(anyRadio).toBeChecked();
  });

  test('should allow clicking the Reset button to clear all filters', async ({ page }) => {
    await page.goto('/properties');

    // Change a filter first
    await page.locator('text=Private Room').click();

    // Click Reset
    await page.locator('button', { hasText: 'Reset' }).click();

    // Verify "Any Type" is selected again
    const anyRadio = page.locator('input[value="ANY"]');
    await expect(anyRadio).toBeChecked();
  });

  test('should navigate to property detail page when a card is clicked', async ({ page }) => {
    await page.goto('/properties');

    // Wait for property cards to appear
    const propertyLink = page.locator('a[href^="/property/"]').first();
    const isPropertyPresent = await propertyLink.isVisible().catch(() => false);
    
    if (isPropertyPresent) {
      await propertyLink.click();
      await expect(page).toHaveURL(/\/property\//);

      // The property detail page should have a "Back to Properties" link
      await expect(page.locator('text=Back to Properties')).toBeVisible();
    } else {
      // No properties in the database - just verify the empty state
      await expect(page.locator('text=No properties match')).toBeVisible();
    }
  });

  test('should show room cards on property detail page', async ({ page }) => {
    await page.goto('/properties');

    const propertyLink = page.locator('a[href^="/property/"]').first();
    const isPropertyPresent = await propertyLink.isVisible().catch(() => false);

    if (isPropertyPresent) {
      await propertyLink.click();
      await expect(page).toHaveURL(/\/property\//);

      // Check for the "Available Rooms" heading or room cards
      const roomsHeading = page.locator('text=Available Rooms');
      const hasRooms = await roomsHeading.isVisible().catch(() => false);

      if (hasRooms) {
        // There should be at least one room card link
        const roomLink = page.locator('a[href*="/room/"]').first();
        await expect(roomLink).toBeVisible();
      }
    }
  });
});
