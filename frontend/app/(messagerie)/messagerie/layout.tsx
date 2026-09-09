import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// On the layout this covers both `/messagerie` and `/messagerie/[contactId]`,
// since a child that sets only `title` inherits the rest. No canonical here: it
// would be inherited by the `[contactId]` child, whose threads are private.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * Messaging opts out of the shared site chrome on desktop (D2): there the split
 * view is a full-page application surface — no page margin, no card frame, no
 * outer border or radius — pinned to the viewport with `lg:h-screen` so the two
 * panels scroll internally instead of the page. Mobile keeps the logo header
 * and the footer, as the mobile mockups draw them. No data fetching here — each
 * page owns its own, so mobile can render one panel at a time.
 */
export default function MessagerieLayout({
  children,
}: LayoutProps<"/messagerie">) {
  return (
    <>
      <div className="lg:hidden">
        <Header />
      </div>

      <main className="flex flex-1 overflow-hidden bg-kasa-white lg:h-screen">
        {children}
      </main>

      <div className="lg:hidden">
        <Footer />
      </div>
    </>
  );
}
