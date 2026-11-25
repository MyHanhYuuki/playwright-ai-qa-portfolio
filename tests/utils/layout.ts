import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Layout checks shared by every spec (SD-103 HITL #2 decision 5): positions compared with a standard_user baseline
 * measured in the same run, after fonts and images are loaded; rotation compared absolutely (transform = none).
 * Never compare screenshots pixel by pixel, never use the visual_user-only class `visual_failure` as an oracle.
 */

/** Allowed offset between the same element of two accounts (px). One constant for all features. */
export const TOLERANCE_PX = 5;

/** Fonts + images loaded and page scrolled to the top, so element positions are final and comparable. */
export async function ready(page: Page) {
  // The app keeps the scroll position across client-side page changes (clicking Checkout under a 3-line cart scrolls),
  // and boundingBox() is relative to the viewport.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect.poll(() => page.evaluate(() => [...document.images].every((i) => i.complete))).toBe(true);
}

/** Bounding box of a visible element (throws if it has none). */
export async function box(l: Locator) {
  await expect(l).toBeVisible();
  const b = await l.boundingBox();
  if (!b) throw new Error('no bounding box');
  return b;
}

/** Soft: two boxes at the same place (≤ TOLERANCE_PX on each axis). */
export function expectNear(a: { x: number; y: number }, b: { x: number; y: number }, what: string) {
  expect.soft(Math.abs(a.x - b.x), `${what} lệch ngang (px)`).toBeLessThanOrEqual(TOLERANCE_PX);
  expect.soft(Math.abs(a.y - b.y), `${what} lệch dọc (px)`).toBeLessThanOrEqual(TOLERANCE_PX);
}

/** Soft: element `a` at the same place as baseline element `b`. */
export async function expectSamePlace(a: Locator, b: Locator, what: string) {
  expectNear(await box(a), await box(b), what);
}

/** Computed CSS transform of an element ('none' = not rotated). */
export const transformOf = (l: Locator) => l.evaluate((el) => getComputedStyle(el).transform);

/**
 * Header like the standard_user baseline page: cart icon at the same place, cart and menu icons not rotated.
 * Icons are decorative (no role / test id) → CSS, as in AppPage.
 */
export async function expectHeaderLike(page: Page, base: Page, where: string) {
  const icon = (p: Page) => p.locator('.shopping_cart_container');
  const menu = page.locator('.bm-icon');
  await expectSamePlace(icon(page), icon(base), `${where}: biểu tượng giỏ`);
  expect.soft(await transformOf(icon(page)), `${where}: biểu tượng giỏ bị xoay`).toBe('none');
  expect.soft(await transformOf(menu), `${where}: biểu tượng menu bị xoay`).toBe('none');
}
