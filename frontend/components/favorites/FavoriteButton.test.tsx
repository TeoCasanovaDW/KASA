import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import FavoriteButton from "./FavoriteButton";
import { FavoritesProvider } from "./FavoritesProvider";
import { readFavoriteIds, writeFavoriteIds } from "@/lib/favorites-storage";

const STORAGE_KEY = "kasa:favorites";

function renderButton(propertyId: string) {
  return render(
    <FavoritesProvider>
      <FavoriteButton propertyId={propertyId} />
    </FavoritesProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("FavoriteButton", () => {
  it("mounts un-favorited by default", () => {
    renderButton("prop-1");

    const button = screen.getByRole("button", { name: "Ajouter aux favoris" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("marks the property favorited on click and persists it", async () => {
    const user = userEvent.setup();
    renderButton("prop-1");

    await user.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    );

    const button = screen.getByRole("button", { name: "Retirer des favoris" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(readFavoriteIds()).toContain("prop-1");
  });

  it("un-favorites on a second click and removes it from storage", async () => {
    const user = userEvent.setup();
    renderButton("prop-1");

    await user.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    );

    const button = screen.getByRole("button", { name: "Ajouter aux favoris" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(readFavoriteIds()).not.toContain("prop-1");
  });

  it("restores a favorited state from storage on mount", () => {
    writeFavoriteIds(["prop-1"]);

    renderButton("prop-1");

    const button = screen.getByRole("button", { name: "Retirer des favoris" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps two instances of the same id in sync", async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <FavoriteButton propertyId="prop-1" />
        <FavoriteButton propertyId="prop-1" />
      </FavoritesProvider>,
    );

    const [first, second] = screen.getAllByRole("button", {
      name: "Ajouter aux favoris",
    });

    await user.click(first);

    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(second).toHaveAttribute("aria-pressed", "true");
  });

  it("does not throw on malformed storage and mounts un-favorited", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");

    renderButton("prop-1");

    const button = screen.getByRole("button", { name: "Ajouter aux favoris" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
