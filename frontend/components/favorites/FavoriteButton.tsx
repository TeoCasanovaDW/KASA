"use client";

import { useFavorites } from "@/components/favorites/FavoritesProvider";

export default function FavoriteButton({
  propertyId,
}: {
  propertyId: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(propertyId);

  // 28px badge with a 12px heart, sitting on PropertyCard's own 12px slot
  // inset (no extra margin), per the Home/Favorites mockups.
  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={() => toggleFavorite(propertyId)}
      className={`flex h-7 w-7 items-center justify-center rounded-md ${
        favorite
          ? "bg-kasa-red text-kasa-white"
          : "bg-kasa-white text-kasa-gray-dark"
      }`}
    >
      <HeartIcon />
    </button>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
