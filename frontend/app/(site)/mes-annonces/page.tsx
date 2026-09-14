import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Container from "@/components/layout/Container";
import PropertyCard from "@/components/property/PropertyCard";
import { getProperties } from "@/lib/properties";
import { ApiError } from "@/lib/api-client";
import { getSessionUser } from "@/lib/session";
import type { Property } from "@/types/property";

export const metadata: Metadata = {
  title: "Mes annonces",
  alternates: { canonical: "/mes-annonces" },
  robots: { index: false, follow: true },
};

// The same pill as the property detail page (app/(site)/logements/[slug]/page.tsx),
// reused verbatim from ajouter-un-logement/page.tsx.
function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-md bg-kasa-gray-light px-3 py-1.5 text-sm text-kasa-gray-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
    >
      <ArrowLeftIcon />
      Retour aux annonces
    </Link>
  );
}

// The same red pill MobileNav uses for "Ajouter un logement".
function AddPropertyLink() {
  return (
    <Link
      href="/ajouter-un-logement"
      className="inline-block rounded-full bg-kasa-red px-4 py-3 text-center text-kasa-white"
    >
      Ajouter un logement
    </Link>
  );
}

export default async function MesAnnoncesPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/connexion");
  }

  if (user.role !== "owner" && user.role !== "admin") {
    return (
      <Container className="mt-20 pt-6 pb-16">
        <BackLink />
        <h1 className="mt-6 text-3xl font-bold text-kasa-black">
          Mes annonces
        </h1>
        <p className="mt-6 text-kasa-gray-dark">
          Cette page est réservée aux comptes propriétaires.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-kasa-red"
        >
          Retour à l&apos;accueil
        </Link>
      </Container>
    );
  }

  let properties: Property[] = [];
  let loadFailed = false;

  try {
    properties = (await getProperties()).filter(
      (property) => property.host?.id === user.id
    );
  } catch (error) {
    if (error instanceof ApiError) {
      loadFailed = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="mt-20 pt-6 pb-16">
      <Container>
        <BackLink />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-kasa-black">Mes annonces</h1>
          <AddPropertyLink />
        </div>
      </Container>

      {/* Wider than Container, like the grid wrapper on /favoris, so the
          cards reach the same width there. */}
      <div className="mx-auto w-full max-w-[87.5rem] px-4 md:px-8">
        {loadFailed ? (
          <p className="mt-10 text-center text-kasa-gray-dark">
            Les logements n&apos;ont pas pu être chargés. Réessayez plus tard.
          </p>
        ) : properties.length === 0 ? (
          <p className="mt-10 text-center text-kasa-gray-dark">
            Vous n&apos;avez pas encore publié de logement.
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
      </div>
    </div>
  );
}
