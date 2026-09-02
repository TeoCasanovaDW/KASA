"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { readFavoriteIds, writeFavoriteIds } from "@/lib/favorites-storage";

type FavoritesContextValue = {
  favoriteIds: string[];
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Read stored favorites once on mount, after which writes are safe.
  // localStorage is a client-only external system unavailable during SSR
  // render, so this genuinely needs an effect rather than derived state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoriteIds(readFavoriteIds());
    setHydrated(true);
  }, []);

  // Skipped until hydration has read real storage, so this initial empty
  // state never clobbers it.
  useEffect(() => {
    if (hydrated) {
      writeFavoriteIds(favoriteIds);
    }
  }, [favoriteIds, hydrated]);

  function isFavorite(id: string) {
    return favoriteIds.includes(id);
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    );
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
