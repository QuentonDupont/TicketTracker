import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should display dashboard page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 5000 })
  })

  test('should display dashboard metrics', async ({ page }) => {
    await expect(page.getByText('Total Tickets')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Open Tickets')).toBeVisible()
    await expect(page.getByText('Completion Rate')).toBeVisible()
    await expect(page.getByText('Active Projects')).toBeVisible()
  })

  test('should display charts', async ({ page }) => {
    const charts = page.locator('.recharts-wrapper')
    await expect(charts.first()).toBeVisible({ timeout: 10000 })
  })

  test('should show recent activity section', async ({ page }) => {
    await expect(page.getByText('Recent Activity', { exact: true })).toBeVisible({ timeout: 5000 })
  })
})
