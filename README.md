# 🎄 Wichtel App

Die moderne Wichtel-App für unkompliziertes, anonymes Wichteln mit garantierter Anonymität - auch für Organisatoren!

## ✨ Features

### Core Features
- ✅ **Garantierte Anonymität**: Organisatoren können selbst teilnehmen, ohne fremde Zuteilungen zu sehen
- ✅ **WhatsApp-Integration**: One-Click Versand mit vorausgefüllten Nachrichten
- ✅ **Magische Reveal-Animation**: Slot-Machine-Effekt beim Öffnen des persönlichen Links
- ✅ **Session-Management**: Übersicht, Archivierung, und Kopieren für Folgejahre
- ✅ **Mobile-First Design**: Optimiert für Smartphone-Nutzung
- ✅ **Keine App-Installation**: Alles im Browser, sofort einsatzbereit
- ✅ **Unter 5 Minuten**: Von Session-Erstellung bis Versand

### Enhanced Features (v1.1.0+)
- ✅ **Partner-Ausschlussregeln**: Paare können sich nicht gegenseitig beschenken
- ✅ **Reveal View Tracking**: Organisatoren sehen, wer seinen Link geöffnet hat
- ✅ **WhatsApp Resend**: Links können erneut gesendet werden
- ✅ **Internationale Telefon-Validierung**: E.164 Format für alle Länder (CH, DE, AT, etc.)
- ✅ **Professionelles Branding**: Einheitliches Logo-System
- ✅ **Test Infrastructure**: Automatisierte Tests mit Vitest

## 🚀 Quick Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Animation**: Framer Motion 12
- **TypeScript**: Vollständig typsicher
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel (Serverless)

## 🎯 Implementation Status

**Alle 24 User Stories implementiert! ✅ 🎉**

- ✅ Epic 0: Technical Foundation (Story 01-03)
- ✅ Epic 1: Session & Participant Management (Story 04-09)
- ✅ Epic 2: Anonyme Auslosung (Story 10-12)
- ✅ Epic 3: WhatsApp-Integration (Story 13-17)
- ✅ Epic 4: Reveal Experience (Story 18-21)
- ✅ Epic 5: Session-Verwaltung & Wiederverwendbarkeit (Story 22-24)

**96/96 Story Points** - 100% Complete!

## 🔐 Anonymitäts-Garantie

Multi-Layer Defense Strategy:
1. Backend RLS Policies
2. API Layer ohne assigned_to_id
3. Frontend TypeScript Types
4. UI/UX Trust-Building

## 📝 User Flow

1. Organisator erstellt Session & fügt Teilnehmer hinzu
2. Auslosung mit Derangement-Algorithmus
3. WhatsApp-Links an alle versenden
4. Teilnehmer öffnen Link → magische Animation → Namen-Reveal
5. Session-Verwaltung: Archivieren oder für Folgejahre kopieren

## 🌍 Production Deployment

### Deployment-Strategie

**Zwei-Umgebungs-Setup:**
- **TEST** (Preview): Separate Supabase-Instanz für Development & Testing
- **PROD** (Main): Production Supabase-Instanz für Live-Betrieb

### Voraussetzungen

