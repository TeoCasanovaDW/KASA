import NotFoundContent from "@/components/layout/NotFoundContent";

/**
 * Catches `notFound()` from any `(site)` route — a missing `/logements/[slug]`,
 * above all. No `SiteChrome` here: this renders inside `app/(site)/layout.tsx`,
 * which already provides the Header and Footer. Wrapping it again is what put
 * two of each on the page.
 */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
