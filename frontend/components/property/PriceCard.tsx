export default function PriceCard({
  pricePerNight,
}: {
  pricePerNight: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-kasa-white px-6 py-4 shadow-sm">
      <span className="whitespace-nowrap text-kasa-gray-dark">
        Prix par nuit
      </span>
      <span className="whitespace-nowrap font-semibold text-kasa-dark-orange">
        {pricePerNight} €
      </span>
    </div>
  );
}
