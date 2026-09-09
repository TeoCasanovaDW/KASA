import { describe, expect, it } from "vitest";
import type { PropertyDetail } from "@/types/property";
import {
  buildPropertyJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "./structured-data";

const SITE_URL = "https://kasa.test";

type JsonLdNode = Record<string, unknown>;

function makeProperty(overrides: Partial<PropertyDetail> = {}): PropertyDetail {
  return {
    id: "1",
    slug: "villa-bord-de-mer",
    title: "Villa bord de mer",
    description: "Une villa lumineuse à deux pas de la plage.",
    cover: "https://s3-eu-west-1.amazonaws.com/kasa/cover.jpg",
    location: "Biarritz",
    price_per_night: 120,
    rating_avg: 4.5,
    ratings_count: 12,
    pictures: [
      "https://s3-eu-west-1.amazonaws.com/kasa/cover.jpg",
      "/uploads/salon.jpg",
    ],
    equipments: ["Wifi", "Cuisine équipée"],
    tags: ["Bord de mer"],
    ...overrides,
  };
}

function graphOf(property: PropertyDetail): JsonLdNode[] {
  return buildPropertyJsonLd(property, SITE_URL)["@graph"] as JsonLdNode[];
}

describe("buildWebSiteJsonLd", () => {
  it("describes the site with its origin and language", () => {
    expect(buildWebSiteJsonLd(SITE_URL)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Kasa",
      url: SITE_URL,
      inLanguage: "fr-FR",
    });
  });
});

describe("buildPropertyJsonLd", () => {
  it("emits the accommodation, offer and breadcrumb nodes", () => {
    const graph = graphOf(makeProperty());

    expect(graph.map((node) => node["@type"])).toEqual([
      "Accommodation",
      "Offer",
      "BreadcrumbList",
    ]);
  });

  it("makes every image absolute, cover first and without duplicates", () => {
    const [accommodation] = graphOf(makeProperty());

    expect(accommodation.image).toEqual([
      "https://s3-eu-west-1.amazonaws.com/kasa/cover.jpg",
      `${SITE_URL}/uploads/salon.jpg`,
    ]);
  });

  it("describes the accommodation with its address and amenities", () => {
    const [accommodation] = graphOf(makeProperty());

    expect(accommodation).toMatchObject({
      "@id": `${SITE_URL}/logements/villa-bord-de-mer#accommodation`,
      name: "Villa bord de mer",
      url: `${SITE_URL}/logements/villa-bord-de-mer`,
      description: "Une villa lumineuse à deux pas de la plage.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Biarritz",
        addressCountry: "FR",
      },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Wifi", value: true },
        {
          "@type": "LocationFeatureSpecification",
          name: "Cuisine équipée",
          value: true,
        },
      ],
    });
  });

  it("emits the rating when the property has reviews", () => {
    const [accommodation] = graphOf(makeProperty());

    expect(accommodation.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 12,
      bestRating: 5,
    });
  });

  it("omits the rating when the property has no reviews", () => {
    const [accommodation] = graphOf(makeProperty({ ratings_count: 0 }));

    expect(accommodation).not.toHaveProperty("aggregateRating");
  });

  it("omits the keys whose source field is null or empty", () => {
    const [accommodation] = graphOf(
      makeProperty({
        cover: null,
        description: null,
        location: null,
        pictures: [],
        equipments: [],
      })
    );

    expect(accommodation).not.toHaveProperty("image");
    expect(accommodation).not.toHaveProperty("description");
    expect(accommodation).not.toHaveProperty("address");
    expect(accommodation).not.toHaveProperty("amenityFeature");
  });

  it("prices the offer per night and points it at the accommodation", () => {
    const [, offer] = graphOf(makeProperty());

    expect(offer).toEqual({
      "@type": "Offer",
      itemOffered: {
        "@id": `${SITE_URL}/logements/villa-bord-de-mer#accommodation`,
      },
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 120,
        priceCurrency: "EUR",
        unitCode: "DAY",
      },
    });
  });

  it("builds a two-level breadcrumb from the home page", () => {
    const [, , breadcrumb] = graphOf(makeProperty());

    expect(breadcrumb.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Villa bord de mer",
        item: `${SITE_URL}/logements/villa-bord-de-mer`,
      },
    ]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes every `<` so the payload cannot break out of the script tag", () => {
    const serialized = serializeJsonLd({ t: "<script>" });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c");
  });

  it("keeps the escaped value readable by a JSON consumer", () => {
    const serialized = serializeJsonLd({ t: "<script>" });

    expect(JSON.parse(serialized)).toEqual({ t: "<script>" });
  });
});
