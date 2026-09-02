import Logo from "@/components/layout/Logo";

export default function Footer() {
  return (
    // Full-bleed by design: the mockups run the white band and its hairline
    // top border edge to edge, with the content on a 40px gutter of its own
    // rather than the page Container's measure.
    <footer className="border-t border-kasa-gray-light bg-kasa-white">
      <div className="flex min-h-[70px] items-center justify-between gap-4 px-10">
        <Logo variant="icon" />
        <p className="text-xs text-kasa-gray-dark">
          © 2025 Kasa. All rights reserved
        </p>
      </div>
    </footer>
  );
}
