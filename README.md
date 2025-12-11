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

### Voraussetzungen

1. **Supabase Project**
   - Erstelle ein kostenloses Supabase-Projekt auf [supabase.com](https://supabase.com)
   - Region: Frankfurt (eu-central-1) empfohlen für Deutschland

2. **Vercel Account**
   - Kostenloser Account auf [vercel.com](https://vercel.com)

### Deployment-Schritte

#### 1. Supabase Setup

```bash
# Supabase CLI installieren (falls noch nicht vorhanden)
npm install -g supabase

# Login
supabase login

# Link zu deinem Projekt
supabase link --project-ref YOUR_PROJECT_REF

# Migrations ausführen
supabase db push
```

Oder manuell in Supabase Dashboard:
- SQL Editor öffnen
- Migrations aus `/supabase/migrations/` ausführen

#### 2. Environment Variables

Erstelle eine `.env.local` Datei mit deinen Supabase-Credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Diese Werte findest du in Supabase Dashboard → Settings → API

#### 3. Vercel Deployment

**Option A: GitHub Integration (Empfohlen)**

1. Push Code zu GitHub Repository
2. Gehe zu [vercel.com/new](https://vercel.com/new)
3. Importiere dein GitHub Repository
4. Füge Environment Variables hinzu:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

**Option B: Vercel CLI**

```bash
# Vercel CLI installieren
npm install -g vercel

# Deployment durchführen
vercel --prod

# Environment Variables setzen (wird beim ersten Deploy gefragt)
```

#### 4. Post-Deployment

1. **Custom Domain** (optional):
   - Vercel Dashboard → Settings → Domains
   - Füge deine Domain hinzu (z.B. `wichteln.deine-domain.de`)

2. **Supabase Auth Redirect URLs**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Füge hinzu: `https://deine-domain.vercel.app/auth/callback`

3. **Testing**:
   - Erstelle Test-Session
   - Teste WhatsApp-Links
   - Teste Reveal-Animation

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
