import { expect, test } from "@playwright/test";
import axe from "axe-core";

type AxeResult = {
  violations: Array<{ id: string; impact: string | null; help: string }>;
};

type WindowWithAxe = Window & {
  axe: { run: (context: Document) => Promise<AxeResult> };
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/start");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload();
});

test("completes all six steps without selecting answers", async ({ page }) => {
  const unsafeMethods: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method())) {
      unsafeMethods.push(request.method());
    }
  });

  await page.getByRole("button", { name: "Почати" }).click();
  await page.getByRole("button", { name: "Ок" }).click();

  for (let step = 1; step <= 5; step += 1) {
    await expect(
      page.getByRole("progressbar", { name: `Крок ${step} із 6` }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Далі" }).click();
  }

  await expect(
    page.getByRole("progressbar", { name: "Крок 6 із 6" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Завершити" }).click();
  await expect(page.getByRole("heading", { name: "Ти завершив/ла чекліст" })).toBeVisible();
  await expect(page.getByText("Твої позначки вже очищено")).toBeVisible();

  const storedState = await page.evaluate(() => ({
    session: window.sessionStorage.getItem(
      "intimacy-reflection-checklist:session:v1",
    ),
    completed: window.localStorage.getItem(
      "intimacy-reflection-checklist:completed:v1",
    ),
  }));
  expect(storedState).toEqual({ session: null, completed: "true" });
  expect(unsafeMethods).toEqual([]);

  await page.goto("/");
  await expect(page).toHaveURL(/#\/materials$/);
  await expect(page.getByRole("heading", { name: "Корисні матеріали" })).toBeVisible();
});

test("restores a selected item after reload", async ({ page }) => {
  await page.getByRole("button", { name: "Почати" }).click();
  await page.getByRole("button", { name: "Ок" }).click();
  const checkbox = page.getByRole("checkbox", { name: /Це справді моє бажання/ });
  await checkbox.check();
  await page.reload();
  await expect(checkbox).toBeChecked();
});

test("shows the final screen after a repeated checklist", async ({ page }) => {
  await page.evaluate(() =>
    window.localStorage.setItem(
      "intimacy-reflection-checklist:completed:v1",
      "true",
    ),
  );
  await page.reload();

  await page.getByRole("button", { name: "Пройти ще раз" }).click();
  await page.getByRole("button", { name: "Ок" }).click();

  for (let step = 1; step <= 5; step += 1) {
    await page.getByRole("button", { name: "Далі" }).click();
  }

  await page.getByRole("button", { name: "Завершити" }).click();
  await expect(page).toHaveURL(/#\/complete$/);
  await expect(
    page.getByRole("heading", { name: "Ти завершив/ла чекліст" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Перейти до матеріалів" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Пройти ще раз" })).toBeVisible();
  await expect(page.getByText("Твої позначки вже очищено")).toBeVisible();
});

test("has no automatically detectable critical accessibility violations", async ({
  page,
}) => {
  await page.addScriptTag({ content: axe.source });
  const result = await page.evaluate(() =>
    (window as unknown as WindowWithAxe).axe.run(document),
  );

  expect(
    result.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});
