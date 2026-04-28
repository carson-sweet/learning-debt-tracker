/**
 * E2E tests for NFR-001: Fully local, no network calls
 * These tests require a running app instance (npm run dev).
 * They are excluded from vitest CI runs per vitest.config.ts.
 * Run with: npm run test:e2e
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

async function goOffline(page: Page) {
  await page.context().setOffline(true)
}

async function goOnline(page: Page) {
  await page.context().setOffline(false)
}

test.describe('NFR-001: App runs fully locally with no network calls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.afterEach(async ({ page }) => {
    await goOnline(page)
  })

  test('app loads successfully with no internet connection', async ({ page }) => {
    await goOffline(page)
    await page.reload()

    await expect(page).not.toHaveTitle(/error|cannot reach|connection/i)
    await expect(page.getByRole('textbox', { name: /title|capture/i })).toBeVisible()
  })

  test('capture works when offline', async ({ page }) => {
    await goOffline(page)
    const input = page.getByRole('textbox', { name: /title|capture/i })
    await input.fill('Understand QUIC protocol')
    await input.press('Enter')

    await expect(page.getByText('Understand QUIC protocol')).toBeVisible()
  })

  test('backlog view displays existing items when offline', async ({ page }) => {
    // First capture an item online
    const input = page.getByRole('textbox', { name: /title|capture/i })
    await input.fill('Offline backlog test item')
    await input.press('Enter')
    await expect(page.getByText('Offline backlog test item')).toBeVisible()

    // Go offline and reload
    await goOffline(page)
    await page.reload()

    await expect(page.getByText('Offline backlog test item')).toBeVisible()
    await expect(page.getByText(/error|failed|connection/i)).not.toBeVisible()
  })

  test('status change works when offline', async ({ page }) => {
    // Setup: create an item
    const input = page.getByRole('textbox', { name: /title|capture/i })
    await input.fill('Offline status test')
    await input.press('Enter')
    await expect(page.getByText('Offline status test')).toBeVisible()

    await goOffline(page)
    // Mark in progress
    await page.getByRole('button', { name: /in.progress|mark.*progress/i }).first().click()

    await expect(page.getByText(/in.progress/i)).toBeVisible()
  })

  test('resolve works when offline', async ({ page }) => {
    // Setup: create and mark an item in-progress
    const input = page.getByRole('textbox', { name: /title|capture/i })
    await input.fill('Offline resolve test')
    await input.press('Enter')
    await page.getByRole('button', { name: /in.progress|mark.*progress/i }).first().click()

    await goOffline(page)
    // Open item detail and resolve
    await page.getByText('Offline resolve test').click()
    await page.getByRole('button', { name: /resolve/i }).click()
    await page.getByPlaceholder(/what do you understand/i).fill('My explanation')
    await page.getByRole('button', { name: /submit.resolution/i }).click()

    await expect(page.getByText(/resolved/i)).toBeVisible()
  })

  test('dashboard loads when offline', async ({ page }) => {
    await goOffline(page)
    await page.goto(`${BASE_URL}/dashboard`)

    await expect(page.getByText(/total open|open items/i)).toBeVisible()
    await expect(page.getByText(/error|connection|network/i)).not.toBeVisible()
  })

  test('no requests to external domains during normal use', async ({ page }) => {
    const externalRequests: string[] = []
    page.on('request', (req) => {
      const url = req.url()
      if (!url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) {
        externalRequests.push(url)
      }
    })

    // Perform typical app actions
    const input = page.getByRole('textbox', { name: /title|capture/i })
    await input.fill('Network test item')
    await input.press('Enter')
    await expect(page.getByText('Network test item')).toBeVisible()

    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page.getByText(/total open|open items/i)).toBeVisible()

    expect(externalRequests).toHaveLength(0)
  })
})
