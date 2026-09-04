import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kasa",
  description: "Plateforme de location de logements",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FavoritesProvider>{children}</FavoritesProvider>
      </body>
    </html>
  );
}
