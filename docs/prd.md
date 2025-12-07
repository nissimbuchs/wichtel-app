---
project_name: wichtel-app
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
lastStep: 11
user_name: Nissim
communication_language: German
document_output_language: German
created_date: 2025-12-06
completed_date: 2025-12-06
workflow_version: 6.0.0-alpha.13
workflow_path: .bmad/bmm/workflows/2-plan-workflows/prd
---

# Product Requirements Document (PRD)

## Wichtel-Applikation für Weihnachtsfeiern

**Version:** 1.0  
**Datum:** 06.12.2025  
**Autor:** Produktanforderungen basierend auf Stakeholder-Interview

-----

## 1. Executive Summary

Eine einfache Web-Applikation zur Organisation von Wichtel-Auslosungen für Weihnachtsfeiern. Die Applikation ermöglicht es einem Organisator, Teilnehmer zentral zu erfassen, eine anonyme Zulosung durchzuführen und die Ergebnisse via WhatsApp zu kommunizieren. **Besonderheit:** Der Organisator kann selbst als Teilnehmer am Wichteln teilnehmen, ohne die Anonymität zu gefährden oder die Zuteilungen anderer Teilnehmer zu kennen.

-----

## 2. Ziele und Vision

### 2.1 Hauptziel

Digitalisierung und Vereinfachung der Wichtel-Zulosung für kleine bis mittelgroße Gruppen (ca. 10 Personen).

### 2.2 Erfolgskriterien

- Zulosung in unter 5 Minuten abgeschlossen
- Garantierte Anonymität bis zur Weihnachtsfeier
- Wiederverwendbarkeit für zukünftige Jahre
- Keine technischen Barrieren für Teilnehmer

-----

## 3. Zielgruppe

### 3.1 Primäre Persona: Der Organisator

- Rolle: Organisiert die Weihnachtsfeier und koordiniert das Wichteln
- Technische Affinität: Mittel
- Bedürfnisse: Schnelle, unkomplizierte Lösung ohne aufwendiges Setup
- Kommunikationskanal: WhatsApp (primär mobil)
- **Besonderheit:** Kann selbst als Teilnehmer am Wichteln teilnehmen, ohne die Anonymität zu gefährden

### 3.2 Sekundäre Persona: Die Teilnehmer

- Rolle: Nehmen am Wichteln teil (inklusive Organisator, falls dieser selbst teilnimmt)
- Technische Anforderung: Minimal (nur WhatsApp-Link öffnen können)
- Bedürfnis: Einfach erfahren, wen sie beschenken sollen
- Erwartung: Garantierte Anonymität bis zur Weihnachtsfeier

-----

## 4. Funktionale Anforderungen

### 4.1 Wichtel-Session erstellen (Organisator)

**Priorität:** MUST HAVE

**User Story:**  
Als Organisator möchte ich eine neue Wichtel-Session erstellen, damit ich eine Auslosung organisieren kann.

**Akzeptanzkriterien:**

- Organisator kann eine neue Session mit einem Namen/Titel erstellen (z.B. “Weihnachtsfeier 2025”)
- System generiert eine eindeutige Session-ID
- Organisator erhält einen Admin-Link zur Verwaltung der Session

**Technische Details:**

- Session-Daten persistent speichern
- Eindeutige ID-Generierung (UUID oder ähnlich)
- Admin-Token für spätere Zugriffe

-----

### 4.2 Teilnehmer erfassen (Organisator)

**Priorität:** MUST HAVE

**User Story:**
Als Organisator möchte ich alle Teilnehmer zentral erfassen, damit ich die Auslosung durchführen kann.

**Akzeptanzkriterien:**

- Organisator kann Namen von Teilnehmern eingeben
- Organisator kann Telefonnummern (für WhatsApp) hinterlegen
- **Organisator kann sich selbst als Teilnehmer hinzufügen**
- Minimum 3 Teilnehmer, Maximum 50 Teilnehmer
- Teilnehmer können bearbeitet oder gelöscht werden vor der Auslosung
- Validierung der Telefonnummern (Format)

