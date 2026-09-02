import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";
import { getSessionUser } from "@/lib/session";

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

  // Exactly the markup the two navs carried before this component existed, so
  // the logged-out header stays pixel-identical.
  if (!user) {
    return <Link href="/connexion">Se connecter</Link>;
  }

  // Plain text, not a link: no profile page exists to point it at.
  const firstName = user.name.trim().split(" ")[0];

  return (
    <div
      className={
        variant === "desktop"
          ? "flex items-center gap-3"
          : "flex flex-col gap-6"
      }
    >
      <span>{firstName}</span>
      <form action={logoutAction}>
        <button type="submit" className="cursor-pointer">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
