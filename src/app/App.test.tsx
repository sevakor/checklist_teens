import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./App";

function renderApp(path = "/start") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("checklist flow", () => {
  it("shows the privacy dialog before a new checklist", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Почати" }));

    expect(
      screen.getByRole("dialog", { name: /запарились над сек’юрністю/i }),
    ).toBeVisible();
  });

  it("starts empty and allows moving forward without selections", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Почати" }));
    await user.click(screen.getByRole("button", { name: "Ок" }));

    expect(await screen.findByRole("heading", { name: "Моє бажання" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Далі" }));
    expect(await screen.findByRole("heading", { name: "Стосунки" })).toBeVisible();
  });

  it("toggles an item by clicking its text and persists it in session storage", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Почати" }));
    await user.click(screen.getByRole("button", { name: "Ок" }));

    const checkbox = await screen.findByRole("checkbox", {
      name: /Це справді моє бажання/,
    });
    await user.click(screen.getByText(/Це справді моє бажання/));
    expect(checkbox).toBeChecked();

    await waitFor(() => {
      expect(window.sessionStorage.length).toBeGreaterThan(0);
    });
  });
});

describe("consent material", () => {
  it("shows the full material structure and moves through the consent carousel", async () => {
    const user = userEvent.setup();
    renderApp("/materials/consent");

    expect(
      screen.getByRole("heading", { name: "Що важливо знати про згоду" }),
    ).toBeVisible();

    expect(
      screen.queryByRole("navigation", { name: "Зміст матеріалу" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(
        screen.getByRole("heading", { name: "5 складових згоди" }),
      ).getByRole("button"),
    );

    expect(
      screen.getByRole("progressbar", { name: "Складова 1 із 5" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "1. Вільна й добровільна" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Далі" }));

    expect(
      screen.getByRole("progressbar", { name: "Складова 2 із 5" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "2. Чітка й поінформована" }),
    ).toBeVisible();

    await user.click(
      within(
        screen.getByRole("heading", {
          name: "Як запитувати й перевіряти згоду",
        }),
      ).getByRole("button"),
    );

    expect(
      within(
        screen.getByRole("heading", { name: "5 складових згоди" }),
      ).getByRole("button"),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(
        screen.getByRole("heading", {
          name: "Як запитувати й перевіряти згоду",
        }),
      ).getByRole("button"),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.queryByRole("navigation", { name: "Навігація між матеріалами" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("progressbar", { name: "Складова 2 із 5" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("«Можна тебе поцілувати?»"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Усі матеріали" }),
    ).toHaveAttribute(
      "href",
      "/materials",
    );
  });
});

describe("sex myths material", () => {
  it("groups the myths and opens only one card at a time", async () => {
    const user = userEvent.setup();
    renderApp("/materials/sex-myths");

    expect(screen.getByRole("heading", { name: "Міфи про секс" })).toBeVisible();
    expect(
      screen.getByText(/Секс часто обростає міфами з розмов із друзями/),
    ).toBeVisible();

    const categoryPicker = screen.getByRole("group", { name: "Групи міфів" });
    expect(
      within(categoryPicker).getByRole("button", {
        name: "Очікування й стереотипи",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", {
        name: "Міф 1. «У певному віці всі вже цим займаються»",
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", {
        name: "Міф 7. «Про секс не потрібно говорити заздалегідь — це зіпсує момент»",
      }),
    ).not.toBeInTheDocument();

    const firstMythButton = within(
      screen.getByRole("heading", {
        name: "Міф 1. «У певному віці всі вже цим займаються»",
      }),
    ).getByRole("button");
    await user.click(firstMythButton);

    expect(firstMythButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/немає віку, до якого людина «має встигнути»/),
    ).toBeVisible();

    await user.click(
      within(categoryPicker).getByRole("button", {
        name: "Згода й сигнали",
      }),
    );

    expect(
      screen.queryByRole("heading", {
        name: "Міф 1. «У певному віці всі вже цим займаються»",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Міф 7. «Про секс не потрібно говорити заздалегідь — це зіпсує момент»",
      }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Що справді важливо" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Джерела" })).toBeVisible();

    const sourcesButton = within(
      screen.getByRole("heading", { name: "Джерела" }),
    ).getByRole("button");
    expect(sourcesButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: "ВООЗ: сексуальне здоров’я" }),
    ).not.toBeInTheDocument();

    await user.click(sourcesButton);

    expect(sourcesButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: "ВООЗ: сексуальне здоров’я" }),
    ).toHaveAttribute("href", "https://www.who.int/health-topics/sexual-health");
  });
});
