import Collapse from "@/components/ui/Collapse";
import type { PropertyDetail } from "@/types/property";

export default function PropertyInfo({
  property,
}: {
  property: PropertyDetail;
}) {
  return (
    <div className="rounded-2xl bg-kasa-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold">{property.title}</h1>

      {property.location && (
        <p className="mt-3 flex items-center gap-1 text-kasa-gray-dark">
          <PinIcon />
          {property.location}
        </p>
      )}

      {property.description && (
        <p className="mt-6 md:mt-8">{property.description}</p>
      )}

      {property.equipments.length > 0 && (
        <div className="mt-8 md:mt-10">
          <Collapse title="Équipements">
            <PillList items={property.equipments} />
          </Collapse>
        </div>
      )}

      {property.tags.length > 0 && (
        <div className="mt-8 md:mt-10">
          <Collapse title="Catégorie">
            <PillList items={property.tags} />
          </Collapse>
        </div>
      )}
    </div>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md bg-kasa-gray-light px-3 py-2 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 flex-none"
    >
      <path d="M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
