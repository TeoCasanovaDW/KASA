"use client";

import PropertyCard from "@/components/property/PropertyCard";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import type { Property } from "@/types/property";

export default function FavoritesGrid({
  properties,
}: {
  properties: Property[];
}) {
  const { favoriteIds, hydrated } = useFavorites();

  if (!hydrated) {
    return null;
  }

  const favorites = properties.filter((property) =>
    favoriteIds.includes(property.id)
  );

  if (favorites.length === 0) {
    return (
      <p className="mt-12 text-center text-kasa-gray-dark md:mt-16">
        Vous n&apos;avez pas encore de favoris.
      </p>
    );
  }

  // Flex-wrap rather than a grid: explicit 1/2/3-column widths cap the row at
  // three cards however wide the wrapper gets, and `justify-center` centres a
  // partial row so 1-2 favorites sit naturally instead of stretching.
  return (
    <ul className="mt-12 flex flex-wrap justify-start gap-6 md:mt-16">
      {favorites.map((property) => (
        <li
          key={property.id}
          className="w-full md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]"
        >
          <PropertyCard
            property={property}
            favoriteControl={<FavoriteButton propertyId={property.id} />}
          />
        </li>
      ))}
    </ul>
  );
}
