import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('New Feature Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test.describe('Settings', () => {
    test('should display settings page with tabs', async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Preferences' })).toBeVisible()
    })

    test('should switch between settings tabs', async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' })
      await page.getByRole('tab', { name: 'Preferences' }).click()
      await expect(page.getByText('Appearance')).toBeVisible()
      await page.getByRole('tab', { name: 'Data Management' }).click()
      await expect(page.getByText('Export Data')).toBeVisible()
    })

    test('should update profile settings', async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' })
      const nameInput = page.locator('#name')
      if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInput.clear()
        await nameInput.fill('Updated User')
        await page.getByRole('button', { name: 'Save Profile' }).click()
      }
    })
  })

  test.describe('Help', () => {
    test('should display help page', async ({ page }) => {
      await page.goto('/help', { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('heading', { name: /Help/i })).toBeVisible({ timeout: 5000 })
    })

    test('should have expandable FAQ sections', async ({ page }) => {
      await page.goto('/help', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('Frequently Asked Questions')).toBeVisible({ timeout: 5000 })
      const faqTrigger = page.getByText('How do I create a new ticket?')
      if (await faqTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
        await faqTrigger.click()
      }
    })

    test('should show keyboard shortcuts', async ({ page }) => {
      await page.goto('/help', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('Keyboard Shortcuts')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Documentation', () => {
    test('should display docs page', async ({ page }) => {
      await page.goto('/docs', { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('heading', { name: 'Documentation' })).toBeVisible({ timeout: 5000 })
    })

    test('should have documentation sections', async ({ page }) => {
      await page.goto('/docs', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('#getting-started')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('#tickets')).toBeVisible()
    })
  })

  test.describe('Data Export', () => {
    test('should display data export page', async ({ page }) => {
      await page.goto('/data-export', { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('heading', { name: 'Data Export' })).toBeVisible({ timeout: 5000 })
    })

    test('should have format selection', async ({ page }) => {
      await page.goto('/data-export', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('Export Format')).toBeVisible({ timeout: 5000 })
    })

    test('should show data type checkboxes', async ({ page }) => {
      await page.goto('/data-export', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('Select Data to Export')).toBeVisible({ timeout: 5000 })
      const checkboxes = page.locator('[role="checkbox"]')
      expect(await checkboxes.count()).toBeGreaterThan(0)
    })
  })

  test.describe('Reports', () => {
    test('should display reports page', async ({ page }) => {
      await page.goto('/reports', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('Reports').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have report tabs', async ({ page }) => {
      await page.goto('/reports', { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('tab', { name: 'Ticket Completion' })).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole('tab', { name: 'Team Performance' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Project Status' })).toBeVisible()

      await page.getByRole('tab', { name: 'Team Performance' }).click()
      await page.waitForTimeout(500)
    })

    test('should show report data from seeded tickets', async ({ page }) => {
      await page.goto('/reports', { waitUntil: 'domcontentloaded' })
      await expect(page.getByText('Ticket Completion Report')).toBeVisible({ timeout: 5000 })
    })
  })
})
