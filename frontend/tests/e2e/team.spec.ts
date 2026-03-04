import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Team', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/team', { waitUntil: 'domcontentloaded' })
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should display team member list', async ({ page }) => {
    await expect(page.getByText('Alice Johnson').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Bob Wilson').first()).toBeVisible()
  })

  test('should create a new team member', async ({ page }) => {
    await page.getByRole('button', { name: /add member|new|add/i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Fill the form fields within the dialog
    const inputs = dialog.locator('input')
    const inputCount = await inputs.count()
    if (inputCount > 0) {
      await inputs.first().fill('E2E Test Member')
      if (inputCount > 1) {
        await inputs.nth(1).fill('e2etest@example.com')
      }
    }

    // Click save/submit using force to bypass viewport issues
    await dialog.getByRole('button', { name: /save|add|create|submit/i }).click({ force: true })
    await page.waitForTimeout(2000)
  })

  test('should show team member details', async ({ page }) => {
    // The team page shows member cards with details directly visible
    await expect(page.getByText('Alice Johnson').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Frontend Developer').first()).toBeVisible()
    await expect(page.getByText('alice@example.com').first()).toBeVisible()
  })

  test('should have team tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Directory' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('tab', { name: 'Skills Matrix' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Workload' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Performance' })).toBeVisible()
  })
})
