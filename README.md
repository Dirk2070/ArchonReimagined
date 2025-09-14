# Archon Reimagined

Eine moderne Web-App-Neuinterpretation des Strategiespiel-Klassikers "Archon: The Light and the Dark" mit React, TypeScript, Vite, Tailwind CSS, Zustand, Phaser und Supabase.

## 🚀 Startbefehle

### Entwicklung
```bash
# Installiere alle Dependencies
pnpm install

# Starte die Web-App im Entwicklungsmodus
pnpm dev

# Starte die Arena-Komponente separat
pnpm arena:dev
```

### Build & Test
```bash
# Baue die Web-App für Produktion
pnpm build

# Führe Tests aus
pnpm test

# Baue alle Packages
pnpm --filter core build
pnpm --filter ai build
pnpm --filter arena build
```

## 📁 Projektstruktur

```
archon-reimagined/
├── apps/
│   ├── web/          # Haupt-React-Anwendung
│   └── arena/        # Phaser-Kampf-Komponente
├── packages/
│   ├── core/         # Spielogik (9x9 Brett, Figuren, Züge)
│   └── ai/           # KI-Algorithmen (3 Schwierigkeitsgrade)
├── infra/
│   └── supabase/     # Datenbank-Migrationen
└── pnpm-workspace.yaml
```

## 🎮 Features

- **9×9 Spielbrett** mit Lichtzyklus-Anzeige
- **Figuren-System**: Zauberer, Drache, Einhorn, Golem, Ritter
- **Auswahl und legale Züge** mit visueller Rückmeldung
- **Kampfauslösung** öffnet separate Arena-Dialog
- **Automatische Kampfauflösung** als Fallback
- **KI mit 3 Schwierigkeitsgraden**: Anfänger, Normal, Experte
- **Save/Load-Funktionalität** mit Supabase
- **Rangliste** für Highscores

## 🛠 Technologie-Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Game Engine**: Phaser.js für Kämpfe
- **Backend**: Supabase (Auth, Database, Storage)
- **Build Tool**: pnpm Workspaces

## 📦 Packages

### @archon/core
Kern-Spiellogik mit Brett, Figuren und Spielregeln.

### @archon/ai
Utility-Based AI mit konfigurierbaren Schwierigkeitsgraden.

### @archon/arena
Phaser-basierte Kampf-Komponente als separate React-Komponente.

## 🔧 Supabase Setup

1. Erstelle ein neues Supabase-Projekt
2. Führe die Migrationen aus:
   ```bash
   cd infra/supabase
   supabase db push
   ```
3. Aktualisiere die Umgebungsvariablen in der Web-App

## 📄 Rechtliche Seiten

- **Impressum**: `/impressum`
- **Datenschutzerklärung**: `/datenschutz`
- **AGB**: `/agb`

Copyright © 2025 Werner Productions Media

## 🧪 Lokaler Test

Nach dem Start der Entwicklungsserver:
1. Öffne http://localhost:3000
2. Das 9x9 Brett wird angezeigt (noch ohne vollständige Funktionalität)
3. Kämpfe können über die Arena-Komponente getestet werden

## 📋 TODO

- [x] Projektstruktur mit pnpm workspaces
- [x] Core-Spielogik (Brett, Figuren, Züge)
- [x] AI-Implementierung
- [x] Arena-Komponente mit Phaser
- [x] Grundlegende React-App
- [ ] Vollständige UI/UX mit Tailwind
- [ ] Supabase-Integration (Auth, Saves, Leaderboard)
- [ ] Migrationen für profiles, games, game_actions, leaderboard
- [ ] Rechtsseiten (Impressum, Datenschutz, AGB)
- [ ] Lokales Testen und Debugging

## 🤝 Mitwirken

Dieses Projekt ist eine Neuinterpretation des klassischen Spiels "Archon" und steht in keiner Verbindung zu den ursprünglichen Rechteinhabern.
