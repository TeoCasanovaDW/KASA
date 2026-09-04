import Container from "@/components/layout/Container";

export default function Loading() {
  return (
    <Container className="pt-10">
      <span className="sr-only">Chargement des logements…</span>
      <ul
        aria-hidden="true"
        className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            key={index}
            className="flex flex-col overflow-hidden rounded-lg bg-kasa-white shadow-sm"
          >
            <div className="aspect-[15/16] w-full motion-safe:animate-pulse bg-kasa-gray-light" />
            <div className="flex flex-1 flex-col p-4">
              <div className="h-4 w-3/4 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              <div className="mt-auto pt-6">
                <div className="h-4 w-1/2 rounded motion-safe:animate-pulse bg-kasa-gray-light" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
