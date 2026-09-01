import { render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByRole("link", { name: "Зміст" })).toHaveAttribute(
      "href",
      "/materials",
    );
    expect(screen.getByRole("link", { name: "Наступне" })).toHaveAttribute(
      "href",
      "/materials/sex-myths",
    );
  });
});