**UI-Komponenten:**

- Eingabeformular: Name + Telefonnummer
- Liste aller erfassten Teilnehmer
- Optional: "Mich selbst hinzufügen"-Button für schnelles Hinzufügen des Organisators
- Bearbeiten/Löschen-Buttons pro Teilnehmer

-----

### 4.3 Auslosung durchführen (Organisator)

**Priorität:** MUST HAVE

**User Story:**  
Als Organisator möchte ich die Auslosung mit einem Klick durchführen, damit jeder Teilnehmer genau eine Person zum Beschenken zugeteilt bekommt.

**Akzeptanzkriterien:**

- Zufällige Zuteilung: Jeder bekommt genau eine Person
- Niemand zieht sich selbst
- Keine Duplikate (A beschenkt B, B beschenkt C, etc. - geschlossener Kreis)
- Auslosung kann nur einmal durchgeführt werden (nicht wiederholbar für gleiche Session)
- Bestätigungsdialog vor der Auslosung

**Algorithmus:**

- Derangement-Algorithmus oder ähnlicher Ansatz
- Garantie eines geschlossenen Wichtel-Kreises

-----

### 4.4 Organisator als Teilnehmer (Organisator + Teilnehmer)

**Priorität:** MUST HAVE

**User Story:**
Als Organisator möchte ich selbst am Wichteln teilnehmen können, ohne die Anonymität zu gefährden oder die Zuteilungen anderer Teilnehmer zu kennen.

**Akzeptanzkriterien:**

- Organisator kann sich selbst als regulären Teilnehmer zur Session hinzufügen
- Nach der Auslosung sieht der Organisator **KEINE** Zuteilungen der anderen Teilnehmer
- Organisator erhält seinen eigenen personalisierten Link (wie alle anderen Teilnehmer)
- Organisator muss seinen eigenen Link öffnen, um zu sehen, wen er beschenkt
- **UI verhindert versehentliches Sehen fremder Zuteilungen während des WhatsApp-Versands**
- System behandelt Organisator als regulären Teilnehmer (gleiche Rechte, gleiche Anonymität)

**Technische Details:**

- Auslosungs-Algorithmus berücksichtigt Organisator wie jeden anderen Teilnehmer
- Nach Auslosung werden Zuteilungen serverseitig gespeichert, aber nicht an Frontend gesendet
- WhatsApp-Versand-Interface zeigt nur Namen + Telefonnummer, **keine Zuteilungsinformationen**
- Organisator erhält eigenen Participant-Token für seinen Link
- Zugriff auf Zuteilungen erfolgt ausschließlich über individuelle Teilnehmer-Links

**UI-Überlegungen:**

- Klare Kommunikation: "Auch du wirst erst beim Öffnen deines Links sehen, wen du beschenkst"
- Vertrauensaufbau durch Transparenz über den Mechanismus
- Keine Anzeige von "Wer beschenkt wen" im Admin-Interface

-----

### 4.5 WhatsApp-Direktversand (Organisator)

**Priorität:** MUST HAVE

**User Story:**  
Als Organisator möchte ich vom Mobile aus direkt WhatsApp öffnen können mit vorausgefüllter Nachricht, damit ich schnell alle Teilnehmer benachrichtigen kann.

**Akzeptanzkriterien:**

- Nach der Auslosung erhält Organisator Liste aller Teilnehmer
- Pro Teilnehmer gibt es einen “WhatsApp senden”-Button
- Klick auf Button öffnet WhatsApp-App (Mobile) oder WhatsApp Web (Desktop)
- WhatsApp öffnet sich mit:
  - Richtigem Empfänger (Telefonnummer des Teilnehmers)
  - Vorausgefüllter Nachricht inkl. personalisierten Link
