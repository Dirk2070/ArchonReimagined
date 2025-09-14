import React from 'react';

export const Impressum: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Impressum</h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="text-gray-300">
              Werner Productions Media<br />
              Musterstraße 123<br />
              12345 Musterstadt<br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Vertreten durch</h2>
            <p className="text-gray-300">
              Werner Productions<br />
              Geschäftsführer
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
            <p className="text-gray-300">
              Telefon: +49 (0) 123 456789<br />
              E-Mail: info@werner-productions.de<br />
              Website: www.werner-productions.de
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Registereintrag</h2>
            <p className="text-gray-300">
              Eingetragen im Handelsregister.<br />
              Registergericht: Amtsgericht Musterstadt<br />
              Registernummer: HRB 12345
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Umsatzsteuer-ID</h2>
            <p className="text-gray-300">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE 123 456 789
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Haftung für Inhalte</h2>
            <p className="text-gray-300">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Urheberrecht</h2>
            <p className="text-gray-300">
              "Archon Reimagined" ist eine eigenständige Neuinterpretation, inspiriert vom Original
              "Archon: The Light and the Dark" (1983, Free Fall Associates/Electronic Arts).
              Alle Inhalte dieser Web-App unterliegen dem Urheberrecht von Werner Productions Media.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400">
            © 2025 Werner Productions Media. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
};
