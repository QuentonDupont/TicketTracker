import { test, expect } from '@playwright/test'
import { loginViaLocalStorage, clearTestData } from './fixtures/auth'

test.describe('Documents', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page)
    await loginViaLocalStorage(page)
  })

  test('should navigate to documents list page', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    // Use main content area heading to avoid sidebar duplicates
    await expect(page.locator('main').getByRole('heading', { name: 'Documents' }).first()).toBeVisible()
    await expect(page.getByText('No documents yet')).toBeVisible()
  })

  test('should create a new document from list page', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    // Should see the editor page with title input
    await expect(page.locator('input[placeholder="Untitled"]')).toBeVisible({ timeout: 10000 })
  })

  test('should edit document title', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const titleInput = page.locator('input[placeholder="Untitled"]')
    await titleInput.waitFor({ state: 'visible', timeout: 10000 })
    await titleInput.fill('My Test Document')
    await expect(titleInput).toHaveValue('My Test Document')
  })

  test('should show the block editor', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    await expect(page.locator('.ProseMirror')).toBeVisible({ timeout: 15000 })
  })

  test('should type content in the editor', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const editor = page.locator('.ProseMirror')
    await editor.waitFor({ state: 'visible', timeout: 15000 })
    await editor.click()
    await page.keyboard.type('Hello World')
    await expect(editor).toContainText('Hello World')
  })

  test('should open slash command menu on /', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const editor = page.locator('.ProseMirror')
    await editor.waitFor({ state: 'visible', timeout: 15000 })
    await editor.click()
    await page.keyboard.type('/')
    await expect(page.locator('.slash-command-menu')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.slash-command-item').first()).toBeVisible()
  })

  test('should insert heading via slash command', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const editor = page.locator('.ProseMirror')
    await editor.waitFor({ state: 'visible', timeout: 15000 })
    await editor.click()
    await page.keyboard.type('/')
    await page.locator('.slash-command-menu').waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('.slash-command-item').filter({ hasText: 'Heading 1' }).click()
    await page.waitForTimeout(200)
    await page.keyboard.type('Test Heading')
    await expect(editor.locator('h1')).toContainText('Test Heading')
  })

  test('should apply bold formatting with Cmd+B', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const editor = page.locator('.ProseMirror')
    await editor.waitFor({ state: 'visible', timeout: 15000 })
    await editor.click()
    await page.keyboard.type('Hello ')
    await page.keyboard.press('Meta+b')
    await page.keyboard.type('Bold')
    await page.keyboard.press('Meta+b')
    await expect(editor.locator('strong')).toContainText('Bold')
  })

  test('should create sub-page from document editor', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const parentUrl = page.url()
    const parentId = parentUrl.split('/').pop()
    await page.getByRole('button', { name: 'Add a sub-page' }).click()
    // Wait for URL to change to a different document
    await page.waitForFunction(
      (currentUrl) => window.location.href !== currentUrl,
      parentUrl,
      { timeout: 15000 }
    )
    // URL should be a different document
    const newId = page.url().split('/').pop()
    expect(newId).not.toBe(parentId)
    // Should see breadcrumbs navigation
    await expect(page.locator('nav').getByText('Documents').first()).toBeVisible()
  })

  test('should show breadcrumbs for nested document', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const titleInput = page.locator('input[placeholder="Untitled"]')
    await titleInput.waitFor({ state: 'visible', timeout: 10000 })
    await titleInput.fill('Parent Doc')
    await page.waitForTimeout(600)
    await page.getByRole('button', { name: 'Add a sub-page' }).click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    // Breadcrumbs should contain parent title
    await expect(page.locator('nav').getByText('Parent Doc').first()).toBeVisible({ timeout: 5000 })
  })

  test('should show document in list after creation', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Untitled').first()).toBeVisible({ timeout: 5000 })
  })

  test('should show documents section in sidebar', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('All Documents').first()).toBeVisible({ timeout: 5000 })
  })

  test('should show Documents section label in sidebar', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    // The sidebar should have a "Documents" group label
    const sidebar = page.locator('[data-slot="sidebar"]').first()
    await expect(sidebar.getByText('Documents').first()).toBeVisible({ timeout: 5000 })
  })

  test('should persist content after page refresh', async ({ page }) => {
    await page.goto('/documents', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('button', { name: 'New Document' }).first().click()
    await page.waitForURL(/\/documents\/\d+/, { timeout: 15000 })
    const url = page.url()
    const editor = page.locator('.ProseMirror')
    await editor.waitFor({ state: 'visible', timeout: 15000 })
    await editor.click()
    await page.keyboard.type('Persistent content')
    // Wait for auto-save (500ms debounce + margin)
    await page.waitForTimeout(1500)
    // Refresh
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const editorAfter = page.locator('.ProseMirror')
    await editorAfter.waitFor({ state: 'visible', timeout: 15000 })
    await expect(editorAfter).toContainText('Persistent content')
  })
})
