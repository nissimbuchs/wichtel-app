# Epic & Story Reihenfolge - Validierungsbericht

**Dokument:** docs/epics.md
**Datum:** 2025-12-07
**Validiert von:** Winston (Architect Agent)
**Status:** ⚠️ KORREKTUREN ERFORDERLICH

---

## Executive Summary

Die **Epic-Reihenfolge ist logisch korrekt**, aber es gibt **kritische Story-Reihenfolge-Probleme** in Epic 1 und fehlende Foundation Stories.

**Overall Score:** 85/100

- ✅ Epic-Reihenfolge: 100% korrekt
- ⚠️ Story-Reihenfolge Epic 1: Fehler gefunden
- ✅ Story-Reihenfolge Epic 2-5: Korrekt
- ❌ Foundation Stories: Fehlen in Epic-Struktur

---

## 1. Epic-Reihenfolge Analyse

### ✅ KORREKT: Epic-Reihenfolge ist logisch

```
Epic 1: Session-Setup & Teilnehmer-Management
  ↓ (erstellt Teilnehmer)
Epic 2: Anonyme Auslosung mit Organisator-Teilnahme
  ↓ (erstellt Assignments + Tokens)
Epic 3: WhatsApp-Integration & Link-Versand
  ↓ (versendet Links)
Epic 4: Teilnehmer Namen-Reveal Experience
  ↓ (Teilnehmer öffnen Links)
Epic 5: Session-Verwaltung & Wiederverwendbarkeit
```

**Begründung:**
- Jedes Epic baut auf dem vorherigen auf
- Klare Abhängigkeitskette
- Keine zirkulären Dependencies
- MVP-Logik (Epic 1-4) vor Nice-to-Have (Epic 5)

---

## 2. Story-Reihenfolge pro Epic

### Epic 1: Session-Setup & Teilnehmer-Management

**Status:** ❌ FEHLER GEFUNDEN

#### Aktuell:
```
1.1 Session-Erstellung initiieren
1.2 Teilnehmer hinzufügen
1.3 Teilnehmer-Liste anzeigen ← Problem!
1.4 Eigene Teilnahme als Organisator ← Problem!
1.5 Teilnehmer entfernen
1.6 Mindest-Teilnehmer-Validierung
```

#### ❌ Problem:

**Story 1.3** zeigt bereits Teilnehmer-Liste mit **Organisator-Highlighting** ("Du" Label, 👤 Icon, gelber Background), aber die **Logik dafür wird erst in Story 1.4 implementiert!**

**Betroffene Akzeptanzkriterien in Story 1.3:**
```
- [ ] Wenn Organisator selbst Teilnehmer ist: Highlight mit 👤 Icon und "Du" Label
- [ ] Organisator-Eintrag hat subtil anderen Background (z.B. #fff3e0)
```

Diese Features benötigen:
- `participants.is_organizer` Flag (definiert in Story 1.4)
- Organisator-Detection-Logik (implementiert in Story 1.4)

#### ✅ Empfohlene Reihenfolge:

```
1.1 Session-Erstellung initiieren ✅
1.2 Teilnehmer hinzufügen ✅
1.4 Eigene Teilnahme als Organisator (VORHER!)
    → Implementiert is_organizer Flag
    → Implementiert Detection-Logik
1.3 Teilnehmer-Liste anzeigen
    → Nutzt is_organizer für Highlighting
1.5 Teilnehmer entfernen ✅
1.6 Mindest-Teilnehmer-Validierung ✅
```

**Auswirkung:** CRITICAL - ohne Korrektur führt Story 1.3 zu unvollständiger Implementierung

---

### Epic 2: Anonyme Auslosung

**Status:** ✅ KORREKT

```
2.1 Auslosungs-Bestätigung mit Anonymitäts-Aufklärung ✅
2.2 Derangement-Algorithmus Implementierung ✅
2.3 Unique Participant-Token Generierung ✅
2.4 Auslosung erfolgreich - Admin UI ohne Assignments ✅
```

**Hinweis:** Story 2.3 könnte technisch als **Subtask von Story 2.2** implementiert werden, da Token-Generierung Teil des Auslosungs-Prozesses ist. Aktuelle Aufteilung ist aber akzeptabel.

