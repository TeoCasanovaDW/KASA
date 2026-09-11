import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UserMenu from "./UserMenu";

const TRIGGER_NAME = "Marie, ouvrir le menu du compte";
const LOGOUT_NAME = "Se déconnecter";

function renderMenu(picture: string | null = null, showName = false) {
  const logoutAction = vi.fn(() => Promise.resolve());
  render(
    <UserMenu
      name="Marie"
      picture={picture}
      logoutAction={logoutAction}
      showName={showName}
    />,
  );

  return { logoutAction };
}

const trigger = () => screen.getByRole("button", { name: TRIGGER_NAME });
const logout = () => screen.queryByRole("button", { name: LOGOUT_NAME });

describe("UserMenu", () => {
  it("keeps the logout control out of the header until the avatar is used", () => {
    renderMenu();

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(logout()).not.toBeInTheDocument();
  });

  it("falls back to the shared avatar when the user has no picture", () => {
    renderMenu(null);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the real profile picture when there is one", () => {
    renderMenu("/uploads/marie.jpg");

    expect(trigger().querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("marie.jpg"),
    );
  });

  it("opens the menu on click and focuses the logout control", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(logout()).toHaveFocus();
  });

  it("submits the existing logout action from the menu", async () => {
    const user = userEvent.setup();
    const { logoutAction } = renderMenu();

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: LOGOUT_NAME }));

    expect(logoutAction).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape and returns focus to the avatar", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(trigger());
    await user.keyboard("{Escape}");

    expect(logout()).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("closes when the click lands outside the menu", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(trigger());
    await user.click(document.body);

    expect(logout()).not.toBeInTheDocument();
  });

  it("is reachable and openable with the keyboard alone", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.tab();
    expect(trigger()).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(logout()).toBeInTheDocument();
  });

  it("shows the first name alongside the avatar in the mobile panel", () => {
    renderMenu(null, true);

    expect(trigger()).toHaveTextContent("Marie");
  });
});
