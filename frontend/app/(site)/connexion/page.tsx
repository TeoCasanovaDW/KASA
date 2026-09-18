import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthLinkLine from "@/components/auth/AuthLinkLine";
import LoginForm from "@/components/auth/LoginForm";
import { loginAction } from "@/lib/auth-actions";
import { authUrl, safeNext } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Connexion",
  alternates: { canonical: "/connexion" },
  robots: { index: false, follow: true },
};

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  // Validated once here so both the form and the cross-link carry a URL that
  // is already known to be same-origin; the action checks it again anyway.
  const next = safeNext((await searchParams).next);

  return (
    <AuthCard
      title="Heureux de vous revoir"
      subtitle="Connectez-vous pour retrouver vos réservations, vos annonces et tout ce qui rend vos séjours uniques."
    >
      <LoginForm action={loginAction} next={next} />

      <AuthLinkLine
        text="Pas encore de compte ?"
        href={authUrl("/inscription", next)}
        linkLabel="Inscrivez-vous"
      />
    </AuthCard>
  );
}