- Nachricht ist ready-to-send (Organisator muss nur noch auf “Senden” klicken)
- Organisator kehrt nach dem Senden zur App zurück und kann nächsten Teilnehmer benachrichtigen

**Nachrichtenformat (Beispiel):**

```
Hallo [Name]! 🎄

Du nimmst an unserem Wichteln "Weihnachtsfeier 2025" teil!

Hier ist dein persönlicher Link, um zu sehen, wen du beschenken sollst:
[Eindeutiger Link]

Viel Spaß beim Geschenke-Suchen! 🎁
```

**Technische Implementierung:**

- WhatsApp-URL-Schema nutzen: `https://wa.me/[Telefonnummer]?text=[kodierte Nachricht]`
- Nachricht muss URL-encoded sein
- Format Telefonnummer: Internationales Format ohne + (z.B. 491701234567)
- Fallback für Desktop: WhatsApp Web
- Deep-Link für Mobile: Öffnet direkt WhatsApp-App

-----

### 4.6 Zuteilung anzeigen (Teilnehmer)

**Priorität:** MUST HAVE

**User Story:**  
Als Teilnehmer möchte ich über einen Link sehen, wen ich beschenken soll, damit ich ein Geschenk besorgen kann.

**Akzeptanzkriterien:**

- Teilnehmer öffnet persönlichen Link
- Anzeige zeigt:
  - Wichtel-Session-Name
  - “Du beschenkst: [Name der Person]”
  - Hinweis auf Anonymität
- Kein Login erforderlich
- Link ist nur für diesen Teilnehmer gültig
- Sicherheit: Link sollte nicht erratbar sein (Token-basiert)

**UI:**

- Einfache, festliche Darstellung
- Mobile-optimiert (Hauptzugriff via Smartphone)
- Kein unnötiger Text, klare Information

-----

### 4.7 Session-Verwaltung (Organisator)

**Priorität:** SHOULD HAVE

**User Story:**  
Als Organisator möchte ich meine Sessions verwalten können, damit ich im nächsten Jahr eine neue Session erstellen kann.

**Akzeptanzkriterien:**

- Organisator kann eine Liste seiner Sessions sehen
- Session-Status sichtbar: “In Planung”, “Ausgelost”, “Abgeschlossen”
- Organisator kann alte Sessions als Vorlage nutzen (Teilnehmer kopieren)
- Sessions können archiviert werden

-----

### 4.8 Wiederverwendbarkeit

**Priorität:** MUST HAVE

**User Story:**  
Als Organisator möchte ich die App in zukünftigen Jahren wieder nutzen können, ohne Daten zu verlieren.

**Akzeptanzkriterien:**

- Sessions bleiben persistent gespeichert
- Alte Sessions können eingesehen werden (Read-only nach Abschluss)
- Neue Session kann jederzeit erstellt werden
- Optional: Teilnehmer-Import aus vorheriger Session

-----

## 5. Nicht-funktionale Anforderungen

### 5.1 Benutzerfreundlichkeit

- Intuitive Bedienung ohne Anleitung
- Mobile-first Design (primärer Zugriff via Smartphone)
- Responsive Design für Desktop und Tablet
- Ladezeiten unter 2 Sekunden

### 5.2 Sicherheit & Datenschutz

- Links mit kryptografisch sicheren Tokens (z.B. UUID v4)
- Keine Speicherung sensibler persönlicher Daten außer Namen und Telefonnummern
- HTTPS-Verschlüsselung
- Keine Weitergabe von Daten an Dritte
- DSGVO-konform (EU)
- **Anonymität für Organisator:** Zuteilungen werden ausschließlich über individuelle Teilnehmer-Links zugänglich gemacht
- **Keine Admin-Ansicht der Zuteilungen:** Admin-Interface zeigt nur Teilnehmerliste, keine "Wer beschenkt wen"-Übersicht
- **Serverseitige Kontrolle:** Zuteilungen werden nur bei Aufruf des individuellen Links zurückgegeben

### 5.3 Zuverlässigkeit

