"use client";

import Image from "next/image";
import { useState } from "react";
import CarouselOverlay from "@/components/property/CarouselOverlay";

const MAX_DESKTOP_TILES = 5;

/**
 * Desktop grid is 4 cols x 2 rows. The first tile is always 2x2. The
 * remaining 1-4 "small" tiles fill the leftover 2x2 area (cols 3-4) with no
 * empty cells: a lone tile fills the whole area, two sit side by side, and
 * three use one tall tile plus two stacked ones.
 */
function smallTileClassName(smallCount: number, position: number): string {
  if (smallCount === 1) return "col-span-2 row-span-2";
  if (smallCount === 2) return "row-span-2";
  if (smallCount === 3 && position === 0) return "row-span-2";
  return "";
}

export default function PropertyGallery({
  pictures,
  cover,
  title,
}: {
  pictures: string[];
  cover: string | null;
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const displayed = pictures.length > 0 ? pictures : cover ? [cover] : [];

  if (displayed.length === 0) {
    return (
      <div className="aspect-[16/9] w-full rounded-2xl bg-kasa-gray-light" />
    );
  }

  const desktopTiles = displayed.slice(0, MAX_DESKTOP_TILES);
  const smallCount = desktopTiles.length - 1;
  const overflowCount = displayed.length - MAX_DESKTOP_TILES;

  return (
    <div>
      {/* Desktop: 4x2 grid, first tile spans 2x2. */}
      <div className="hidden aspect-[16/9] grid-cols-4 grid-rows-2 gap-2 md:grid">
        {desktopTiles.map((picture, index) => {
          const isFirst = index === 0;
          const isLastSmallTile = index === desktopTiles.length - 1;
          const showBadge =
            !isFirst &&
            isLastSmallTile &&
            desktopTiles.length === MAX_DESKTOP_TILES &&
            overflowCount > 0;

          return (
            <button
              key={picture + index}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Ouvrir la photo ${index + 1} sur ${displayed.length}`}
              className={`relative cursor-pointer overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red ${
                isFirst
                  ? `row-span-2 ${smallCount === 0 ? "col-span-4" : "col-span-2"}`
                  : smallTileClassName(smallCount, index - 1)
              }`}
            >
              <Image
                src={picture}
                alt=""
                fill
                className="object-cover"
                sizes={isFirst ? "50vw" : "25vw"}
              />
              {showBadge && (
                <span className="absolute right-2 bottom-2 rounded-md bg-kasa-black/60 px-2 py-1 text-sm text-kasa-white">
                  +{overflowCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: one large tile, then a horizontally scrollable thumbnail strip. */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          aria-label={`Ouvrir la photo 1 sur ${displayed.length}`}
          className="relative aspect-[6/7] w-full cursor-pointer overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
        >
          <Image
            src={displayed[0]}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </button>

        {displayed.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {displayed.slice(1).map((picture, index) => {
              const realIndex = index + 1;
              return (
                <button
                  key={picture + realIndex}
                  type="button"
                  onClick={() => setOpenIndex(realIndex)}
                  aria-label={`Ouvrir la photo ${realIndex + 1} sur ${displayed.length}`}
                  className="relative aspect-square w-24 flex-none cursor-pointer overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
                >
                  <Image
                    src={picture}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {openIndex !== null && (
        <CarouselOverlay
          pictures={displayed}
          startIndex={openIndex}
          title={title}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
