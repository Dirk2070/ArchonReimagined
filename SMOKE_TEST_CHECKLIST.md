# Smoke Test Checklist für "Archon Reimagined"

## Pre-Deploy Checks

### Lokale Tests
- [ ] `pnpm test` - Alle Unit-Tests grün
- [ ] `pnpm --filter web e2e` - E2E-Tests bestehen
- [ ] `pnpm --filter core test` - Core-Logik Tests
- [ ] `pnpm --filter ai test` - KI-Performance Tests

### Supabase Setup
- [ ] Supabase Cloud Projekt erstellt
- [ ] `supabase link --project-ref XXX` erfolgreich
- [ ] `supabase db push` ohne Fehler
- [ ] Edge Functions deployed:
  - [ ] `supabase functions deploy archon-allowed-actions`
  - [ ] `supabase functions deploy archon-submit-score`
- [ ] CORS Origins konfiguriert für Vercel-Domain + localhost
- [ ] Auth Settings: Site URL und Redirect URLs gesetzt

### Vercel Setup
- [ ] `vercel.json` im Root-Verzeichnis
- [ ] Environment Variables gesetzt:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `apps/web/dist`

## Post-Deploy Smoke Tests

### 1. App lädt korrekt
- [ ] Vercel-URL öffnet sich ohne Fehler
- [ ] "Archon Reimagined" Titel sichtbar
- [ ] 9x9 Brett wird angezeigt
- [ ] Keine Console-Fehler (Supabase, React)

### 2. Grundfunktionalität
- [ ] "New Game" Button funktioniert
- [ ] Settings-Panel öffnet sich
- [ ] KI-Difficulty lässt sich ändern
- [ ] Auto-Resolve Toggle funktioniert

### 3. Spielablauf
- [ ] Figur anklicken → Auswahl sichtbar
- [ ] Grüne Felder zeigen legale Züge
- [ ] Zug ausführen → Brett aktualisiert sich
- [ ] KI denkt an (Delay sichtbar)
- [ ] KI-Zug wird ausgeführt
- [ ] Turn-Counter erhöht sich

### 4. Kampf-System
- [ ] Zug auf feindliche Figur → Arena öffnet sich
- [ ] Auto-Resolve: Kampf endet automatisch
- [ ] Manuell: "Resolve Combat" Button funktioniert
- [ ] Gewinner/Loser werden korrekt angewendet
- [ ] HP-Werte aktualisieren sich

### 5. Save/Load System
- [ ] Spiel speichern (implizit nach jedem Zug)
- [ ] Seite neu laden
- [ ] Spiel-Status bleibt erhalten
- [ ] Fortsetzung möglich

### 6. Leaderboard
- [ ] Spiel zu Ende spielen (Elimination oder Power Points)
- [ ] Score wird automatisch eingetragen
- [ ] Leaderboard zeigt Eintrag
- [ ] Mehrere Spiele → Rangliste sortiert

### 7. Performance
- [ ] KI-Züge < 1 Sekunde (Normal), < 2 Sekunden (Expert)
- [ ] UI bleibt flüssig während KI denkt
- [ ] Keine Memory Leaks (mehrere Spiele hintereinander)
- [ ] Mobile: Touch-Events funktionieren

### 8. Edge Cases
- [ ] Ungültige Züge werden blockiert
- [ ] Spiel-Ende wird erkannt (Victory/Defeat)
- [ ] Netzwerk-Fehler werden gehandhabt (Offline-Modus)
- [ ] Mehrere Tabs/Browser funktionieren unabhängig

## Troubleshooting

### Supabase-Fehler
```bash
# Logs prüfen
supabase functions logs archon-allowed-actions
supabase functions logs archon-submit-score

# CORS prüfen
# Supabase Dashboard > API > CORS Origins
```

### Vercel-Fehler
```bash
# Build Logs prüfen
vercel logs

# Environment Variables prüfen
vercel env ls
```

### Performance-Probleme
- KI Web Worker Fallback prüfen
- Network Tab: Edge Functions < 250ms
- Memory Tab: Keine Leaks

## Go-Live Checklist

- [ ] Alle Smoke Tests bestanden ✅
- [ ] RLS Policies aktiv und getestet
- [ ] Security Audit bestanden
- [ ] Monitoring eingerichtet (optional)
- [ ] Backup-Strategie dokumentiert
- [ ] Rollback-Plan bereit

## Notfall-Rollback

Falls kritische Probleme nach Deploy:
1. Vercel: Previous Deployment wiederherstellen
2. Supabase: Edge Functions zurückrollen
3. Datenbank: Backup wiederherstellen (falls nötig)

## Monitoring

Nach Go-Live:
- Vercel Analytics für Performance
- Supabase Dashboard für API-Calls
- Browser Console für Client-Fehler
- User Feedback sammeln
