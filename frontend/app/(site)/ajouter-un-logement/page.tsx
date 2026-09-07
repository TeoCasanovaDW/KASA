import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Container from "@/components/layout/Container";
import PropertyForm from "@/components/property/PropertyForm";
import { createPropertyAction } from "@/lib/property-actions";
import { getSessionUser } from "@/lib/session";
import { getUserById } from "@/lib/users-api";

export const metadata: Metadata = {
  title: "Ajouter un logement | Kasa",
};

// The same pill as the property detail page (app/(site)/logements/[slug]/page.tsx).
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
 * The only place that reads the session: `PropertyForm` is the Client
 * Component, and `host_id` never travels through it — the action reads it from
 * the session again (D5).
 */
export default async function AjouterUnLogementPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/connexion");
  }

  if (user.role !== "owner" && user.role !== "admin") {
    return (
      <Container className="mt-20 pt-6 pb-16">
        <BackLink />
        <h1 className="mt-6 text-3xl font-bold text-kasa-black">
          Ajouter une propriété
        </h1>
        <p className="mt-6 text-kasa-gray-dark">
          Cette page est réservée aux comptes propriétaires.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-kasa-red"
        >
          Retour à l&apos;accueil
        </Link>
      </Container>
    );
  }

  // The JWT carries no picture (types/user.ts), so the avatar takes one
  // lookup. Every failure is swallowed rather than narrowed to `ApiError` as
  // elsewhere: a missing avatar must never cost the owner the whole form.
  let hostPicture: string | null = null;

  try {
    hostPicture = (await getUserById(user.id)).picture;
  } catch {
    hostPicture = null;
  }

  return (
    <Container className="mt-20 pt-6 pb-16">
      <BackLink />
      {/* No <h1> and no submit button here: PropertyForm owns that header row,
          because the button needs the form's `pending` state. */}
      <div className="mt-6">
        <PropertyForm
          action={createPropertyAction}
          hostName={user.name}
          hostPicture={hostPicture}
        />
      </div>
    </Container>
  );
}
