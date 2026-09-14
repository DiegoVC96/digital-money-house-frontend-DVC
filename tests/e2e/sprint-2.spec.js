import { test, expect } from "@playwright/test";

async function mockAccountApi(page) {
  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: 10,
        user_id: 1,
        alias: "sol.luna.mar",
        cvu: "0000003100000000000001",
        available_amount: 12500.5,
      }),
    });
  });

  await page.route("**/api/users/1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        firstname: "Juan",
        lastname: "Prueba",
        email: "juan@prueba.com",
        dni: 12345678,
        phone: "1112345678",
      }),
    });
  });

  await page.route("**/api/accounts/10/activity", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          description: "Ingresaste dinero",
          amount: 5000,
          dated: "2026-09-14T10:00:00.000Z",
        },
      ]),
    });
  });

  await page.route("**/api/accounts/10/cards", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.addInitScript(() => {
    localStorage.setItem("token", "token-de-prueba");
  });
}

test("muestra saldo, nombre y último movimiento en el dashboard", async ({
  page,
}) => {
  await mockAccountApi(page);

  await page.goto("/home");

  await expect(page.getByText("Hola, Juan Prueba")).toBeVisible();
  await expect(page.getByText(/12\.500,50/)).toBeVisible();
  await expect(page.getByText("Ingresaste dinero")).toBeVisible();
});

test("muestra tarjetas vacías y permite abrir el formulario de alta", async ({
  page,
}) => {
  await mockAccountApi(page);

  await page.goto("/cards");

  await expect(page.getByText("No tienes tarjetas asociadas.")).toBeVisible();

  await page.getByText("Nueva tarjeta").click();

  await expect(page.getByText("Agregá una nueva tarjeta")).toBeVisible();
  await expect(page.getByLabel("Número de la tarjeta*")).toBeVisible();
  await expect(page.getByLabel("Fecha de vencimiento*")).toBeVisible();
});