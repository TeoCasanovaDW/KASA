import Container from "@/components/layout/Container";
import Logo from "@/components/layout/Logo";

export default function Footer() {
  return (
    <footer className="bg-kasa-white">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <Logo variant="icon" />
        <p className="text-xs text-kasa-gray-dark">
          © 2025 Kasa. All rights reserved
        </p>
      </Container>
    </footer>
  );
}
