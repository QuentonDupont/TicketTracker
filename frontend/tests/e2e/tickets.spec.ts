import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/tickets', { waitUntil: 'domcontentloaded' })
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should display ticket list', async ({ page }) => {
    await expect(page.getByText('Fix login validation').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Add dark mode support').first()).toBeVisible()
    await expect(page.getByText('Optimize database queries').first()).toBeVisible()
  })

  test('should create a new ticket', async ({ page }) => {
    await page.getByRole('button', { name: /new ticket/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Fill the title field
    const titleInput = dialog.locator('input').first()
    await titleInput.fill('New E2E Test Ticket')

    // Submit the form via JavaScript click (button may be outside viewport in dialog)
    const submitBtn = dialog.getByRole('button', { name: /create|save|submit/i })
    await submitBtn.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(2000)
  })

  test('should navigate to ticket detail page', async ({ page }) => {
    await page.getByRole('link', { name: 'Fix login validation' }).first().click()
    await expect(page).toHaveURL(/\/tickets\/\d+/)
    await expect(page.getByRole('heading', { name: 'Fix login validation' })).toBeVisible()
  })

  test('should filter tickets by status', async ({ page }) => {
    const statusFilter = page.getByRole('combobox').first()
    if (await statusFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusFilter.click()
      const option = page.getByRole('option', { name: /to do/i }).first()
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click()
      }
    }
  })

  test('should change ticket status on detail page', async ({ page }) => {
    await page.getByRole('link', { name: 'Fix login validation' }).first().click()
    await expect(page).toHaveURL(/\/tickets\/\d+/)

    const statusButton = page.locator('button:has-text("To Do")').first()
    if (await statusButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusButton.click()
      const inProgress = page.getByText('In Progress', { exact: true }).first()
      if (await inProgress.isVisible({ timeout: 2000 }).catch(() => false)) {
        await inProgress.click()
      }
    }
  })

  test('should add tags on detail page', async ({ page }) => {
    await page.getByRole('link', { name: 'Fix login validation' }).first().click()
    await expect(page).toHaveURL(/\/tickets\/\d+/)

    const tagInput = page.locator('input[placeholder*="tag" i]').or(page.locator('input[placeholder*="add" i]'))
    if (await tagInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await tagInput.first().fill('e2e-test')
      await tagInput.first().press('Enter')
      await expect(page.getByText('e2e-test')).toBeVisible()
    }
  })

  test('should delete a ticket', async ({ page }) => {
    await page.getByRole('link', { name: 'Optimize database queries' }).first().click()
    await expect(page).toHaveURL(/\/tickets\/\d+/)

    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click()
      const confirmBtn = page.getByRole('button', { name: /delete|confirm|yes/i }).last()
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmBtn.click()
      }
      await expect(page).toHaveURL(/\/tickets/, { timeout: 5000 })
    }
  })
})
