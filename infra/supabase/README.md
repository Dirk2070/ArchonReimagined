# Supabase Cloud Setup Guide

## 1. Supabase Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project Ref**: `xxxxx` (aus der URL)
   - **Anon Key**: Aus Settings > API

## 2. Lokale Verbindung herstellen

```bash
# Im infra/supabase Ordner
cd infra/supabase

# Projekt verknüpfen
supabase link --project-ref YOUR_PROJECT_REF

# Datenbank-Schema deployen
supabase db push

# Edge Functions deployen
supabase functions deploy archon-allowed-actions
supabase functions deploy archon-submit-score
```

## 3. Auth & CORS Konfiguration

### In Supabase Dashboard:

**Authentication > Settings:**
- **Site URL**: `https://your-vercel-domain.vercel.app`
- **Additional Redirect URLs**:
  - `http://localhost:3000`
  - `https://your-vercel-domain.vercel.app`

**API > Settings:**
- **CORS Origins** hinzufügen:
  - `http://localhost:3000`
  - `https://your-vercel-domain.vercel.app`

## 4. Vercel Deployment

### Monorepo Setup:

**vercel.json** in Root-Verzeichnis:
```json
{
  "framework": null,
  "buildCommand": "pnpm build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  "functions": {
    "apps/web/dist/**/*.js": {
      "runtime": "@vercel/static"
    }
  }
}
```

### Environment Variables in Vercel:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build Settings:
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`

## 5. Smoke Test nach Deploy

```bash
# 1. App lädt
curl https://your-vercel-domain.vercel.app

# 2. Supabase Verbindung testen
# Öffnen Sie die App im Browser und prüfen Sie Console auf Supabase-Fehler

# 3. Spielablauf testen
# - Neues Spiel starten
# - Figur auswählen (grüne Felder sollten erscheinen)
# - Zug ausführen
# - KI sollte antworten

# 4. Save/Load testen
# - Spiel speichern
# - Seite neu laden
# - Spiel laden

# 5. Leaderboard testen
# - Spiel zu Ende spielen
# - Score sollte in Leaderboard erscheinen
```

## 6. Troubleshooting

### Edge Functions nicht verfügbar:
```bash
supabase functions logs archon-allowed-actions
supabase functions logs archon-submit-score
```

### CORS-Fehler:
- Prüfen Sie die CORS-Origins in Supabase Dashboard
- Stellen Sie sicher, dass Vercel-Domain hinzugefügt ist

### Auth-Fehler:
- Prüfen Sie die Site URL und Redirect URLs
- Anon Key sollte korrekt in Vercel gesetzt sein

## 7. Production Checklist

- [ ] Supabase Projekt ist "Production" Modus
- [ ] RLS Policies sind aktiv
- [ ] Edge Functions deployed und funktionstüchtig
- [ ] CORS für Production-Domain konfiguriert
- [ ] Environment Variables in Vercel gesetzt
- [ ] Smoke Tests bestanden
- [ ] Monitoring eingerichtet (optional)
