import type { Page } from "@playwright/test";

export async function loginAs(page: Page, identifier: string, password: string) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}

export async function selectRadixOption(page: Page, triggerIndex: number, optionText: string) {
  await page.getByRole("combobox").nth(triggerIndex).click();
  await page.getByRole("option", { name: optionText, exact: true }).click();
}