- 99% Verfügbarkeit während der Weihnachtszeit
- Datenpersistenz über mehrere Jahre
- Fehlerbehandlung bei fehlgeschlagener Auslosung

### 5.4 Performance

- Unterstützung von bis zu 50 Teilnehmern pro Session
- Schnelle Auslosung (< 1 Sekunde)
- Optimiert für gleichzeitigen Zugriff aller Teilnehmer

### 5.5 Kompatibilität

- Browser: Chrome, Firefox, Safari, Edge (aktuelle Versionen)
- Mobile: iOS Safari, Android Chrome
- WhatsApp Web und Mobile App Integration

-----

## 6. Technische Architektur (Empfehlung)

### 6.1 Frontend

- **Framework:** React oder Vue.js (oder einfaches HTML/CSS/JS)
- **Styling:** TailwindCSS oder ähnliches
- **Hosting:** Vercel, Netlify oder ähnliche Plattformen

### 6.2 Backend

- **Option A (Einfach):** Serverless Functions (z.B. Vercel Functions, AWS Lambda)
- **Option B (Vollständig):** Node.js/Express API
- **Datenbank:**
  - PostgreSQL oder MongoDB für persistente Speicherung
  - Oder: Firebase/Supabase für schnelle Entwicklung

### 6.3 Datenbankschema (vereinfacht)

```
Sessions:
- id (UUID)
- name (String)
- admin_token (String)
- status (Enum: planning, drawn, completed)
- created_at (Timestamp)

Participants:
- id (UUID)
- session_id (FK)
- name (String)
- phone_number (String)
- participant_token (String)
- assigned_to_id (FK, nullable)
```

-----

## 7. User Flows

### 7.1 Hauptflow: Organisator erstellt Wichtel-Session (und nimmt selbst teil)

1. Organisator öffnet App (auf Mobile)
1. Klickt auf "Neue Wichtel-Session erstellen"
1. Gibt Session-Namen ein (z.B. "Weihnachtsfeier 2025")
1. Fügt Teilnehmer hinzu (Name + Telefonnummer)
1. **Fügt sich selbst als Teilnehmer hinzu**
1. Überprüft die Liste
1. Klickt auf "Auslosung durchführen"
1. Bestätigt die Auslosung (System informiert: "Auch du wirst erst beim Öffnen deines Links sehen, wen du beschenkst")
1. Erhält Liste mit "WhatsApp öffnen"-Buttons pro Teilnehmer (inkl. sich selbst)
1. Klickt auf ersten Button → WhatsApp öffnet sich mit vorausgefüllter Nachricht
1. Sendet Nachricht ab
1. Kehrt zur App zurück
1. Wiederholt Schritt 10-12 für alle weiteren Teilnehmer (inkl. an sich selbst)
1. **Öffnet später seinen eigenen Link, um zu sehen, wen er beschenkt**

### 7.2 Nebenflow: Teilnehmer prüft Zuteilung

1. Teilnehmer erhält WhatsApp-Nachricht vom Organisator
1. Klickt auf Link in Nachricht
1. Browser öffnet sich mit Zuteilungs-Seite
1. Sieht, wen er/sie beschenken soll
1. Besorgt Geschenk vor der Weihnachtsfeier

### 7.3 Nebenflow: Organisator prüft seine eigene Zuteilung

1. Organisator hat alle WhatsApp-Nachrichten versendet (inkl. an sich selbst)
1. Öffnet seine eigene WhatsApp-Nachricht (die er an sich selbst gesendet hat)
1. Klickt auf seinen persönlichen Link
1. Browser öffnet sich mit Zuteilungs-Seite
1. **Animation läuft und enthüllt, wen er beschenken soll** (wie bei allen anderen Teilnehmern)
1. Sieht nur SEINE Zuteilung, nicht die der anderen
1. Besorgt Geschenk vor der Weihnachtsfeier

-----

## 8. Wireframes / UI-Skizzen

