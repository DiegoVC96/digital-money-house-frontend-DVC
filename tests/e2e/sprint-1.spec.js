import { expect, test } from "@playwright/test";

test("muestra la landing y sus accesos principales", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /De ahora en adelante, hacés más con tu dinero/i,
    })
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Crear cuenta" })
  ).toHaveAttribute("href", "/register");

  await expect(
    page.getByRole("link", { name: "Ingresar" })
  ).toHaveAttribute("href", "/login");
});

test("valida el email antes de avanzar al segundo paso del login", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByPlaceholder("Correo electrónico").fill("email-invalido");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByText("Ingresá un correo electrónico válido.", { exact: true })
  ).toBeVisible();

  await expect(page).toHaveURL(/\/login$/);
});

test("lleva al segundo paso después de un email válido", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("Correo electrónico").fill("prueba@example.com");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/login\/password$/);

  await expect(
    page.getByRole("heading", { name: "Ingresá tu contraseña" })
  ).toBeVisible();
});

test("protege home cuando no existe token", async ({ page }) => {
  await page.goto("/home");

  await expect(page).toHaveURL(/\/login$/);

  await expect(
    page.getByRole("heading", { name: "¡Hola! Ingresá tu e-mail" })
  ).toBeVisible();
});