import Link from "next/link";
import Container from "@/components/layout/Container";
import Logo from "@/components/layout/Logo";
import MobileNav from "@/components/layout/MobileNav";

export default function Header() {
  return (
    <header>
      <Container className="pt-4">
        <nav
          aria-label="Navigation principale"
          className="hidden items-center justify-between rounded-full bg-kasa-white px-6 py-3 md:flex"
        >
          <div className="flex items-center gap-6 text-sm">
            <Link href="/">Accueil</Link>
            <Link href="/a-propos">À propos</Link>
          </div>

          <Logo variant="full" />

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/ajouter-un-logement"
              className="font-semibold text-kasa-red"
            >
              +Ajouter un logement
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/favoris" aria-label="Favoris">
                <HeartIcon />
              </Link>
              <span aria-hidden className="h-4 w-px bg-kasa-black/20" />
              <Link href="/messagerie" aria-label="Messagerie">
                <MessageIcon />
              </Link>
            </div>

            <Link href="/connexion">Se connecter</Link>
          </div>
        </nav>

        <div className="flex items-center justify-between py-4 md:hidden">
          <Logo variant="icon" />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-kasa-black"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-kasa-black"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
