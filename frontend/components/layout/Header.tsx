import Link from "next/link";
import HeaderAuth from "@/components/auth/HeaderAuth";
import Container from "@/components/layout/Container";
import Logo from "@/components/layout/Logo";
import MobileNav from "@/components/layout/MobileNav";

export default function Header() {
  return (
    <header>
      <Container className="pt-4 md:pt-10">
        <nav
          aria-label="Navigation principale"
          className="mx-auto hidden w-full max-w-3xl items-center justify-between rounded-lg bg-kasa-white px-8 py-3 md:flex"
        >
          <div className="flex items-center gap-4 text-sm">
            <Link href="/">Accueil</Link>
            <Link href="/a-propos">À propos</Link>
          </div>

          <Logo variant="full" />

          <div className="flex items-center gap-4 text-sm">
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
              <span
                aria-hidden="true"
                className="h-2 w-0.5 bg-kasa-red"
              />
              <Link href="/messagerie" aria-label="Messagerie">
                <MessageIcon />
              </Link>
            </div>

            <HeaderAuth variant="desktop" />
          </div>
        </nav>

        <div className="flex items-center justify-between py-4 md:hidden">
          <Logo variant="icon" />
          <MobileNav authSlot={<HeaderAuth variant="mobile" />} />
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
      className="h-5 w-5 text-kasa-red"
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
      className="h-5 w-5 text-kasa-red"
    >
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}
