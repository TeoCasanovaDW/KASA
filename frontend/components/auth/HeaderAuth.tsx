import Link from "next/link";
import UserMenu from "@/components/auth/UserMenu";
import UserIcon from "@/components/icons/UserIcon";
import { logoutAction } from "@/lib/auth-actions";
import { getSessionUser } from "@/lib/session";
import { getUserById } from "@/lib/users-api";

/**
 * Reading the session cookie here opts every route that renders the Header
 * into dynamic rendering. Accepted: the property fetches keep their own
 * `revalidate` data cache, so the API is still hit at most once a minute.
 */
export default async function HeaderAuth({
  variant,
}: {
  variant: "desktop" | "mobile";
}) {
  const user = await getSessionUser();

  // Icon only in the desktop nav, where it sits with the favorites and
  // messaging icons; the mobile panel is a list of labels, so it keeps one.
  if (!user) {
    return (
      <Link
        href="/connexion"
        aria-label="Se connecter"
        className="flex items-center gap-3"
      >
        <UserIcon className="h-5 w-5 text-kasa-red" />
        {variant === "mobile" && <span aria-hidden="true">Se connecter</span>}
      </Link>
    );
  }

  const firstName = user.name.trim().split(" ")[0];

  // The JWT carries no picture (types/user.ts), so the avatar costs one
  // lookup per header render. Every failure is swallowed, as on the
  // ajouter-un-logement page: a missing avatar must never break the header,
  // and Avatar already draws the shared fallback for a null picture.
  let picture: string | null = null;

  try {
    picture = (await getUserById(user.id)).picture;
  } catch {
    picture = null;
  }

  return (
    <UserMenu
      name={firstName}
      picture={picture}
      logoutAction={logoutAction}
      showName={variant === "mobile"}
    />
  );
}
