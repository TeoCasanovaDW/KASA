import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthLinkLine from "@/components/auth/AuthLinkLine";
import LoginForm from "@/components/auth/LoginForm";
import { loginAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Connexion | Kasa" };

export default function ConnexionPage() {
  return (
    <AuthCard
      title="Heureux de vous revoir"
      subtitle="Connectez-vous pour retrouver vos réservations, vos annonces et tout ce qui rend vos séjours uniques."
    >
      <LoginForm action={loginAction} />

      <AuthLinkLine
        text="Pas encore de compte ?"
        href="/inscription"
        linkLabel="Inscrivez-vous"
      />
    </AuthCard>
  );
}
