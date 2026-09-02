import Container from "@/components/layout/Container";

export default function Loading() {
  return (
    <Container className="pt-6 pb-16">
      <span className="sr-only">Chargement du logement…</span>
      <div aria-hidden="true">
        <div className="h-9 w-44 rounded-full motion-safe:animate-pulse bg-kasa-gray-light" />

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6 lg:items-start">
          <div>
            <div className="aspect-[6/7] w-full rounded-2xl motion-safe:animate-pulse bg-kasa-gray-light md:aspect-[16/9]" />
            <div className="mt-2 flex gap-2 overflow-hidden md:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square w-24 flex-none rounded-lg motion-safe:animate-pulse bg-kasa-gray-light"
                />
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-kasa-white p-6 shadow-sm">
              <div className="h-6 w-2/3 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="mt-3 h-4 w-1/3 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="mt-2 h-4 w-1/4 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded motion-safe:animate-pulse bg-kasa-gray-light" />
                <div className="h-4 w-full rounded motion-safe:animate-pulse bg-kasa-gray-light" />
                <div className="h-4 w-2/3 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-7 w-20 rounded-md motion-safe:animate-pulse bg-kasa-gray-light"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-kasa-white p-6 shadow-sm lg:mt-0">
            <div className="h-5 w-1/2 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
            <div className="mt-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="h-4 w-1/3 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
            </div>
            <div className="mt-6 h-11 w-full rounded-md motion-safe:animate-pulse bg-kasa-gray-light" />
          </div>
        </div>
      </div>
    </Container>
  );
}
