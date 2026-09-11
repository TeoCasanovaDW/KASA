import Image from "next/image";
import UserIcon from "@/components/icons/UserIcon";

/**
 * Renders a user/host profile picture, or the same neutral silhouette
 * fallback everywhere a picture is null/empty, instead of an empty block.
 */
export default function Avatar({
  src,
  size,
  alt = "",
  rounded = "rounded-md",
}: {
  src: string | null;
  size: number;
  alt?: string;
  rounded?: string;
}) {
  const boxStyle = { width: size, height: size };

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={boxStyle}
        className={`flex-none object-cover ${rounded}`}
      />
    );
  }

  return (
    <div
      style={boxStyle}
      className={`flex flex-none items-center justify-center bg-kasa-gray-light ${rounded}`}
    >
      <UserIcon className="h-1/2 w-1/2 text-kasa-gray-dark" />
    </div>
  );
}
