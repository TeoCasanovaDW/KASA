/**
 * Renders inside the messaging layout, so it inherits the split-view frame and
 * only fills in the two panels. Mirrors the panel widths the pages use: the
 * list is full-width below `lg`, a fixed left column at `lg` and above.
 */
export default function Loading() {
  return (
    <>
      <span className="sr-only">Chargement de la messagerie…</span>

      <div
        aria-hidden="true"
        className="flex w-full flex-col border-kasa-gray-light p-6 lg:w-[370px] lg:flex-none lg:border-r"
      >
        <div className="h-9 w-28 rounded-full motion-safe:animate-pulse bg-kasa-gray-light" />
        <div className="mt-8 h-8 w-44 rounded motion-safe:animate-pulse bg-kasa-gray-light" />

        <div className="mt-8 space-y-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-11 w-11 flex-none rounded-md motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="flex-1">
                <div className="h-4 w-1/3 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
                <div className="mt-2 h-3 w-2/3 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden flex-1 flex-col bg-kasa-light-orange lg:flex"
      >
        <div className="flex-1 space-y-6 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={
                index % 2 === 1
                  ? "flex flex-col items-end"
                  : "flex flex-col items-start"
              }
            >
              <div className="h-3 w-32 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="mt-2 h-16 w-full max-w-sm rounded-2xl motion-safe:animate-pulse bg-kasa-gray-light" />
            </div>
          ))}
        </div>

        <div className="border-t border-kasa-gray-light bg-kasa-white p-6">
          <div className="h-24 w-full rounded-xl motion-safe:animate-pulse bg-kasa-gray-light" />
        </div>
      </div>
    </>
  );
}
