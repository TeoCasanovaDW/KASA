import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import HostCard from "@/components/property/HostCard";
import PriceCard from "@/components/property/PriceCard";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyInfo from "@/components/property/PropertyInfo";
import { ApiError } from "@/lib/api-client";
import { getPropertyBySlug } from "@/lib/properties";
import type { PropertyDetail } from "@/types/property";

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

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 flex-none"
    >
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </svg>
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
      <Container className="mt-20 pt-6 pb-16">
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

  const host = property.host;

  return (
    <Container className="mt-20 pt-6 pb-16">
      <BackLink />

      <div
        className={`mt-6 ${
          host
            ? "lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-6"
            : ""
        }`}
      >
        <div>
          <PropertyGallery
            pictures={property.pictures}
            cover={property.cover}
            title={property.title}
          />
          <div className="mt-6">
            <PropertyInfo property={property} />
          </div>
        </div>

        <div className="mt-6 space-y-4 lg:mt-0">
          {host && <HostCard host={host} ratingAvg={property.rating_avg} />}
          <PriceCard pricePerNight={property.price_per_night} />
        </div>
      </div>
    </Container>
  );
}
