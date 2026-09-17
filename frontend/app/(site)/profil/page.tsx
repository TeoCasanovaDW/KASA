import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileAvatarForm from "@/components/auth/ProfileAvatarForm";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Avatar from "@/components/ui/Avatar";
import { updateAvatarAction } from "@/lib/user-actions";
import { getSessionUser } from "@/lib/session";
import { getUserById } from "@/lib/users-api";
import type { UserRole } from "@/types/user";

export const metadata: Metadata = {
  title: "Mon profil",
  alternates: { canonical: "/profil" },
  robots: { index: false, follow: true },
};

const AVATAR_SIZE = 96;

// A name registered as a single word leaves no nom, and the JWT type allows a
// null email; no row is ever dropped, so both fall back to a dash.
const EMPTY = "—";

const ROLE_LABELS: Record<UserRole, string> = {
  client: "Client",
  owner: "Propriétaire",
  admin: "Administrateur",
};

// The same pill as the property detail page, reused verbatim from
// ajouter-un-logement/page.tsx.
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

/**
 * Registration posts `nom` and `prenom` separately, then joins them as
 * `${prenom} ${nom}` (lib/auth-actions.ts) — the API stores that one string.
 * Splitting on the first space gives the two rows back in the inscription
 * form's own terms; everything after it stays with the nom, which may itself
 * contain spaces.
 */
function splitName(name: string): { nom: string; prenom: string } {
  const [prenom = "", ...rest] = name.trim().split(/\s+/);

  return { nom: rest.join(" "), prenom };
}

/** Read-only: this page edits nothing but the avatar. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-kasa-black">{label}</p>
      <p className="mt-1 text-sm text-kasa-gray-dark">{value}</p>
    </div>
  );
}

export default async function ProfilPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/connexion");
  }

  // Name, email and role come from the session, which always carries all
  // three, so no row below depends on the API. The JWT carries no picture
  // (types/user.ts): that one lookup is the only reason to call the API, and
  // every failure is swallowed as in HeaderAuth — a missing avatar must never
  // cost the user the page.
  let picture: string | null = null;

  try {
    picture = (await getUserById(user.id)).picture;
  } catch {
    picture = null;
  }

  // Same order as the inscription form: nom, then prénom.
  const { nom, prenom } = splitName(user.name);

  // The page wrapper is wider than Container, like the grid wrappers on
  // /favoris and /mes-annonces, so the cards reach the same width there.
  return (
    <div className="mx-auto w-full max-w-[87.5rem] px-4 pt-6 pb-16 md:px-8">
      <BackLink />
      <h1 className="mt-6 text-3xl font-bold text-kasa-black">Mon profil</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
          <InfoRow label="Nom" value={nom || EMPTY} />
          <InfoRow label="Prénom" value={prenom || EMPTY} />
          <InfoRow label="Email" value={user.email ?? EMPTY} />
          <InfoRow label="Rôle" value={ROLE_LABELS[user.role]} />
        </div>

        <div className="rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-semibold text-kasa-black">Photo de profil</p>
          <div className="mt-1.5">
            <Avatar src={picture} size={AVATAR_SIZE} rounded="rounded-full" />
          </div>
          <div className="mt-5">
            <ProfileAvatarForm action={updateAvatarAction} />
          </div>
        </div>
      </div>
    </div>
  );
}
