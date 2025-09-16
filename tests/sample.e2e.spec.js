// Sample Playwright E2E test
const { test, expect } = require('@playwright/test');

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page.locator('h1')).toContainText('CEO Self-Review');
});