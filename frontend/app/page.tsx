import Container from "@/components/layout/Container";
import HomeHero from "@/components/home/HomeHero";
import HowItWorks from "@/components/home/HowItWorks";
import PropertyCard from "@/components/property/PropertyCard";
import { getProperties } from "@/lib/properties";
import { ApiError } from "@/lib/api-client";
import type { Property } from "@/types/property";

export default async function Home() {
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
    <Container className="pt-10 pb-16 md:pb-24">
      <HomeHero />
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
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
        <HowItWorks />
      </div>
    </Container>
  );
}
