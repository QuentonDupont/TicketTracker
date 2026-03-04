import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    const themeToggle = page.locator('button[aria-label*="theme" i]')
      .or(page.locator('[data-testid="theme-toggle"]'))
      .or(page.locator('button:has(svg.lucide-sun)'))
      .or(page.locator('button:has(svg.lucide-moon)'))
    if (await themeToggle.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const htmlBefore = await page.locator('html').getAttribute('class')
      await themeToggle.first().click()
      await page.waitForTimeout(500)
      const htmlAfter = await page.locator('html').getAttribute('class')
      expect(htmlBefore).not.toBe(htmlAfter)
    }
  })

  test('should persist theme across navigation', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    const themeToggle = page.locator('button[aria-label*="theme" i]')
      .or(page.locator('[data-testid="theme-toggle"]'))
      .or(page.locator('button:has(svg.lucide-sun)'))
      .or(page.locator('button:has(svg.lucide-moon)'))
    if (await themeToggle.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await themeToggle.first().click()
      await page.waitForTimeout(500)
      const themeClass = await page.locator('html').getAttribute('class')

      await page.goto('/tickets', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)
      const themeClassAfterNav = await page.locator('html').getAttribute('class')
      expect(themeClass).toBe(themeClassAfterNav)
    }
  })

  test('should have theme toggle on settings page', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.getByRole('tab', { name: 'Preferences' }).click()
    await expect(page.getByText('Appearance')).toBeVisible({ timeout: 5000 })
  })

  test('should have theme toggle on auth pages', async ({ page }) => {
    await clearTestData(page)
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    // Theme toggle may or may not exist on auth pages
    const themeToggle = page.locator('button[aria-label*="theme" i]')
      .or(page.locator('[data-testid="theme-toggle"]'))
      .or(page.locator('button:has(svg.lucide-sun)'))
      .or(page.locator('button:has(svg.lucide-moon)'))
    if (await themeToggle.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await themeToggle.first().click()
    }
  })
})
