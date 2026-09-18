import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthLinkLine from "@/components/auth/AuthLinkLine";
import RegisterForm from "@/components/auth/RegisterForm";
import { registerAction } from "@/lib/auth-actions";
import { authUrl, safeNext } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Inscription",
  alternates: { canonical: "/inscription" },
  robots: { index: false, follow: true },
};

export default async function InscriptionPage({
  searchParams,
}: PageProps<"/inscription">) {
  const next = safeNext((await searchParams).next);

  return (
    <AuthCard
      title="Rejoignez la communauté Kasa"
      subtitle="Créez votre compte et commencez à voyager autrement : réservez des logements uniques, découvrez de nouvelles destinations et partagez vos propres lieux avec d'autres voyageurs."
    >
      <RegisterForm action={registerAction} next={next} />

      <AuthLinkLine
        text="Déjà membre ?"
        href={authUrl("/connexion", next)}
        linkLabel="Se connecter"
      />
    </AuthCard>
  );
}
