"use client";

import { useFavorites } from "@/components/favorites/FavoritesProvider";
import type { Property } from "@/types/property";

type Size = "sm" | "lg";

// `sm` is the 28px badge with a 12px heart, sitting on PropertyCard's own 12px
// slot inset (no extra margin), per the Home/Favorites mockups. `lg` is the
// same badge scaled up for the detail page, where it sits next to the title
// instead of over the cover image — hence the gray surface when un-favorited,
// which a white badge could not provide on the card's white background.
const SIZES: Record<Size, { badge: string; heart: string; idle: string }> = {
  sm: {
    badge: "h-7 w-7 rounded-md",
    heart: "h-3 w-3",
    idle: "bg-kasa-white text-kasa-gray-dark",
  },
  lg: {
    badge: "h-10 w-10 rounded-lg",
    heart: "h-5 w-5",
    idle: "bg-kasa-gray-light text-kasa-gray-dark",
  },
};

export default function FavoriteButton({
  propertyId,
  size = "sm",
}: {
  propertyId: Property["id"];
  size?: Size;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(propertyId);
  const styles = SIZES[size];

  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={() => toggleFavorite(propertyId)}
      className={`flex flex-none items-center justify-center ${styles.badge} ${
        favorite ? "bg-kasa-red text-kasa-white" : styles.idle
      }`}
    >
      <HeartIcon className={styles.heart} />
    </button>
  );
}

function HeartIcon({ className }: { className: string }) {
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
      className={className}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
