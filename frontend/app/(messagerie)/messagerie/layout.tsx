import type { Metadata } from "next";
import Header from "@/components/layout/Header";

// On the layout this covers both `/messagerie` and `/messagerie/[contactId]`,
// since a child that sets only `title` inherits the rest. No canonical here: it
// would be inherited by the `[contactId]` child, whose threads are private.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * Messaging opts out of the shared site chrome (D2): the split view is a
 * full-page application surface — no page margin, no card frame, no outer
 * border or radius — pinned to the viewport height so the panels scroll
 * internally instead of the page, and the composer stays on screen. Mobile
 * keeps the logo header but drops the footer, which would otherwise sit below
 * a long thread. No data fetching here — each page owns its own, so mobile can
 * render one panel at a time.
 */
export default function MessagerieLayout({
  children,
}: LayoutProps<"/messagerie">) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex-none lg:hidden">
        <Header />
      </div>

      <main className="flex min-h-0 flex-1 overflow-hidden bg-kasa-white">
        {children}
      </main>
    </div>
  );
}
