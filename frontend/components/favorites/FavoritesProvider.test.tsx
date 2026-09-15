import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FavoriteButton from "./FavoriteButton";
import { FavoritesProvider } from "./FavoritesProvider";
import type { Property } from "@/types/property";

const STORAGE_KEY = "kasa:favorites";

// Structural copy of `toggleFavoriteAction`: the real one lives alongside the
// `"use server"` module, so the provider takes it as a prop and the test
// injects a stub, exactly as `PropertyForm.test.tsx` does.
type ToggleActionStub = (
  propertyId: Property["id"],
  next: boolean,
) => Promise<{ ok: boolean }>;

function stubAction(result: { ok: boolean } = { ok: true }) {
  return vi.fn<ToggleActionStub>(() => Promise.resolve(result));
}

function renderSignedIn(
  action: ToggleActionStub,
  initialFavoriteIds: Property["id"][] = [],
) {
  return render(
    <FavoritesProvider
      signedIn
      initialFavoriteIds={initialFavoriteIds}
      toggleAction={action}
    >
      <FavoriteButton propertyId="prop-1" />
    </FavoritesProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

// The guest path is covered by `FavoriteButton.test.tsx`; these cover only
// the signed-in mode added on top of it.
describe("FavoritesProvider signed in", () => {
  it("seeds the state from the ids the server passed", () => {
    renderSignedIn(stubAction(), ["prop-1"]);

    const button = screen.getByRole("button", { name: "Retirer des favoris" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("ignores stored guest favorites", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["prop-1"]));

    renderSignedIn(stubAction());

    const button = screen.getByRole("button", { name: "Ajouter aux favoris" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("applies the toggle before the action resolves, and keeps it on success", async () => {
    const user = userEvent.setup();
    let resolveAction: (result: { ok: boolean }) => void = () => {};
    const action = vi.fn<ToggleActionStub>(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        }),
    );
    renderSignedIn(action);

    await user.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    );

    expect(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(action).toHaveBeenCalledWith("prop-1", true);

    await act(async () => {
      resolveAction({ ok: true });
    });

    expect(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("restores the previous state when the action is not ok", async () => {
    const user = userEvent.setup();
    const action = stubAction({ ok: false });
    renderSignedIn(action, ["prop-1"]);

    await user.click(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Retirer des favoris" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
    expect(action).toHaveBeenCalledWith("prop-1", false);
  });

  it("never writes localStorage", async () => {
    const user = userEvent.setup();
    renderSignedIn(stubAction());

    await user.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    );
    await screen.findByRole("button", { name: "Retirer des favoris" });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

// The `(site)` layout keys the provider on the favorites identity — "guest",
// or `user:<id>` — so an auth change remounts it instead of reconciling the
// previous visitor's state in place. These pin that contract from the
// provider's side, including the case it must NOT react to.
describe("FavoritesProvider identity change", () => {
  function tree(
    key: string,
    props: {
      signedIn?: boolean;
      initialFavoriteIds?: Property["id"][];
      toggleAction?: ToggleActionStub;
    } = {},
  ) {
    return (
      <FavoritesProvider key={key} {...props}>
        <FavoriteButton propertyId="prop-1" />
      </FavoritesProvider>
    );
  }

  it("drops the guest list when the visitor signs in", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["prop-1"]));
    const view = render(tree("guest"));

    expect(
      await screen.findByRole("button", { name: "Retirer des favoris" }),
    ).toHaveAttribute("aria-pressed", "true");

    view.rerender(
      tree("user:7", {
        signedIn: true,
        initialFavoriteIds: [],
        toggleAction: stubAction(),
      }),
    );

    expect(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("re-seeds from the new account's list when switching accounts", () => {
    const action = stubAction();
    const view = render(
      tree("user:7", {
        signedIn: true,
        initialFavoriteIds: ["prop-1"],
        toggleAction: action,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    ).toHaveAttribute("aria-pressed", "true");

    view.rerender(
      tree("user:8", {
        signedIn: true,
        initialFavoriteIds: [],
        toggleAction: action,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps an optimistic toggle when the same identity re-renders", async () => {
    const user = userEvent.setup();
    const action = stubAction();
    const signedIn = {
      signedIn: true,
      initialFavoriteIds: [] as Property["id"][],
      toggleAction: action,
    };
    const view = render(tree("user:7", signedIn));

    await user.click(
      screen.getByRole("button", { name: "Ajouter aux favoris" }),
    );

    // The layout re-renders with the pre-toggle list until its next fetch;
    // the optimistic state must survive it.
    view.rerender(tree("user:7", signedIn));

    expect(
      screen.getByRole("button", { name: "Retirer des favoris" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
