import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import logoMobile from "@/public/images/logo-mobile.png";

export default function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "icon";
  className?: string;
}) {
  const isFull = variant === "full";

  return (
    <Link href="/" className={className}>
      <Image
        src={isFull ? logo : logoMobile}
        alt="Kasa"
        priority
        className={isFull ? "h-8 w-auto" : "h-12 w-auto"}
      />
    </Link>
  );
}
