import Link from "next/link";
import Container from "@/components/layout/Container";

/**
 * The 404 body, without any chrome of its own. Both not-found boundaries
 * render it: the root one wraps it in `SiteChrome` for URLs that match no
 * route at all, while `app/(site)/not-found.tsx` inherits the chrome from the
 * `(site)` layout. Keeping the markup here is what stops the two of them from
 * drifting apart.
 */
export default function NotFoundContent() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="text-7xl font-extrabold text-kasa-dark-orange md:text-[104px]">
        404
      </h1>
      <p className="mt-8">
        Il semble que la page que vous cherchez ait pris des vacances... ou
        n&apos;ait jamais existé.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-kasa-dark-orange px-8 py-3 font-semibold text-kasa-white"
      >
        Retour à l&apos;accueil
      </Link>
    </Container>
  );
}
