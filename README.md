# 🎄 Wichtel App

Die moderne Wichtel-App für unkompliziertes, anonymes Wichteln mit garantierter Anonymität - auch für Organisatoren!

## ✨ Features

- ✅ **Garantierte Anonymität**: Organisatoren können selbst teilnehmen, ohne fremde Zuteilungen zu sehen
- ✅ **WhatsApp-Integration**: One-Click Versand mit vorausgefüllten Nachrichten
- ✅ **Magische Reveal-Animation**: Slot-Machine-Effekt beim Öffnen des persönlichen Links
- ✅ **Mobile-First Design**: Optimiert für Smartphone-Nutzung
- ✅ **Keine App-Installation**: Alles im Browser, sofort einsatzbereit
- ✅ **Unter 5 Minuten**: Von Session-Erstellung bis Versand

## 🚀 Quick Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Animation**: Framer Motion
- **TypeScript**: Vollständig typsicher

## 🎯 Implementation Status

**Alle 21 User Stories implementiert! ✅**

- ✅ Epic 0: Technical Foundation (Story 01-03)
- ✅ Epic 1: Session & Participant Management (Story 04-09)
- ✅ Epic 2: Anonyme Auslosung (Story 10-12)
- ✅ Epic 3: WhatsApp-Integration (Story 13-17)
- ✅ Epic 4: Reveal Experience (Story 18-21)

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

---

**Entwickelt mit ❤️ und Claude Code** 🎄
