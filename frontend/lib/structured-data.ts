import type { PropertyDetail } from "@/types/property";

// Every node is emitted as plain JSON, so an optional key is spread in only
// when it holds a value: `null` and `undefined` must never reach the output.
type JsonLdNode = Record<string, unknown>;

const CONTEXT = "https://schema.org";
const BEST_RATING = 5;

/**
 * Resolves a stored image URL against the site origin. Seed pictures are
 * already absolute (S3), while uploaded ones are same-origin `/uploads/...`
 * paths, and structured data must carry absolute URLs either way.
 */
function toAbsoluteUrl(value: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

/** The `WebSite` node, rendered once site-wide from the root layout. */
export function buildWebSiteJsonLd(siteUrl: string): JsonLdNode {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: "Kasa",
    url: siteUrl,
    inLanguage: "fr-FR",
  };
}

/**
 * The property graph: the accommodation itself, its nightly offer and the
 * breadcrumb that places it under the home page.
 */
export function buildPropertyJsonLd(
  property: PropertyDetail,
  siteUrl: string
): JsonLdNode {
  const url = `${siteUrl}/logements/${property.slug}`;
  const accommodationId = `${url}#accommodation`;

  // Cover first, then the gallery. The backend stores the cover inside
  // `pictures` too, so a Set drops the duplicate without reordering.
  const images = [
    ...new Set(
      [property.cover, ...property.pictures]
        .filter((picture): picture is string => Boolean(picture))
        .map((picture) => toAbsoluteUrl(picture, siteUrl))
    ),
  ];

  const accommodation: JsonLdNode = {
    "@type": "Accommodation",
    "@id": accommodationId,
    name: property.title,
    url,
    ...(property.description ? { description: property.description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(property.location
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: property.location,
            addressCountry: "FR",
          },
        }
      : {}),
    ...(property.equipments.length > 0
      ? {
          amenityFeature: property.equipments.map((equipment) => ({
            "@type": "LocationFeatureSpecification",
            name: equipment,
            value: true,
          })),
        }
      : {}),
    // A rating with no reviews behind it is invalid structured data.
    ...(property.ratings_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: property.rating_avg,
            reviewCount: property.ratings_count,
            bestRating: BEST_RATING,
          },
        }
      : {}),
  };

  const offer: JsonLdNode = {
    "@type": "Offer",
    itemOffered: { "@id": accommodationId },
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    // `unitCode: "DAY"` is what makes this a nightly rate rather than a total.
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: property.price_per_night,
      priceCurrency: "EUR",
      unitCode: "DAY",
    },
  };

  const breadcrumb: JsonLdNode = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: property.title,
        item: url,
      },
    ],
  };

  return {
    "@context": CONTEXT,
    "@graph": [accommodation, offer, breadcrumb],
  };
}

/**
 * Serializes a node for a `<script type="application/ld+json">` body. Plain
 * `JSON.stringify` is not safe there: a `<` in any title or description could
 * open a tag and break out of the block. `<` is valid JSON and parses
 * back to `<`, so nothing a consumer reads changes.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