---

### Epic 3: WhatsApp-Integration

**Status:** ✅ KORREKT

```
3.1 WhatsApp Deep-Link Generierung ✅
3.2 WhatsApp-Button pro Teilnehmer ✅
3.3 Self-Send Confirmation Dialog ✅
3.4 Versand-Progress Tracking ✅
3.5 Completion Message mit Trust-Building ✅
```

**Flow ist perfekt:**
- 3.1 erstellt Deep-Links
- 3.2 nutzt 3.1 für Buttons
- 3.3 nutzt 3.2 für Organisator-Detection
- 3.4 trackt Status von 3.2
- 3.5 zeigt Completion basierend auf 3.4

---

### Epic 4: Teilnehmer Namen-Reveal

**Status:** ✅ KORREKT

```
4.1 Reveal-Page mit Token-Validierung ✅
4.2 Slot-Machine Namen-Animation ✅
4.3 Festliches Reveal-Page Design ✅
4.4 Wiederholtes Öffnen ohne erneute Animation ✅
```

**Hinweis:** Story 4.2 (Animation) und 4.3 (Design) können **parallel entwickelt werden**, da sie unterschiedliche Aspekte betreffen (Interaction vs Visual Design).

---

### Epic 5: Session-Verwaltung

**Status:** ✅ KORREKT

```
5.1 Session-Liste für Organisator ✅
5.2 Session aus Vorjahr kopieren ✅ (benötigt 5.1)
5.3 Session archivieren ✅ (benötigt 5.1)
```

**Abhängigkeiten klar:**
- 5.2 und 5.3 benötigen beide 5.1 (Session-Liste als Basis)

---

## 3. Foundation Stories Problem

### ❌ KRITISCH: Foundation Stories fehlen in Epic-Struktur

Am Ende des Dokuments stehen:

```
Foundation Story: Supabase Setup & Database Schema (8 Points)
Foundation Story: Next.js + Tailwind Setup (3 Points)
Foundation Story: Supabase Auth Integration (5 Points)
```

**Problem:**
- Diese Stories sind **MUST HAVE** und müssen **VOR Epic 1** implementiert werden
- Sie sind nicht in die Epic-Struktur integriert
- Keine klare Priorisierung

**Abhängigkeiten:**
- **Epic 1** benötigt: Supabase Setup + DB Schema
- **Epic 1** benötigt: Next.js + Tailwind
- **Epic 1 (Story 1.1)** benötigt: Auth Integration (Organisator muss eingeloggt sein)

### ✅ Empfohlene Lösung:

**Option A: Erstelle "Epic 0: Technical Foundation"**

```
Epic 0: Technical Foundation
├── Story 0.1: Supabase Setup & Database Schema (8 Points)
├── Story 0.2: Next.js + Tailwind Setup (3 Points)
└── Story 0.3: Supabase Auth Integration (5 Points)

Epic 1: Session-Setup & Teilnehmer-Management
...
```

**Option B: Integriere als Story 1.0 in Epic 1**

```
Epic 1: Session-Setup & Teilnehmer-Management
├── Story 1.0: Foundation Setup (16 Points TOTAL)
│   ├── Subtask: Supabase Setup & DB Schema
│   ├── Subtask: Next.js + Tailwind Setup
│   └── Subtask: Auth Integration
├── Story 1.1: Session-Erstellung initiieren
...
```

**Empfehlung:** **Option A** ist besser, da Foundation klar getrennt und in Sprint 0 abgearbeitet werden kann.

---

## 4. Story-Parallelisierungsmöglichkeiten

Einige Stories können **parallel entwickelt werden**, um Entwicklungszeit zu sparen:

### Epic 1:
- Story 1.2 + 1.4 können parallel entwickelt werden (beide fügen Teilnehmer hinzu)

### Epic 2:
- Story 2.2 + 2.3 könnten kombiniert werden (Token-Gen ist Teil der Auslosung)

### Epic 4:
- Story 4.2 (Animation) + 4.3 (Design) können parallel entwickelt werden

---

## 5. Empfohlene Änderungen

### 🔴 CRITICAL (Must Fix):

