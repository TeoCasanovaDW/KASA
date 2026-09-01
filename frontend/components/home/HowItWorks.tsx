export default function HowItWorks() {
  return (
    <div className="rounded-2xl bg-kasa-white px-6 py-16 text-center md:px-8 lg:px-32">
      <h2 className="text-2xl font-bold text-kasa-black">
        Comment ça marche ?
      </h2>
      <p className="mt-4">
        Que vous partiez pour un week-end improvisé, des vacances en famille
        ou un voyage professionnel, Kasa vous aide à trouver un lieu qui vous
        ressemble.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="min-h-52 rounded-lg bg-kasa-dark-orange p-8 text-left text-kasa-white md:p-6 lg:p-8">
          <h3 className="text-lg font-medium">Recherchez</h3>
          <p className="mt-2 text-sm">
            Entrez votre destination, vos dates et laissez Kasa faire le
            reste
          </p>
        </div>
        <div className="min-h-52 rounded-lg bg-kasa-dark-orange p-8 text-left text-kasa-white md:p-6 lg:p-8">
          <h3 className="text-lg font-medium">Réservez</h3>
          <p className="mt-2 text-sm">
            Profitez d&apos;une plateforme sécurisée et de profils
            d&apos;hôtes vérifiés.
          </p>
        </div>
        <div className="min-h-52 rounded-lg bg-kasa-dark-orange p-8 text-left text-kasa-white md:p-6 lg:p-8">
          <h3 className="text-lg font-medium">Vivez l&apos;expérience</h3>
          <p className="mt-2 text-sm">
            Installez-vous, profitez de votre séjour, et sentez-vous chez
            vous, partout.
          </p>
        </div>
      </div>
    </div>
  );
}
