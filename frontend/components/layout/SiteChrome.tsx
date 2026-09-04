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
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
