import Container from "@/components/layout/Container";
import FavoritesGrid from "@/components/favorites/FavoritesGrid";
import { getProperties } from "@/lib/properties";
import { ApiError } from "@/lib/api-client";
import type { Property } from "@/types/property";

export default async function FavorisPage() {
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
    <div className="pt-16 pb-20 md:pt-20 md:pb-28">
      <Container>
        <h1 className="text-center text-2xl font-bold text-kasa-red md:text-[32px]">
          Vos favoris
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-center">
          Retrouvez ici tous les logements que vous avez aimés. Prêts à
          réserver ? Un simple clic et votre prochain séjour est en route.
        </p>
      </Container>
      {/* The grid gets its own, wider wrapper than Container so the cards
          reach the mockup's proportions without touching Container itself. */}
      <div className="mx-auto w-full max-w-[87.5rem] px-4 md:px-8">
        {loadFailed ? (
          <p className="mt-12 text-center text-kasa-gray-dark md:mt-16">
            Les logements n&apos;ont pas pu être chargés. Réessayez plus tard.
          </p>
        ) : (
          <FavoritesGrid properties={properties} />
        )}
      </div>
    </div>
  );
}
