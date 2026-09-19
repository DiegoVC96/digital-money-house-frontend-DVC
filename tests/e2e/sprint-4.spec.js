import { test, expect } from "@playwright/test";
import { loginAsTestUser, mockLoginApi } from "./auth.helper";

async function mockPaymentMethods(page, availableAmount) {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: 10,
        user_id: 1,
        alias: "sol.luna.mar",
        cvu: "0000003100000000000001",
        available_amount: availableAmount,
      }),
    });
  });

  await page.route("**/api/accounts/10/cards", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

async function openCablevision(page) {
  await page.getByRole("link", {
    name: "Pagar servicios",
    exact: true,
  }).click();

  const cablevisionItem = page
    .locator(".service-item")
    .filter({ hasText: "Cablevisión" });

  await cablevisionItem
    .getByRole("link", { name: "Seleccionar" })
    .click();
}

test("busca servicios por nombre", async ({ page }) => {
  await mockLoginApi(page);
  await loginAsTestUser(page);

  await page.getByRole("link", {
    name: "Pagar servicios",
    exact: true,
  }).click();

  await page
    .getByPlaceholder("Buscá entre más de 5.000 empresas")
    .fill("cable");

  await expect(page.getByText("Cablevisión")).toBeVisible();
  await expect(page.getByText("Claro")).not.toBeVisible();
});

test("valida el número de cuenta del servicio", async ({ page }) => {
  await mockLoginApi(page);
  await loginAsTestUser(page);

  await openCablevision(page);

  await expect(page).toHaveURL(/\/services\/cablevision/);

  await page
    .getByLabel("Número de cuenta sin el primer 2")
    .fill("123");

  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByText("Ingresá 11 números sin espacios.")
  ).toBeVisible();
});

test("impide pagar un servicio cuando el saldo es insuficiente", async ({
  page,
}) => {
  await mockLoginApi(page);
  await mockPaymentMethods(page, 0);
  await loginAsTestUser(page);

  await openCablevision(page);

  await page
    .getByLabel("Número de cuenta sin el primer 2")
    .fill("37289701912");

  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("radio").check();
  await page.getByRole("button", { name: "Pagar" }).click();

  await expect(
    page.getByRole("heading", {
      name: "No pudimos realizar tu pago",
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText("No tenés saldo suficiente para pagar Cablevisión.")
  ).toBeVisible();
});

test("muestra confirmación y éxito en modo demostración", async ({ page }) => {
  await mockLoginApi(page);
  await mockPaymentMethods(page, 5000);
  await loginAsTestUser(page);

  await openCablevision(page);

  await page
    .getByLabel("Número de cuenta sin el primer 2")
    .fill("37289701912");

  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("radio").check();
  await page.getByRole("button", { name: "Pagar" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Confirmá el pago",
      exact: true,
    })
  ).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/services\/success/),
    page.getByRole("button", { name: "Confirmar pago" }).click(),
  ]);

  await expect(
    page.getByRole("heading", {
      name: "Pago registrado",
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText(/Comprobante de demostración/)
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Descargar comprobante PDF" })
  ).toBeVisible();
});
