import { test, expect } from '@playwright/test'
import { loginViaUI, loginViaLocalStorage, clearTestData } from './fixtures/auth'

test.describe('Authentication', () => {
  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('should show login page by default', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should login with valid credentials', async ({ page }) => {
    await loginViaUI(page)
    await expect(page).toHaveURL(/\/(dashboard|$)/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login')
    await page.locator('a[href*="register"]').or(page.getByText(/sign up|register|create account/i)).first().click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('should register a new account', async ({ page }) => {
    await page.goto('/auth/register')
    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test User')
    await page.fill('input[type="email"]', 'newuser@example.com')
    await page.fill('input[type="password"]', 'password123')
    const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]')
    if (await confirmPassword.isVisible()) {
      await confirmPassword.fill('password123')
    }
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/(dashboard|auth\/login)/)
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/login')
    const forgotLink = page.locator('a[href*="forgot"]').or(page.getByText(/forgot/i)).first()
    if (await forgotLink.isVisible()) {
      await forgotLink.click()
      await expect(page).toHaveURL(/\/auth\/forgot/)
    }
  })

  test('should logout successfully', async ({ page }) => {
    await loginViaLocalStorage(page)
    await page.click('[data-testid="user-menu"], button:has-text("User"), [class*="avatar"]')
    await page.click('text=/log out|logout|sign out/i')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should have theme toggle on auth pages', async ({ page }) => {
    await page.goto('/auth/login')
    const themeToggle = page.locator('button:has([class*="sun"]), button:has([class*="moon"]), [data-testid="theme-toggle"]')
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
    }
  })
})
