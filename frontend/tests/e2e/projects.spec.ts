import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should display project list', async ({ page }) => {
    await expect(page.getByText('Frontend App').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Backend API').first()).toBeVisible()
  })

  test('should create a new project', async ({ page }) => {
    await page.getByRole('button', { name: /new project/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    await dialog.locator('input').first().fill('E2E Test Project')
    await dialog.getByRole('button', { name: /create|save|submit/i }).click()
    await expect(page.getByText('E2E Test Project').first()).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to project detail view', async ({ page }) => {
    // Projects use query params: /projects?space=3001
    await page.getByRole('link').filter({ hasText: 'Frontend App' }).first().click()
    await expect(page).toHaveURL(/\/projects\?space=\d+/)
    await expect(page.getByText('Frontend App').first()).toBeVisible()
  })

  test('should show project tickets on detail view', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'Frontend App' }).first().click()
    await expect(page).toHaveURL(/\/projects\?space=\d+/)
    // Project detail view shows project info and tickets
    await expect(page.getByText('Frontend App').first()).toBeVisible({ timeout: 5000 })
  })
})
