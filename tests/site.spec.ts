import { expect, test, type Page } from '@playwright/test';

async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  return errors;
}

test('home page renders without console errors', async ({ page }) => {
  const errors = await expectNoConsoleErrors(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hello,' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('about page renders without console errors', async ({ page }) => {
  const errors = await expectNoConsoleErrors(page);

  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('work page renders without console errors', async ({ page }) => {
  const errors = await expectNoConsoleErrors(page);

  await page.goto('/work');
  await expect(page.getByRole('link', { name: 'Stage TEN' }).first()).toBeVisible();

  expect(errors).toEqual([]);
});

test('swiper initializes on carousel pages', async ({ page }) => {
  await page.goto('/sfu');

  const swiper = page.locator('.swiper-container.swiper-initialized');
  await expect(swiper).toBeVisible();
});

test('image compare slider can be dragged', async ({ page }) => {
  await page.goto('/sfu');

  const handle = page.locator('.cd-handle');
  await expect(handle).toBeVisible();

  const initialLeft = await handle.evaluate((node) => getComputedStyle(node).left);
  await handle.dragTo(page.locator('[data-testid="image-compare"]'), {
    targetPosition: { x: 220, y: 40 },
  });
  const nextLeft = await handle.evaluate((node) => getComputedStyle(node).left);

  expect(nextLeft).not.toBe(initialLeft);
});
