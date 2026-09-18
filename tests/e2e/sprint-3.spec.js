import { test, expect } from "@playwright/test";

async function mockSprint3Api(page) {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: 10,
        user_id: 1,
        alias: "sol.luna.mar",
        cvu: "0000003100000000000001",
        available_amount: 12600.5,
      }),
    });
  });

  await page.route("**/api/accounts/10/cards", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 20,
          number_id: "4242424242424242",
          expiration_date: "12/2032",
        },
      ]),
    });
  });

  await page.route("**/api/accounts/10/activity", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 2555,
          description: "Depósito de dinero",
          amount: 100,
          dated: "2026-09-18T19:06:00.000Z",
          origin: "Visa terminada en 4242",
          destination: "Cuenta Digital Money House",
        },
      ]),
    });
  });

  await page.addInitScript(() => {
    localStorage.setItem("token", "token-de-prueba");
  });
}

test("muestra el CVU y alias para ingresar desde otra cuenta", async ({ page }) => {
  await mockSprint3Api(page);

  await page.goto("/deposit/external");

  await expect(page.getByText("Ingresá desde otra cuenta")).toBeVisible();
  await expect(page.getByText("0000003100000000000001")).toBeVisible();
  await expect(page.getByText("sol.luna.mar")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar CVU" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar alias" })).toBeVisible();
});

test("filtra actividad de hoy y abre el detalle del movimiento", async ({ page }) => {
  await mockSprint3Api(page);

  await page.goto("/activity");

  await page.getByLabel("Período").selectOption("today");

  await expect(page.getByText("Depósito de dinero")).toBeVisible();

  await page.getByText("Depósito de dinero").click();

  await expect(page.getByRole("heading", { name: "Detalle del movimiento" })).toBeVisible();
  await expect(page.getByText("2555")).toBeVisible();
  await expect(page.getByText("Cuenta Digital Money House")).toBeVisible();
});

test("muestra el comprobante de ingreso", async ({ page }) => {
  await mockSprint3Api(page);

  await page.goto(
    "/deposit/success?amount=100&origin=Visa%20terminada%20en%204242&operation=2555"
  );

  await expect(page.getByText("Comprobante de ingreso")).toBeVisible();
  await expect(page.getByText("Visa terminada en 4242")).toBeVisible();
  await expect(page.getByText("2555")).toBeVisible();
  await expect(page.getByText(/\$.*100,00/)).toBeVisible();
});