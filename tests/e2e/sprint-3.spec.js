import { test, expect } from "@playwright/test";
import { loginAsTestUser, mockLoginApi } from "./auth.helper";

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

  await page.route(
    "**/api/accounts/10/transactions/2555",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          id: 2555,
          account_id: 10,
          description: "Depósito de dinero",
          amount: 100,
          dated: "2026-09-18T19:06:00.000Z",
          origin: "Visa terminada en 4242",
          destination: "Cuenta Digital Money House",
        }),
      });
    }
  );

  await page.route("**/api/users/1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        firstname: "Juan",
        lastname: "Prueba",
        email: "juan@prueba.com",
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

  await page.route("**/api/accounts/10/deposits", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ id: 2555 }),
    });
  });
}

test("muestra el CVU y alias para ingresar desde otra cuenta", async ({
  page,
}) => {
  await mockLoginApi(page);
  await mockSprint3Api(page);
  await loginAsTestUser(page);

  await page.getByRole("link", { name: "Cargar dinero" }).click();
  await page
    .getByRole("link", { name: "Ingresar desde otra cuenta" })
    .click();

  await expect(
  page.getByRole("heading", {
    name: "Ingresá desde otra cuenta",
    exact: true,
  })
).toBeVisible();
  await expect(page.getByText("0000003100000000000001")).toBeVisible();
  await expect(page.getByText("sol.luna.mar")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copiar CVU" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copiar alias" })
  ).toBeVisible();
});

test("filtra actividad de hoy y abre el detalle del movimiento", async ({
  page,
}) => {
  await mockLoginApi(page);
  await mockSprint3Api(page);
  await loginAsTestUser(page);

  await page
  .getByRole("link", { name: "Actividad", exact: true })
  .click();
  await page.getByLabel("Período").selectOption("today");

  await expect(page.getByText("Depósito de dinero")).toBeVisible();

  await page.getByText("Depósito de dinero").click();

  await expect(
    page.getByRole("heading", { name: "Detalle del movimiento" })
  ).toBeVisible();
  await expect(page.getByText("2555")).toBeVisible();
  await expect(page.getByText("Cuenta Digital Money House")).toBeVisible();
});

test("muestra el comprobante al completar un ingreso", async ({ page }) => {
  await mockLoginApi(page);
  await mockSprint3Api(page);
  await loginAsTestUser(page);

  await page.getByRole("link", { name: "Cargar dinero" }).click();
  await page
    .getByRole("link", { name: "Ingresar desde tarjeta" })
    .click();

  await page.getByRole("radio").check();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByLabel("Monto a ingresar").fill("100");
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByRole("button", { name: "Confirmar ingreso" }).click();

  await expect(
  page.getByRole("heading", {
    name: "Comprobante de ingreso",
    exact: true,
  })
).toBeVisible();
  await expect(page.getByText("Visa terminada en 4242")).toBeVisible();
  await expect(page.getByText("2555")).toBeVisible();
  await expect(page.getByText(/\$.*100,00/)).toBeVisible();
});