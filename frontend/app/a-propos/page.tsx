import type { Metadata } from "next";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "À propos",
};

export default function AProposPage() {
  return (
    <Container className="pt-10 pb-2">
      <h1 className="text-center text-2xl font-bold text-kasa-red md:text-[32px]">
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

      {/* eslint-disable-next-line @next/next/no-img-element -- plain <img>: next/image setup is out of scope until 04-home-properties.md */}
      <img
        src="/images/about_01.png"
        alt="Maison en bois entourée d'arbres"
        className="mt-11 w-full rounded-xl object-cover"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 md:items-center md:gap-8">
        <div>
          <h2 className="font-bold text-kasa-red">
            Notre mission est simple :
          </h2>
          <ol className="mt-4 flex flex-col gap-3">
            <li>1. Offrir une plateforme fiable et simple d&apos;utilisation</li>
            <li>2. Proposer des hébergements variés et de qualité</li>
            <li>
              3. Favoriser des échanges humains et chaleureux entre hôtes et
              voyageurs
            </li>
          </ol>
          <p className="mt-6 font-semibold text-kasa-red">
            Que vous cherchiez un appartement cosy en centre-ville, une maison
            en bord de mer ou un chalet à la montagne, Kasa vous accompagne
            pour que chaque séjour devienne un souvenir inoubliable.
          </p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- plain <img>: next/image setup is out of scope until 04-home-properties.md */}
        <img
          src="/images/about_02.png"
          alt="Chalet en bois avec une grande baie vitrée"
          className="w-full rounded-xl object-cover"
        />
      </div>
    </Container>
  );
}
