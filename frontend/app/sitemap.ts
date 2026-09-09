import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/properties";
import { ApiError } from "@/lib/api-client";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/a-propos`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let properties;

  try {
    properties = await getProperties();
  } catch (error) {
    if (error instanceof ApiError) {
      return staticEntries;
    }
    throw error;
  }

  // No `lastModified`: the API exposes no update timestamp, and inventing
  // one is worse than omitting it.
  const propertyEntries: MetadataRoute.Sitemap = properties.map(
    (property) => ({
      url: `${siteUrl}/logements/${property.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticEntries, ...propertyEntries];
}
