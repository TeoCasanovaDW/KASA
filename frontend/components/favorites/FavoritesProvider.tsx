"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { readFavoriteIds, writeFavoriteIds } from "@/lib/favorites-storage";
import type { Property } from "@/types/property";

type FavoritesContextValue = {
  favoriteIds: Property["id"][];
  hydrated: boolean;
  isFavorite: (id: Property["id"]) => boolean;
  toggleFavorite: (id: Property["id"]) => void;
};

// Structural copy of `toggleFavoriteAction`. The action arrives as a prop
// rather than an import, exactly like `PropertyForm`: it keeps this Client
// Component free of the `"use server"` module so the test can inject a stub.
type ToggleFavoriteAction = (
  propertyId: Property["id"],
  next: boolean
) => Promise<{ ok: boolean }>;

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Idempotent in both directions, so a revert can never duplicate an id. */
function withFavorite(
  ids: Property["id"][],
  id: Property["id"],
  favorite: boolean
) {
  const without = ids.filter((favoriteId) => favoriteId !== id);

  return favorite ? [...without, id] : without;
}

/**
 * Two modes. Signed out (the defaults): `localStorage` is the source of
 * truth, as it has always been. Signed in: the list is seeded from the
 * backend by the `(site)` layout, neither storage effect runs, and a toggle
 * is applied optimistically and reverted when the action reports failure.
 * `useFavorites()`'s shape is the same either way.
 */
export function FavoritesProvider({
  children,
  signedIn = false,
  initialFavoriteIds = [],
  toggleAction,
}: {
  children: React.ReactNode;
  signedIn?: boolean;
  initialFavoriteIds?: Property["id"][];
  toggleAction?: ToggleFavoriteAction;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Property["id"][]>(
    signedIn ? initialFavoriteIds : []
  );
  // Signed-in state is seeded on the server, so there is nothing to wait for.
  const [hydrated, setHydrated] = useState(signedIn);

  // Read stored favorites once on mount, after which writes are safe.
  // localStorage is a client-only external system unavailable during SSR
  // render, so this genuinely needs an effect rather than derived state.
  useEffect(() => {
    if (signedIn) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoriteIds(readFavoriteIds());
    setHydrated(true);
  }, [signedIn]);

  // Skipped until hydration has read real storage, so this initial empty
  // state never clobbers it.
  useEffect(() => {
    if (!signedIn && hydrated) {
      writeFavoriteIds(favoriteIds);
    }
  }, [favoriteIds, hydrated, signedIn]);

  function isFavorite(id: Property["id"]) {
    return favoriteIds.includes(id);
  }

  function toggleFavorite(id: Property["id"]) {
    if (!signedIn) {
      setFavoriteIds((current) =>
        current.includes(id)
          ? current.filter((favoriteId) => favoriteId !== id)
          : [...current, id]
      );
      return;
    }

    const next = !favoriteIds.includes(id);

    setFavoriteIds((current) => withFavorite(current, id, next));

    if (!toggleAction) {
      return;
    }

    // The heart has already flipped; a failure — including a session that
    // expired between render and click — puts it back, and nothing surfaces
    // to the visitor.
    const revert = () =>
      setFavoriteIds((current) => withFavorite(current, id, !next));

    toggleAction(id, next)
      .then((result) => {
        if (!result.ok) {
          revert();
        }
      })
      .catch(revert);
  }

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, hydrated, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}
