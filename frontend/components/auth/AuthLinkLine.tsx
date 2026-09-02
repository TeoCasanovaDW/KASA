import Link from "next/link";

// The cross-link under each auth card. Both mockups render the whole line in
// kasa-red, with only the link half set semibold.
export default function AuthLinkLine({
  text,
  href,
  linkLabel,
}: {
  text: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-kasa-red">
      {text}{" "}
      <Link href={href} className="font-semibold">
        {linkLabel}
      </Link>
    </p>
  );
}
