import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import SiteChrome from "@/components/layout/SiteChrome";
import { toggleFavoriteAction } from "@/lib/favorites-actions";
import { getFavorites } from "@/lib/favorites-api";
import { getSessionUser } from "@/lib/session";
import type { Property } from "@/types/property";

/**
 * The favorites provider sits here rather than in the root layout: every
 * rendered route is already dynamic (`HeaderAuth` reads the session cookie),
 * so nothing is lost, while `/messagerie` — which renders no favorites UI —
 * no longer pays for an authenticated favorites request per render.
 *
 * `app/not-found.tsx` renders `SiteChrome` from outside this group, so it
 * sits outside the provider. Do not add a favorites control there.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  let favoriteIds: Property["id"][] = [];

  if (user) {
    // Swallowed like the avatar lookup in `ajouter-un-logement/page.tsx`: a
    // failed favorites fetch degrades to an empty list rather than costing
    // the visitor the whole page.
    try {
      favoriteIds = (await getFavorites(user.id)).map(
        (property) => property.id
      );
    } catch {
      favoriteIds = [];
    }
  }

  return (
    <SiteChrome>
      {/* Login and logout both `redirect("/")` from a Server Action, which is a
          soft navigation: this layout re-renders with new props, but the
          client provider below would be reconciled in place and keep the
          previous visitor's state. Keying it on the favorites identity
          remounts it instead, so the state re-seeds from the right source —
          guest storage, or this account's list. */}
      <FavoritesProvider
        key={user ? `user:${user.id}` : "guest"}
        signedIn={user !== null}
        initialFavoriteIds={favoriteIds}
        toggleAction={toggleFavoriteAction}
      >
        {children}
      </FavoritesProvider>
    </SiteChrome>
  );
}
