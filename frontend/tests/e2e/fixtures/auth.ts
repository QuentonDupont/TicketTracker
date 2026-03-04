import { Page } from '@playwright/test'
import { TEST_TICKETS, TEST_EPICS, TEST_PROJECTS, TEST_TEAM_MEMBERS } from './test-data'

export async function loginViaUI(page: Page, email = 'quentondupont@gmail.com', password = '1234567') {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|$)/, { timeout: 15000 })
}

export async function loginViaLocalStorage(page: Page) {
  // Navigate to a page first so we have a valid origin for localStorage
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
  // Set auth data using the same token the app uses
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'demo_token')
    localStorage.setItem('user_data', JSON.stringify({
      id: 'user_test',
      name: 'Test User',
      email: 'test@example.com'
    }))
  })
  // Navigate to dashboard - the AuthProvider will pick up localStorage on mount
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 })
  // Wait for the page to fully render (auth loading spinner to disappear)
  await page.waitForSelector('text=/loading/i', { state: 'hidden', timeout: 10000 }).catch(() => {})
}

export async function seedTestData(page: Page) {
  await page.evaluate(({ tickets, epics, projects, members }) => {
    localStorage.setItem('tickets', JSON.stringify(tickets))
    localStorage.setItem('epics', JSON.stringify(epics))
    localStorage.setItem('project_spaces', JSON.stringify(projects))
    localStorage.setItem('team_members', JSON.stringify(members))
    localStorage.setItem('ticket_links', JSON.stringify([]))
    localStorage.setItem('ticket_activities', JSON.stringify([]))
    localStorage.setItem('ticket_comments', JSON.stringify([]))
  }, {
    tickets: TEST_TICKETS,
    epics: TEST_EPICS,
    projects: TEST_PROJECTS,
    members: TEST_TEAM_MEMBERS,
  })
}

export async function clearTestData(page: Page) {
  await page.evaluate(() => {
    localStorage.clear()
  }).catch(() => {})
}
