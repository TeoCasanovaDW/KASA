import Image from "next/image";
import homeHero from "@/public/images/home-hero.png";

export default function HomeHero() {
  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-kasa-red md:text-[32px]">
        Chez vous, partout et ailleurs
      </h1>
      <p className="mt-4 text-center">
        Avec Kasa, vivez des séjours uniques dans des hébergements chaleureux,
        sélectionnés avec soin par nos hôtes.
      </p>
      <div className="relative mt-6 aspect-[5/6] overflow-hidden rounded-3xl md:aspect-[12/5]">
        <Image
          src={homeHero}
          alt="Maison en bois sombre au milieu des hautes herbes"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 1152px, 100vw"
          preload
        />
      </div>
    </div>
  );
}
