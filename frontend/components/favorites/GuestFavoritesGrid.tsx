"use client";

import FavoritesGrid from "@/components/favorites/FavoritesGrid";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import type { Property } from "@/types/property";

/**
 * The guest half of `/favoris`: the full property list arrives from the
 * server and is filtered here against the `localStorage` ids. The `hydrated`
 * gate holds the render back until storage has actually been read, so the
 * empty state never flashes over a stored list.
 */
export default function GuestFavoritesGrid({
  properties,
}: {
  properties: Property[];
}) {
  const { favoriteIds, hydrated } = useFavorites();

  if (!hydrated) {
    return null;
  }

  return (
    <FavoritesGrid
      properties={properties.filter((property) =>
        favoriteIds.includes(property.id)
      )}
    />
  );
}
