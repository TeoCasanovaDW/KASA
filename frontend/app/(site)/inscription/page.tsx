import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthLinkLine from "@/components/auth/AuthLinkLine";
import RegisterForm from "@/components/auth/RegisterForm";
import { registerAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Inscription | Kasa" };

export default function InscriptionPage() {
  return (
    <AuthCard
      title="Rejoignez la communauté Kasa"
      subtitle="Créez votre compte et commencez à voyager autrement : réservez des logements uniques, découvrez de nouvelles destinations et partagez vos propres lieux avec d'autres voyageurs."
    >
      <RegisterForm action={registerAction} />

      <AuthLinkLine
        text="Déjà membre ?"
        href="/connexion"
        linkLabel="Se connecter"
      />
    </AuthCard>
  );
}
