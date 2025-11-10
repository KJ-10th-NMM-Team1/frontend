import { expect, test } from '@playwright/test'

test('home page renders hero copy', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /더빙 파이프라인/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /예제 영상 재생/i })).toBeVisible()
})

test('workspace renders project creation entry point', async ({ page }) => {
  await page.goto('/workspace')
  await expect(page.getByText(/프로젝트 생성/i)).toBeVisible()
})
