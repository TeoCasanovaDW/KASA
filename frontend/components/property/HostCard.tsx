import Image from "next/image";
import Link from "next/link";
import type { PropertyHost } from "@/types/property";

const PICTURE_SIZE = 80;

export default function HostCard({
  host,
  ratingAvg,
}: {
  host: PropertyHost;
  ratingAvg: number;
}) {
  return (
    <div className="rounded-2xl bg-kasa-white p-6 shadow-sm">
      <h2>Votre hôte</h2>

      <div className="mt-4 flex items-center gap-4">
        {host.picture ? (
          <Image
            src={host.picture}
            alt=""
            width={PICTURE_SIZE}
            height={PICTURE_SIZE}
            className="flex-none rounded-lg object-cover"
          />
        ) : (
          <div className="h-20 w-20 flex-none rounded-lg bg-kasa-gray-light" />
        )}

        <p>{host.name}</p>

        <p
          role="img"
          aria-label={`Note : ${ratingAvg} sur 5`}
          className="flex items-center gap-1 rounded-md bg-kasa-gray-light px-3 py-2 text-sm"
        >
          <StarIcon />
          {ratingAvg}
        </p>
      </div>

      <Link
        href="/messagerie"
        className="mt-6 block w-full rounded-xl bg-kasa-dark-orange py-3 text-center text-kasa-white"
      >
        Envoyer un message
      </Link>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-kasa-red"
    >
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" />
    </svg>
  );
}
