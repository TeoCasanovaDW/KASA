import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/layout/Container";
import about01 from "@/public/images/about_01.png";
import about02 from "@/public/images/about_02.png";

export const metadata: Metadata = {
  title: "À propos",
  alternates: { canonical: "/a-propos" },
};

export default function AProposPage() {
  return (
    <Container className="pt-10 pb-28 md:pb-10">
      <h1 className="text-center text-4xl font-bold text-kasa-red">
        À propos
      </h1>

      <p className="mt-4 text-center">
        Chez Kasa, nous croyons que chaque voyage mérite un lieu unique où se
        sentir bien.
      </p>
      <p className="mt-7 text-center">
        Depuis notre création, nous mettons en relation des voyageurs en
        quête d&apos;authenticité avec des hôtes passionnés qui aiment
        partager leur région et leurs bonnes adresses.
      </p>

      <Image
        src={about01}
        alt="Maison en bois entourée d'arbres"
        className="mx-auto mt-11 aspect-[3/4] h-auto w-[calc(100%-1rem)] rounded-2xl object-cover md:aspect-auto md:w-full"
      />

      {/* Mobile stacks list, image, closing text; desktop puts the image in
          its own column beside the list and the closing text. */}
      <div className="mt-12 grid gap-4 md:mt-10 md:grid-cols-2 md:items-center md:gap-x-8 md:gap-y-6">
        <div className="md:col-start-1 md:row-start-1 md:self-end">
          <h2 className="text-lg font-bold text-kasa-red">
            Notre mission est simple :
          </h2>
          <ol className="mt-4 flex flex-col gap-5">
            <li>1. Offrir une plateforme fiable et simple d&apos;utilisation</li>
            <li>2. Proposer des hébergements variés et de qualité</li>
            <li>
              3. Favoriser des échanges humains et chaleureux entre hôtes et
              voyageurs
            </li>
          </ol>
        </div>

        <Image
          src={about02}
          alt="Chalet en bois avec une grande baie vitrée"
          className="aspect-[4/5] h-auto w-full rounded-2xl object-cover md:col-start-2 md:row-span-2 md:row-start-1 md:aspect-auto"
        />

        <p className="text-lg font-medium text-kasa-red md:col-start-1 md:row-start-2 md:self-start">
          Que vous cherchiez un appartement cosy en centre-ville, une maison en
          bord de mer ou un chalet à la montagne, Kasa vous accompagne pour que
          chaque séjour devienne un souvenir inoubliable.
        </p>
      </div>
    </Container>
  );
}
