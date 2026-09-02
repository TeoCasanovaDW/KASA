import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { ApiError } from "@/lib/api-client";
import { getPropertyBySlug } from "@/lib/properties";
import type { PropertyDetail } from "@/types/property";

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-block rounded-full bg-kasa-gray-light px-4 py-2 text-sm"
    >
      ← Retour aux annonces
    </Link>
  );
}

export default async function PropertyPage({
  params,
}: PageProps<"/logements/[slug]">) {
  const { slug } = await params;

  let property: PropertyDetail | null = null;
  let loadFailed = false;

  try {
    property = await getPropertyBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError) {
      loadFailed = true;
    } else {
      throw error;
    }
  }

  if (loadFailed) {
    return (
      <Container className="pt-6 pb-16">
        <BackLink />
        <p className="mt-10 text-center text-kasa-gray-dark">
          Ce logement n&apos;a pas pu être chargé. Réessayez plus tard.
        </p>
      </Container>
    );
  }

  // Outside the try block: notFound() throws a control-flow error that the
  // catch above would otherwise swallow.
  if (!property) {
    notFound();
  }

  return (
    <Container className="pt-6 pb-16">
      <h1>{property.title}</h1>
    </Container>
  );
}
