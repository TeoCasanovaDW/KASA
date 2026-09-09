import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * The shared site chrome, exactly as the root layout used to render it.
 * Lives in a component so both the `(site)` route group and the root
 * `not-found.tsx` can opt into it, while `/messagerie` opts out.
 */
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-kasa-white focus:px-4 focus:py-2 focus:text-kasa-black"
      >
        Aller au contenu principal
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
