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

test("opens the consent material and moves through its carousel", async ({ page }) => {
  await page.goto("/#/materials/consent");

  await expect(
    page.getByRole("heading", { name: "Що важливо знати про згоду" }),
  ).toBeVisible();

  await expect(
    page.getByRole("navigation", { name: "Зміст матеріалу" }),
  ).toHaveCount(0);

  await page
    .getByRole("heading", { name: "5 складових згоди" })
    .getByRole("button")
    .click();

  await expect(
    page.getByRole("progressbar", { name: "Складова 1 із 5" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Далі" }).click();

  await expect(
    page.getByRole("heading", { name: "2. Чітка й поінформована" }),
  ).toBeVisible();

  await page
    .getByRole("heading", { name: "Як запитувати й перевіряти згоду" })
    .getByRole("button")
    .click();

  await expect(
    page
      .getByRole("heading", { name: "5 складових згоди" })
      .getByRole("button"),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    page
      .getByRole("heading", { name: "Як запитувати й перевіряти згоду" })
      .getByRole("button"),
  ).toHaveAttribute("aria-expanded", "true");

  const openedSectionTop = await page.locator("#checking-consent").evaluate(
    (section) => Math.round(section.getBoundingClientRect().top),
  );
  expect(openedSectionTop).toBeGreaterThanOrEqual(0);
  expect(openedSectionTop).toBeLessThanOrEqual(24);

  await expect(
    page.getByRole("navigation", { name: "Навігація між матеріалами" }),
  ).toHaveCount(0);

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

test("filters sex myths into groups and opens bordered cards", async ({ page }) => {
  await page.goto("/#/materials/sex-myths");

  await expect(page.getByRole("heading", { name: "Міфи про секс" })).toBeVisible();

  const categoryPicker = page.getByRole("group", { name: "Групи міфів" });
  const expectationsButton = categoryPicker.getByRole("button", {
    name: "Очікування й стереотипи",
  });
  await expect(expectationsButton).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", {
      name: "Міф 1. «У певному віці всі вже цим займаються»",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Міф 7. «Про секс не потрібно говорити заздалегідь — це зіпсує момент»",
    }),
  ).toHaveCount(0);

  const consentSignalsButton = categoryPicker.getByRole("button", {
    name: "Згода й сигнали",
  });
  await consentSignalsButton.click();
  await expect(consentSignalsButton).toHaveAttribute("aria-pressed", "true");

  const seventhMythHeading = page.getByRole("heading", {
    name: "Міф 7. «Про секс не потрібно говорити заздалегідь — це зіпсує момент»",
  });
  await seventhMythHeading.getByRole("button").click();
  await expect(
    page.getByText(/спокійна розмова до близькості допомагає зрозуміти бажання/),
  ).toBeVisible();

  const seventhCard = page.locator("#sex-myth-7");
  await expect(seventhCard).toHaveCSS("border-top-style", "solid");
  await expect(seventhCard).toHaveCSS("border-top-width", "1px");

  const eighthMythHeading = page.getByRole("heading", {
    name: "Міф 8. «Якщо вже почали, потрібно довести справу до кінця»",
  });
  await eighthMythHeading.getByRole("button").click();
  await expect(seventhMythHeading.getByRole("button")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(eighthMythHeading.getByRole("button")).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  const openedCardTop = await page.locator("#sex-myth-8").evaluate((card) =>
    Math.round(card.getBoundingClientRect().top),
  );
  expect(openedCardTop).toBeGreaterThanOrEqual(0);
  expect(openedCardTop).toBeLessThanOrEqual(24);

  const sourcesButton = page
    .getByRole("heading", { name: "Джерела" })
    .getByRole("button");
  await expect(sourcesButton).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("link", { name: "ВООЗ: сексуальне здоров’я" }),
  ).toHaveCount(0);

  await sourcesButton.click();

  await expect(sourcesButton).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("link", { name: "ВООЗ: сексуальне здоров’я" }),
  ).toBeVisible();

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

test("opens protection sections with card points and collapsed sources", async ({
  page,
}) => {
  await page.goto("/#/materials/protection");

  await expect(
    page.getByRole("heading", { name: "Що важливо знати про статевий акт" }),
  ).toBeVisible();

  const cycleHeading = page.getByRole("heading", {
    name: "Менструальний цикл, фертильність і вагітність",
  });
  const condomChoiceHeading = page.getByRole("heading", {
    name: "Вибір і зберігання презерватива",
  });
  await cycleHeading.getByRole("button").click();

  const firstPoint = page.getByText(
    /Після першої менструації кожній дівчині корисно відстежувати свій цикл/,
  );
  await expect(firstPoint).toBeVisible();
  await expect(firstPoint).toHaveCSS("border-top-style", "solid");

  await condomChoiceHeading.getByRole("button").click();
  await expect(cycleHeading.getByRole("button")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(condomChoiceHeading.getByRole("button")).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  const openedSectionTop = await page
    .locator("#choosing-storing-condoms")
    .evaluate((section) => Math.round(section.getBoundingClientRect().top));
  expect(openedSectionTop).toBeGreaterThanOrEqual(0);
  expect(openedSectionTop).toBeLessThanOrEqual(24);

  const emergencyHeading = page.getByRole("heading", {
    name: "Якщо захисту не було або щось пішло не так",
  });
  await emergencyHeading.getByRole("button").click();
  await expect(
    page.getByText(
      /Таблетка екстреної контрацепції запобігає овуляції або відкладає її/,
    ),
  ).toBeVisible();

  const sourcesButton = page
    .getByRole("heading", { name: "Джерела" })
    .getByRole("button");
  await expect(sourcesButton).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("link", { name: "ВООЗ: презервативи" }),
  ).toHaveCount(0);

  await sourcesButton.click();

  await expect(sourcesButton).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("link", { name: "ВООЗ: презервативи" }),
  ).toBeVisible();

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
