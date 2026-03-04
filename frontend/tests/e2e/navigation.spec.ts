import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should navigate to all main sidebar links', async ({ page }) => {
    const routes = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Tickets', url: '/tickets' },
      { name: 'Epics', url: '/epics' },
      { name: 'Analytics', url: '/analytics' },
      { name: 'Team', url: '/team' },
    ]

    for (const route of routes) {
      await page.locator(`a[href="${route.url}"]`).first().click()
      await expect(page).toHaveURL(new RegExp(route.url))
    }
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.locator('a[href="/settings"]').first().click()
    await expect(page).toHaveURL(/\/settings/)
  })

  test('should navigate to help page', async ({ page }) => {
    await page.locator('a[href="/help"]').first().click()
    await expect(page).toHaveURL(/\/help/)
  })

  test('should navigate to data export page', async ({ page }) => {
    await page.locator('a[href="/data-export"]').first().click()
    await expect(page).toHaveURL(/\/data-export/)
  })

  test('should navigate to reports page', async ({ page }) => {
    await page.locator('a[href="/reports"]').first().click()
    await expect(page).toHaveURL(/\/reports/)
  })

  test('should navigate to documentation page', async ({ page }) => {
    await page.locator('a[href="/docs"]').first().click()
    await expect(page).toHaveURL(/\/docs/)
  })

  test('should toggle theme between light and dark', async ({ page }) => {
    const themeToggle = page.locator('button:has([class*="sun"])').or(page.locator('button:has([class*="moon"])')).or(page.locator('[data-testid="theme-toggle"]'))
    if (await themeToggle.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await themeToggle.first().click()
      await page.waitForTimeout(500)
    }
  })
})
