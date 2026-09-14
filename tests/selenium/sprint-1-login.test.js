import assert from "node:assert/strict";
import { Browser, Builder, By, until } from "selenium-webdriver";

const BASE_URL = "https://digital-money-house-frontend-dvc.vercel.app";

let driver;

try {
  driver = await new Builder().forBrowser(Browser.CHROME).build();

  await driver.get(BASE_URL);

  const title = await driver.getTitle();
  assert.equal(title, "Digital Money House");

  const loginLink = await driver.findElement(By.css('a[href="/login"]'));
  await loginLink.click();

  await driver.wait(until.urlContains("/login"), 10000);

  await driver.get(`${BASE_URL}/home`);
  await driver.wait(until.urlContains("/login"), 10000);

  console.log("Prueba Selenium aprobada.");
} finally {
  if (driver) {
    await driver.quit();
  }
}