### 8.1 Startseite (Organisator)

```
+----------------------------------+
|   🎄 Wichtel-App                 |
+----------------------------------+
|                                  |
|  [+ Neue Session erstellen]     |
|                                  |
|  Deine Sessions:                 |
|  - Weihnachtsfeier 2024 ✓       |
|  - Weihnachtsfeier 2025 (Aktiv) |
|                                  |
+----------------------------------+
```

### 8.2 Session-Verwaltung

```
+----------------------------------+
|  ← Zurück  Weihnachtsfeier 2025 |
+----------------------------------+
|  Teilnehmer (5):                 |
|  • Max Mustermann  [Bearbeiten] |
|  • Anna Schmidt    [Bearbeiten] |
|  • ...                           |
|                                  |
|  [+ Teilnehmer hinzufügen]      |
|                                  |
|  [Auslosung durchführen]        |
+----------------------------------+
```

### 8.3 Nach der Auslosung (Mobile-optimiert)

```
+----------------------------------+
|  Auslosung erfolgreich! 🎉       |
+----------------------------------+
|  Sende Einladungen via WhatsApp: |
|                                  |
|  ✓ Max Mustermann                |
|    [📱 WhatsApp öffnen]          |
|                                  |
|  Anna Schmidt                    |
|    [📱 WhatsApp öffnen]          |
|                                  |
|  Peter Müller                    |
|    [📱 WhatsApp öffnen]          |
|  ...                             |
|                                  |
|  Tipp: Klick auf Button öffnet  |
|  WhatsApp mit fertiger Nachricht |
+----------------------------------+
```

### 8.4 Teilnehmer-Ansicht

```
+----------------------------------+
|        🎄 Wichteln 2025          |
+----------------------------------+
|                                  |
|     Du beschenkst:               |
|                                  |
|     Anna Schmidt 🎁              |
|                                  |
|  Denk dran: Es bleibt geheim     |
|  bis zur Weihnachtsfeier! 🤫     |
|                                  |
+----------------------------------+
```

-----

## 9. Out of Scope (Bewusst nicht enthalten)

Die folgenden Features sind **NICHT** Teil der ersten Version:

- ❌ Wunschlisten / Geschenkideen
- ❌ Budget-Limit-Anzeige
- ❌ Ausschlussregeln (Paare, etc.)
- ❌ Selbstregistrierung von Teilnehmern
- ❌ In-App Chat zwischen Schenker und Beschenktem
- ❌ Email-Benachrichtigungen
- ❌ Digitale Aufdeckung während der Feier
- ❌ Gamification (Punkte, Badges)
- ❌ Social Media Integration
- ❌ Zahlungsfunktionen
- ❌ Multi-Language Support
- ❌ Admin-Dashboard mit Analytics

-----

## 10. Risiken und Mitigationen

|Risiko                              |Wahrscheinlichkeit|Impact |Mitigation                                                        |
|------------------------------------|------------------|-------|------------------------------------------------------------------|
|Teilnehmer verliert Link            |Mittel            |Mittel |Organisator kann Link erneut senden                               |
|Fehlerhafte Telefonnummern          |Hoch              |Niedrig|Validierung + Organisator prüft vor Versand                       |
|Teilnehmer teilt Link               |Niedrig           |Hoch   |Hinweis auf Geheimhaltung, aber technisch nicht verhinderbar      |
|Datenbank-Ausfall                   |Sehr niedrig      |Hoch   |Regelmäßige Backups, zuverlässiger Hosting-Provider               |
|**Organisator öffnet fremde Links** |Mittel            |Hoch   |Klare UI-Kommunikation, nur eigenen Link öffnen                   |
|**Misstrauen in Anonymität**        |Mittel            |Mittel |Transparente Erklärung des Mechanismus, Vertrauensaufbau durch UI |

-----

## 11. Erfolgsmessung

### KPIs (Key Performance Indicators)