1. **Zwei Supabase Projects**
   - **TEST**: Für Development/Preview (z.B. `wichtel-app-test`)
   - **PROD**: Für Production (z.B. `wichtel-app`)
   - Erstelle beide auf [supabase.com](https://supabase.com)
   - Region: Frankfurt (eu-central-1) empfohlen für Deutschland/Schweiz

2. **Vercel Account**
   - Kostenloser Account auf [vercel.com](https://vercel.com)
   - GitHub Integration aktivieren

### Setup-Schritte

#### 1. Supabase Setup (TEST & PROD)

```bash
# Supabase CLI installieren
npm install -g supabase

# Login
supabase login

# Für TEST-Datenbank
npm run db:push:test

# Für PROD-Datenbank
npm run db:push:prod
```

Oder manuell in Supabase Dashboard:
- SQL Editor öffnen
- Migrations aus `/supabase/migrations/` ausführen (für beide Projekte)

#### 2. Environment Files (Lokal)

Erstelle `.env.test` und `.env.production` mit deinen Supabase-Credentials:

**`.env.test`** (TEST Environment):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[test-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[test-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[test-service-role-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:[password]@db.[test-project-ref].supabase.co:5432/postgres
```

**`.env.production`** (PROD Environment):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[prod-service-role-key]
NEXT_PUBLIC_SITE_URL=https://wichteln.your-domain.com
DATABASE_URL=postgresql://postgres:[password]@db.[prod-project-ref].supabase.co:5432/postgres
```

**⚠️ WICHTIG:** Diese Dateien sind in `.gitignore` - nicht committen!

#### 3. Vercel Deployment

**GitHub Integration (Empfohlen)**

1. **Repository Setup**:
   ```bash
   git push origin main
   ```

2. **Vercel Project Import**:
   - Gehe zu [vercel.com/new](https://vercel.com/new)
   - Importiere dein GitHub Repository

3. **Environment Variables konfigurieren**:

   **Production (main branch only):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=[PROD URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[PROD anon key]
   SUPABASE_SERVICE_ROLE_KEY=[PROD service role key]
   NEXT_PUBLIC_SITE_URL=https://wichteln.your-domain.com
   ```

   **Preview (all other branches):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=[TEST URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[TEST anon key]
   SUPABASE_SERVICE_ROLE_KEY=[TEST service role key]
   NEXT_PUBLIC_SITE_URL=[auto-generated preview URL]
   ```

4. **Deploy!**

#### 4. Post-Deployment

1. **Custom Domain**:
   - Vercel Dashboard → Settings → Domains
   - Füge deine Domain hinzu (z.B. `wichteln.buchs.be`)

2. **Supabase Auth Redirect URLs** (beide Projekte):
   - **PROD**: `https://wichteln.your-domain.com/auth/callback`
   - **TEST**: `https://[preview-url].vercel.app/auth/callback`

3. **Testing**:
   - **TEST**: Test auf Preview-Deployment
   - **PROD**: Smoke-Test nach Production-Deploy

### Development Workflow

```bash
# 1. Feature-Branch erstellen
git checkout -b feature/my-feature

# 2. Lokal gegen TEST entwickeln
npm run dev:test

# 3. Push → Vercel Preview Deployment (gegen TEST DB)
git push origin feature/my-feature

# 4. PR zu main → Review & Merge

# 5. Main deployment → Production (gegen PROD DB)
# Automatisch nach Merge
```

### Database Migration Workflow

```bash
# 1. Test lokal mit TEST DB
npm run dev:test

# 2. Migration zu TEST DB pushen
npm run db:push:test

# 3. Types regenerieren
npm run types:generate:test

# 4. Testen auf Preview
git push origin feature/my-feature

# 5. Nach Merge: Migration zu PROD
npm run db:push:prod
npm run types:generate:prod
```

**⚠️ CRITICAL**: Nie Migrationen direkt zu PROD pushen - immer zuerst auf TEST testen!

### Build Validierung

```bash
# Build lokal testen
npm run build

# Production Server lokal starten
npm start
```

### Performance Optimierung

- ✅ Next.js Image Optimization aktiv
- ✅ Automatic Static Optimization
- ✅ Edge Functions für API Routes
- ✅ CSS Purging via Tailwind

### Monitoring

Vercel bietet automatisch:
- Real-time Analytics
- Error Tracking
- Performance Metrics

Supabase bietet:
- Database Analytics
- Auth Logs
- API Usage Stats

## 🔧 Development

```bash
# Development mit Hot Reload
npm run dev

# Type Checking
npm run type-check

# Run Tests
npm test

# Test Coverage
npm run test:coverage

# Build für Production
npm run build

# Production Server lokal
npm start
```

## 📚 Dokumentation

Weitere Details in `/docs/`:
- `epics.md` - Alle User Stories & Implementation Details
- `architecture.md` - Architektur-Entscheidungen
- `ux-design.md` - UX/UI Specification

---

**Entwickelt mit ❤️ und Claude Code** 🎄
**Version 1.2.0** - Alle 24 Stories + Post-MVP Enhancements implementiert
