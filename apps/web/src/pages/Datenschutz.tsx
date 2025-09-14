import React from 'react';

export const Datenschutz: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Datenschutzerklärung</h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
            <p className="text-gray-300 mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
              Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten,
              mit denen Sie persönlich identifiziert werden können.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">2. Datenerfassung auf unserer Website</h2>
            <h3 className="text-lg font-medium mb-2">Lokale Datenspeicherung</h3>
            <p className="text-gray-300 mb-4">
              Diese Web-App verwendet ausschließlich lokale Datenspeicherung (LocalStorage) in Ihrem Browser
              für Spielstände und Einstellungen. Es werden keine Daten an externe Server übertragen,
              es sei denn, Sie melden sich für die Online-Funktionen an.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">3. Supabase (bei Anmeldung)</h2>
            <p className="text-gray-300 mb-4">
              Bei Nutzung der Online-Funktionen (Registrierung, Spielstände online speichern,
              Rangliste) werden Ihre Daten bei Supabase gespeichert. Supabase ist DSGVO-konform
              und speichert Daten in der EU.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">4. Ihre Rechte</h2>
            <p className="text-gray-300 mb-4">
              Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und
              Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem
              ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
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
