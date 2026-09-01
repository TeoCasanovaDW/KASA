import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/property";

export default function PropertyCard({
  property,
  favoriteControl,
}: {
  property: Property;
  favoriteControl?: React.ReactNode;
}) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg bg-kasa-white shadow-sm">
      <div className="relative aspect-[15/16] w-full">
        {property.cover ? (
          <Image
            src={property.cover}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="h-full w-full bg-kasa-gray-light" />
        )}
        {favoriteControl && (
          <div className="absolute top-3 right-3 z-10">{favoriteControl}</div>
        )}
      </div>
      <div className="flex min-h-52 flex-1 flex-col p-4">
        <h2>
          <Link
            href={`/logements/${property.slug}`}
            className="line-clamp-2 text-base after:absolute after:inset-0"
          >
            {property.title}
          </Link>
        </h2>
        {property.location && (
          <p className="mt-1 text-sm text-kasa-gray-dark">
            {property.location}
          </p>
        )}
        <div className="mt-auto pt-6">
          <span className="font-semibold text-kasa-black">
            {property.price_per_night}€
          </span>
          <span className="text-sm text-kasa-gray-dark"> par nuit</span>
        </div>
      </div>
    </article>
  );
}
