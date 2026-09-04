import Link from "next/link";
import Container from "@/components/layout/Container";
import SiteChrome from "@/components/layout/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
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
    </SiteChrome>
  );
}