1. **Epic 1: Verschiebe Story 1.4 VOR Story 1.3**
   ```diff
   Epic 1:
   1.1 Session-Erstellung
   1.2 Teilnehmer hinzufügen
   - 1.3 Teilnehmer-Liste anzeigen
   + 1.4 Eigene Teilnahme als Organisator
   + 1.3 Teilnehmer-Liste anzeigen
   - 1.4 Eigene Teilnahme als Organisator
   1.5 Teilnehmer entfernen
   1.6 Mindest-Teilnehmer-Validierung
   ```

2. **Erstelle Epic 0: Technical Foundation**
   ```diff
   + Epic 0: Technical Foundation
   +   Story 0.1: Supabase Setup & Database Schema (8 Points)
   +   Story 0.2: Next.js + Tailwind Setup (3 Points)
   +   Story 0.3: Supabase Auth Integration (5 Points)

   Epic 1: Session-Setup & Teilnehmer-Management
   ...
   ```

### 🟡 NICE TO HAVE (Optional):

3. **Kombiniere Story 2.2 + 2.3** (Token-Generierung als Teil der Auslosung)

4. **Markiere parallelisierbare Stories** im Dokument

---

## 6. Sprint-Planung Auswirkung

### Vorher (mit Fehlern):

```
Sprint 1:
- Foundation Stories (unklar wo)
- Epic 1 Stories (1.1 - 1.6)
  → Story 1.3 blockiert ohne 1.4 Logik!
```

### Nachher (mit Korrekturen):

```
Sprint 0:
- Epic 0: Foundation (Stories 0.1-0.3)

Sprint 1:
- Epic 1: Session-Setup (Stories 1.1, 1.2, 1.4, 1.3, 1.5, 1.6)
  → Story 1.3 kann jetzt is_organizer Logik nutzen ✅

Sprint 2:
- Epic 2: Auslosung (Stories 2.1-2.4)

Sprint 3:
- Epic 3: WhatsApp (Stories 3.1-3.5)

Sprint 4:
- Epic 4: Reveal (Stories 4.1-4.4)

Sprint 5:
- Epic 5: Session-Verwaltung (Stories 5.1-5.3)
```

---

## 7. Validation Checklist

| Check | Status | Kommentar |
|-------|--------|-----------|
| Epic-Reihenfolge logisch | ✅ PASS | Perfekt sequentiell |
| Epic 1 Story-Reihenfolge | ❌ FAIL | Story 1.4 muss vor 1.3 |
| Epic 2 Story-Reihenfolge | ✅ PASS | Korrekt |
| Epic 3 Story-Reihenfolge | ✅ PASS | Korrekt |
| Epic 4 Story-Reihenfolge | ✅ PASS | Korrekt |
| Epic 5 Story-Reihenfolge | ✅ PASS | Korrekt |
| Foundation Stories integriert | ❌ FAIL | Fehlen in Epic-Struktur |
| Abhängigkeiten dokumentiert | ⚠️ PARTIAL | Könnte expliziter sein |
| Parallelisierung möglich | ⚠️ PARTIAL | Nicht dokumentiert |

---

## 8. Recommendations Summary

### Must Fix (vor Entwicklung):
1. ✅ Epic 1: Story 1.4 vor 1.3 verschieben
2. ✅ Foundation Stories als Epic 0 erstellen

### Should Consider:
3. Story 2.2 + 2.3 kombinieren (optional)
4. Parallelisierbare Stories markieren
5. Abhängigkeiten explizit dokumentieren in jedem Epic

### Nice to Have:
6. Story-Dependencies Diagramm erstellen
7. Sprint-Allocation vorschlagen

---

## 9. Approval Status

**Status:** ⚠️ **KORREKTUREN ERFORDERLICH**

**Nächste Schritte:**
1. Korrigiere Epic 1 Story-Reihenfolge (1.4 vor 1.3)
2. Erstelle Epic 0 für Foundation Stories
3. Update docs/epics.md
4. Re-validate mit diesem Checklist

**Nach Korrekturen:** Dokument ist bereit für Sprint-Planning und Entwicklung.

---

**Bericht Ende**

*Validiert von Winston (Architect Agent) am 2025-12-07*
