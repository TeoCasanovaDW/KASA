import NotFoundContent from "@/components/layout/NotFoundContent";
import SiteChrome from "@/components/layout/SiteChrome";

/**
 * Handles URLs that match no route at all, which render outside every route
 * group — so this boundary brings its own chrome. A `notFound()` thrown from
 * inside the `(site)` group stops at `app/(site)/not-found.tsx` instead, which
 * already sits under that group's chrome.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
