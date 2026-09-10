import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import PropertyGridSkeleton from "@/components/layout/PropertyGridSkeleton";
import HomeHero from "@/components/home/HomeHero";
import HowItWorks from "@/components/home/HowItWorks";
import PropertyCard from "@/components/property/PropertyCard";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { getProperties } from "@/lib/properties";
import { ApiError } from "@/lib/api-client";
import type { Property } from "@/types/property";

// No `title`: the home page keeps the root default, and setting one here would
// run it through the `%s | Kasa` template. No `openGraph` either — the root
// object already describes the site, and metadata merging is shallow, so an
// override here would drop `siteName`, `type` and `locale`.
export const metadata: Metadata = {
  description:
    "Trouvez et proposez des logements de vacances partout en France avec Kasa.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <Container className="pt-10 pb-16 md:pb-24">
      <HomeHero />
      <Suspense fallback={<PropertyGridSkeleton />}>
        <PropertyList />
      </Suspense>
      <div className="mt-10">
        <HowItWorks />
      </div>
    </Container>
  );
}

// The list is the only part of the page that waits on data, so it owns the
// Suspense boundary. Keeping that boundary inside the page rather than in a
// `loading.tsx` is what lets `/logements/[slug]` still answer a real 404:
// a boundary above that route flushes the response before `notFound()` runs.
async function PropertyList() {
  let properties: Property[] = [];
  let loadFailed = false;

  try {
    properties = await getProperties();
  } catch (error) {
    if (error instanceof ApiError) {
      loadFailed = true;
    } else {
      throw error;
    }
  }

  return (
    <>
      {loadFailed ? (
        <p className="mt-10 text-center text-kasa-gray-dark">
          Les logements n&apos;ont pas pu être chargés. Réessayez plus tard.
        </p>
      ) : properties.length === 0 ? (
        <p className="mt-10 text-center text-kasa-gray-dark">
          Aucun logement disponible pour le moment.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <li key={property.id}>
              <PropertyCard
                property={property}
                favoriteControl={<FavoriteButton propertyId={property.id} />}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
