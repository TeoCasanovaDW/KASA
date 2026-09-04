import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * Messaging opts out of the shared site chrome on desktop (D2): the mockups
 * give the split view the whole viewport there, while the mobile mockups keep
 * the logo header and the footer. No data fetching here — each page owns its
 * own, so mobile can render one panel at a time.
 */
export default function MessagerieLayout({
  children,
}: LayoutProps<"/messagerie">) {
  return (
    <>
      <div className="lg:hidden">
        <Header />
      </div>

      <main className="flex flex-1 flex-col bg-kasa-light-orange lg:h-screen lg:p-6">
        <div className="flex flex-1 overflow-hidden bg-kasa-white lg:rounded-2xl lg:shadow-sm">
          {children}
        </div>
      </main>

      <div className="lg:hidden">
        <Footer />
      </div>
    </>
  );
}