- Anzahl erstellter Sessions
- Durchschnittliche Teilnehmerzahl pro Session
- Zeit von Session-Erstellung bis Auslosung
- Fehlerrate bei Auslosungen
- Mobile vs. Desktop Nutzung

### Qualitative Erfolgskriterien

- Organisator schafft Auslosung in unter 5 Minuten
- Keine Support-Anfragen zur Bedienung
- Positive Rückmeldung von Nutzern
- Wiederverwendung im Folgejahr

-----

## 12. Zeitplan und Meilensteine

### Phase 1: MVP (Minimum Viable Product)

**Zeitrahmen:** 2-3 Wochen

- ✅ Session-Erstellung
- ✅ Teilnehmer-Verwaltung
- ✅ Auslosungs-Algorithmus
- ✅ WhatsApp-Link-Generierung
- ✅ Teilnehmer-Ansicht

### Phase 2: Verbesserungen

**Zeitrahmen:** 1 Woche

- ✅ Session-Liste und Verwaltung
- ✅ UI/UX Optimierungen
- ✅ Mobile Optimierung

### Phase 3: Testing & Deployment

**Zeitrahmen:** 1 Woche

- ✅ User Testing mit Testgruppe
- ✅ Bug Fixes
- ✅ Deployment auf Produktionsumgebung

-----

## 13. Anhang

### 13.1 Glossar

- **Wichteln:** Deutsche Weihnachtstradition des anonymen Geschenkeaustauschs
- **Session:** Eine Wichtel-Runde mit definierten Teilnehmern
- **Organisator:** Person, die die Wichtel-Session erstellt und verwaltet
- **Teilnehmer:** Personen, die am Wichteln teilnehmen
- **Auslosung:** Prozess der zufälligen Zuteilung von Schenker zu Beschenktem

### 13.2 Referenzen

- Analysetechnik: User Story Mapping
- Priorisierung: MoSCoW-Methode
- Stakeholder: Organisator der Weihnachtsfeier 2025

-----

## 14. Next Steps

Das PRD ist nun abgeschlossen und bildet die Grundlage für alle weiteren Produktentwicklungsaktivitäten.

### Empfohlene Reihenfolge:

#### Option A: Produkt mit UI (Empfohlen für Wichtel-App)
```
1. UX Design → 2. Technical Architecture → 3. Epics & Stories → 4. Implementation
```

#### Option B: API/Backend ohne UI
```
1. Technical Architecture → 2. Epics & Stories → 3. Implementation
```

### Nächster Workflow: UX Design

**Warum:** Die Wichtel-App ist UI-zentriert (Web-Interface für Organisator und Teilnehmer). UX Design hilft:
- User Flows zu visualisieren
- Wireframes/Mockups zu erstellen
- UI-Komponenten zu identifizieren
- Usability-Probleme früh zu erkennen

**Kommando:** `/bmad:bmm:workflows:ux-design` (falls verfügbar) oder manuell erstellen

### Danach: Technical Architecture

Nach UX Design (oder falls übersprungen):
- System-Design und Technologie-Entscheidungen
- API-Design
- Datenbankschema (bereits im PRD, kann verfeinert werden)
- Deployment-Strategie

**Kommando:** `/bmad:bmm:agents:architect` oder Architecture Workflow

### Abschließend: Epics & Stories

Requirements in implementierbare Stories aufbrechen:
- Epics basierend auf funktionalen Anforderungen
- User Stories mit Akzeptanzkriterien
- Story-Priorisierung für Sprints

**Kommando:** `/bmad:bmm:workflows:create-epics-and-stories`

-----

## 15. Validation Summary

✅ **PRD Validierung abgeschlossen am 2025-12-07**

- **Document Structure:** 89% (8/9 Sektionen komplett)
- **Process Compliance:** 100% (nach Fixes)
- **Validation Report:** `docs/validation-report-20251207.md`

**Status:** APPROVED - Bereit für nächste Phase

-----

**Ende des PRD**
