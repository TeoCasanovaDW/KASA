import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

// No `disallow` list. The personal routes are kept out of search by T2's
// `noindex` meta tag, and the two mechanisms are mutually exclusive: a
// disallowed URL is never fetched, so the crawler never reads the `noindex`
// and the URL can still be listed from an inbound link. Blocking them here
// would defeat T2 rather than reinforce it. The routes stay out of the
// sitemap regardless, which is the passive half of the same policy.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
