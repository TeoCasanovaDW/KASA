import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import { getSiteUrl } from "@/lib/env";
import { buildWebSiteJsonLd, serializeJsonLd } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = "Kasa — Location de logements entre particuliers";
const description =
  "Trouvez et proposez des logements de vacances partout en France avec Kasa.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: "%s | Kasa",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Kasa",
    locale: "fr_FR",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildWebSiteJsonLd(getSiteUrl())),
          }}
        />
        <FavoritesProvider>{children}</FavoritesProvider>
      </body>
    </html>
  );
}
