import { expect } from "@playwright/test";

export async function mockLoginApi(page) {
  await page.route("**/api/login", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ token: "token-de-prueba" }),
    });
  });
}

export async function loginAsTestUser(page) {
  await page.goto("/login");

  await page.getByLabel("Correo electrónico").fill("juan@prueba.com");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/login\/password/);

  await page.getByLabel("Contraseña").fill("ClaveSegura1!");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/home/);
}