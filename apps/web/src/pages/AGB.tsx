import React from 'react';

export const AGB: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Allgemeine Geschäftsbedingungen</h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Geltungsbereich</h2>
            <p className="text-gray-300">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Web-App
              "Archon Reimagined" von Werner Productions Media.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">2. Leistungen</h2>
            <p className="text-gray-300">
              "Archon Reimagined" ist eine kostenlose Web-App zur Unterhaltung. Die Nutzung
              erfolgt auf eigene Gefahr. Wir übernehmen keine Gewähr für die Verfügbarkeit
              oder Fehlerfreiheit der Anwendung.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Nutzungsrechte</h2>
            <p className="text-gray-300">
              Sie erhalten ein nicht-exklusives, nicht übertragbares Recht zur Nutzung der
              Web-App für persönliche, nicht-kommerzielle Zwecke.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">4. Haftung</h2>
            <p className="text-gray-300">
              Werner Productions Media haftet nicht für Schäden, die durch die Nutzung der
              Web-App entstehen. Dies gilt insbesondere für Datenverlust oder technische Probleme.
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
