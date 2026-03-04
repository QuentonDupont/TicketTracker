import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, seedTestData, clearTestData } from './fixtures/auth'

test.describe('Global Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page)
    await seedTestData(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  const SEARCH_PLACEHOLDER = 'Search tickets, epics, projects, team...'

  async function openSearchModal(page: import('@playwright/test').Page) {
    await page.click('text="Search"')
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  }

  test('should open search modal', async ({ page }) => {
    await openSearchModal(page)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should open search modal from sidebar click', async ({ page }) => {
    await page.click('text="Search"')
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  })

  test('should search and find tickets', async ({ page }) => {
    await openSearchModal(page)
    await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill('login')
    await page.waitForTimeout(500)
    await expect(page.getByText('Fix login validation').first()).toBeVisible()
  })

  test('should search and find team members', async ({ page }) => {
    await openSearchModal(page)
    await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill('Alice')
    await page.waitForTimeout(500)
    await expect(page.getByText('Alice Johnson').first()).toBeVisible()
  })

  test('should navigate to result on click', async ({ page }) => {
    await openSearchModal(page)
    await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill('dark mode')
    await page.waitForTimeout(500)
    await page.getByRole('dialog').locator('button').filter({ hasText: 'Add dark mode support' }).click()
    await expect(page).toHaveURL(/\/tickets\/\d+/)
  })

  test('should close search modal with Escape', async ({ page }) => {
    await openSearchModal(page)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })
})
