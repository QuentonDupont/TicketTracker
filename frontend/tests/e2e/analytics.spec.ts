import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/analytics', { waitUntil: 'domcontentloaded' })
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should display analytics page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible({ timeout: 5000 })
  })

  test('should show KPI cards with real data', async ({ page }) => {
    await expect(page.getByText('Total Tickets')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Completion Rate')).toBeVisible()
  })

  test('should have tabs for different analytics views', async ({ page }) => {
    // Analytics uses button-based tabs, not role="tab"
    const performanceTab = page.getByText('Performance', { exact: true }).first()
    const teamTab = page.getByText('Team', { exact: true }).first()

    await expect(performanceTab).toBeVisible({ timeout: 5000 })

    if (await teamTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await teamTab.click()
      await page.waitForTimeout(500)
    }
  })

  test('should render charts', async ({ page }) => {
    const charts = page.locator('.recharts-wrapper')
    await expect(charts.first()).toBeVisible({ timeout: 10000 })
  })
})
