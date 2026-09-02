import Container from "@/components/layout/Container";

// Shared card shell for /connexion and /inscription. Proportions come from
// `docs/mockups/Log In.png` and `Sign In.png` — a centered card holding a
// 360px form column inside a wider text column — with the card widened past
// the mockups' 742px so more of it reads as left/right padding.
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    // The mockups centre the card in the space left between header and footer
    // (135px gaps on the short login page, the 40px minimum on the taller
    // registration one), so the section grows and centres rather than
    // stacking from the top.
    <Container className="flex flex-1 flex-col justify-center py-10">
      <div className="mx-auto w-full max-w-[960px] rounded-lg border border-kasa-gray-light bg-kasa-white px-4 py-10 md:px-28 md:py-20">
        {/* Heading and subtitle run wider than the form column in both mockups. */}
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-kasa-red md:text-[32px]">
            {title}
          </h1>
          <p className="mt-4 text-center text-sm text-kasa-black">{subtitle}</p>
        </div>

        <div className="mx-auto mt-9 max-w-[360px]">{children}</div>
      </div>
    </Container>
  );
}
