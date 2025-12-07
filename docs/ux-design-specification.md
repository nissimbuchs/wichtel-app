---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - docs/prd.md
workflowType: ux-design
lastStep: 6
project_name: wichtel-app
user_name: Nissim
date: 2025-12-07
---

# UX Design Specification wichtel-app

**Author:** Nissim
**Date:** 2025-12-07

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

Die Wichtel-App ist eine mobile-first Web-Applikation zur Digitalisierung und Vereinfachung von Wichtel-Auslosungen für Weihnachtsfeiern. Die Vision ist eine schnelle (unter 5 Minuten), unkomplizierte Lösung, die garantierte Anonymität bietet und über mehrere Jahre wiederverwendbar ist. Der Organisator kann zentral Teilnehmer erfassen, eine anonyme Zulosung durchführen und Ergebnisse nahtlos via WhatsApp kommunizieren - während er selbst auch am Wichteln teilnehmen kann.

### Target Users

**Primäre Persona - Der Organisator:**
- Rolle: Organisiert die Weihnachtsfeier und koordiniert das Wichteln
- Technische Affinität: Mittel
- Bedürfnisse: Schnelle, unkomplizierte Lösung ohne aufwendiges Setup
- Kommunikationskanal: WhatsApp (primär mobil)
- Besonderheit: Kann selbst als Teilnehmer am Wichteln teilnehmen

**Sekundäre Persona - Die Teilnehmer:**
- Rolle: Nehmen am Wichteln teil
- Technische Anforderung: Minimal (nur WhatsApp-Link öffnen können)
- Bedürfnis: Einfach und schnell erfahren, wen sie beschenken sollen
- Erwartung: Garantierte Anonymität bis zur Weihnachtsfeier

### Key Design Challenges

1. **Anonymität wahren trotz Organisator-Teilnahme**
   - Der Organisator versendet alle WhatsApp-Nachrichten mit Links, darf aber die Zuteilungen nicht sehen
   - UI muss so gestaltet sein, dass Zuteilungs-Informationen während des Versands verborgen bleiben
   - Der Organisator benötigt seinen eigenen personalisiertes Link, ohne die Zuteilungen anderer Teilnehmer zu kennen
   - Vertrauen schaffen, dass wirklich niemand (auch nicht der Organisator) die Zuteilungen vor der Feier kennt

2. **Mobile-First WhatsApp-Integration**
   - Nahtloser Kontext-Wechsel zwischen App und WhatsApp auf dem Smartphone
   - Mehrmaliges Hin- und Herwechseln (für jeden Teilnehmer einzeln) muss flüssig und ohne Frustration funktionieren
   - Klarer Fortschritt: Welchem Teilnehmer wurde bereits eine Nachricht gesendet?
   - Deep-Link-Handling für native WhatsApp-App auf Mobile

3. **Einfachheit trotz mehrstufigem Workflow**
   - Multi-Step-Flow: Teilnehmer hinzufügen → Auslosung durchführen → WhatsApp-Versand
   - Muss für Nutzer mit mittlerer technischer Affinität sofort verständlich sein
   - Keine Verwirrung oder Unsicherheit bei der Bedienung
   - Klare visuelle Orientierung in jedem Schritt

### Design Opportunities

1. **Delightful Experience durch festliche Gestaltung**
   - Weihnachtliche, freudige Atmosphäre schaffen (ohne kitschig zu werden)
   - Vorfreude auf die Weihnachtsfeier verstärken
   - Emotionale Verbindung zum Wichtel-Ritual stärken
   - Micro-Interactions und festliche visuelle Details

2. **Zero-Friction für Teilnehmer**
   - Ein Klick auf WhatsApp-Link → sofort sehen, wen man beschenkt
   - Keine App-Installation, kein Login, kein Account, kein Aufwand
   - Begeisterung durch radikale Einfachheit
   - Mobile-optimierte Darstellung für sofortiges Verständnis

3. **Vertrauen durch Transparenz der Anonymität**
   - Klar kommunizieren, dass niemand (auch nicht der Organisator) die Zuteilungen im Voraus kennt
   - Sicherheit und Fairness visuell vermitteln
   - Technische Garantien verständlich machen (z.B. "Erst beim Öffnen deines Links siehst du deine Zuteilung")
   - Vertrauen in die Integrität des Wichtel-Prozesses aufbauen

## Core User Experience

### Defining Experience

Die Kern-Erfahrung der Wichtel-App dreht sich um **zwei magische Momente**:

**Für Teilnehmer:** Der animierte Namen-Reveal ist das Herzstück. Wenn ein Teilnehmer seinen persönlichen Link öffnet, startet automatisch eine Animation, bei der alle Teilnehmer-Namen durchlaufen (wie ein festlicher Slot-Machine-Effekt), bevor die Animation beim finalen Namen stoppt - der Person, die sie beschenken sollen. Dieser Moment verwandelt eine simple Information in ein freudiges Erlebnis voller Spannung und Vorfreude.

**Für den Organisator:** Der nahtlose WhatsApp-Versand-Flow ist die kritische Interaktion. Nach der Auslosung erhält der Organisator eine Liste mit WhatsApp-Buttons pro Teilnehmer. Ein Klick öffnet WhatsApp mit vorausgefüllter Nachricht und personalisiertem Link - ready to send. Der Organisator kehrt zur App zurück und wiederholt dies für alle Teilnehmer. Dieser Flow muss absolut reibungslos sein, da er mehrfach wiederholt wird.

**Besonderheit:** Der Organisator kann selbst am Wichteln teilnehmen, ohne die Anonymität zu gefährden. Die UI verhindert, dass Zuteilungen während des Versands sichtbar sind.

### Platform Strategy

**Primary Platform:** Mobile-First Web-Applikation
- Responsive Design für Desktop/Tablet, aber optimiert für Smartphone
- Kein Native App Download erforderlich
- Browser-basiert für sofortigen Zugriff

**Technology Decisions:**
- **Animation:** CSS Animations + JavaScript (Web Animations API oder moderne Bibliotheken wie Framer Motion/GSAP)
- **Performance:** Hardware-beschleunigte Animationen für flüssige 60fps auf modernen Geräten
- **Browser-Support:** Moderne Browser (aktuelle iOS Safari, Android Chrome)
- **Offline:** Nicht erforderlich (einmalige Online-Abfrage)

**Interaction Model:**
- Touch-first Design mit großen, tappbaren Bereichen
- Deep-Link-Integration für native WhatsApp-App
- Nahtloser Kontext-Wechsel zwischen Web-App und WhatsApp

### Effortless Interactions

**Für Teilnehmer:**
1. **Link öffnen → Animation startet automatisch**
   - Kein Button-Klick nötig, keine Wartezeit
   - Sofortige visuelle Magie beim Laden der Seite

2. **Namen-Reveal ist selbsterklärend**
   - Keine Anleitung oder Erklärung erforderlich
   - Animation kommuniziert visuell, was passiert

3. **Mobile-optimierte Darstellung**
   - Perfekt lesbar ohne Zoom oder Scroll
   - Eine-Hand-Bedienung möglich

**Für Organisator:**
1. **WhatsApp-Versand ist ein Klick**
   - Button → WhatsApp öffnet sich → Nachricht ist komplett fertig
   - Zurück zur App erfolgt nahtlos (ohne Datenverlust)

2. **Fortschritt ist immer sichtbar**
   - Visuelle Indikatoren zeigen, welchen Teilnehmern bereits gesendet wurde
   - Checkmarks oder ähnliche Bestätigung nach jedem Versand

3. **Teilnehmer hinzufügen ist schnell**
   - Minimale Eingabefelder: Name + Telefonnummer
   - Sofortiges Feedback, keine komplexen Formulare

**Eliminierte Reibungspunkte:**
- Kein Login/Account für Teilnehmer
- Kein manuelles Link-Kopieren und Einfügen
- Keine separaten Email-Einladungen
- Keine App-Installation

### Critical Success Moments

**1. Der "Aha!"-Moment (Organisator):**
- **Wann:** Nach der Auslosung, wenn die WhatsApp-Buttons erscheinen
- **Erfolg:** "Wow, das ist wirklich so einfach! Ein Klick und alles ist fertig!"
- **Failure Point:** Verwirrung über nächste Schritte oder unklare Bedienung

**2. Der "Magie"-Moment (Teilnehmer):**
- **Wann:** Die Namen-Animation läuft und stoppt beim finalen Namen
- **Erfolg:** "Das macht Spaß! Ich freue mich aufs Geschenke-Suchen!" 🎁
- **Failure Point:** Animation zu lang/langweilig, technische Fehler, oder unklar

**3. Der "Vertrauen"-Moment (Organisator als Teilnehmer):**
- **Wann:** Organisator öffnet seinen eigenen Teilnehmer-Link
- **Erfolg:** "Ich sehe nur MEINE Zuteilung - die Anonymität funktioniert perfekt!"
- **Failure Point:** Versehentliches Sehen anderer Zuteilungen oder Unsicherheit

**4. Der "Fertig!"-Moment (Organisator):**
- **Wann:** Alle WhatsApp-Nachrichten sind versendet
- **Erfolg:** "Das war in unter 5 Minuten erledigt - mega effizient!"
- **Failure Point:** Unklarheit ob alle versendet, oder Prozess zu umständlich

**5. First-Time Success (Organisator):**
- **Wann:** Erste Session-Erstellung ohne Vorkenntnisse
- **Erfolg:** Intuitiv durchkommen ohne Anleitung oder Hilfe suchen
- **Failure Point:** Muss Tutorial suchen oder bricht frustriert ab

### Experience Principles

Diese Prinzipien leiten alle UX-Entscheidungen:

**1. Delight Through Discovery**
*Die Zuteilungs-Enthüllung ist kein simpler Text, sondern ein magischer Moment*

Die animierte Namen-Reveal schafft Spannung und Vorfreude. Teilnehmer erleben die Überraschung als Event, nicht als bloße Information. Die festliche, freudige Atmosphäre verstärkt die Weihnachtsstimmung. Jeder Klick auf einen Link sollte sich wie "Geschenk öffnen" anfühlen.

**2. Invisible Efficiency**
*Geschwindigkeit ohne Opfer der Erfahrung - alles in unter 5 Minuten*

Der Organisator soll Flow erleben, kein mühsames Abarbeiten. WhatsApp-Integration ist nahtlos: Ein Klick → Nachricht fertig. Fortschritt ist immer sichtbar, keine Unsicherheit. Keine unnötigen Schritte, keine Wartezeiten, keine Reibung.

**3. Trust Through Transparency**
*Anonymität ist nicht nur technisch, sondern emotional spürbar*

Die UI verhindert versehentliches Sehen fremder Zuteilungen. Der Organisator kann selbst teilnehmen ohne das Vertrauen zu brechen. Klare Kommunikation: "Niemand kennt die Zuteilungen im Voraus". Technische Garantien werden verständlich vermittelt.

**4. Mobile-Native Simplicity**
*Designed für den Smartphone-Screen, nicht adaptiert*

Touch-first Interaktionen mit großen tappbaren Bereichen. Keine Zoom/Scroll-Notwendigkeit. Funktioniert perfekt während man zwischen Apps wechselt. Eine-Hand-Bedienung möglich.

**5. Zero Cognitive Load**
*Selbsterklärend ohne Anleitung - Intuition schlägt Instruktion*

First-time success ohne Tutorial. Jeder Schritt ist visuell klar und eindeutig. Keine technischen Hürden für Teilnehmer (null Setup). Progressive Disclosure: Nur das zeigen, was gerade relevant ist.

## Desired Emotional Response

### Primary Emotional Goals

**Für Teilnehmer:**
- **Vorfreude & Spannung:** Die Animation schafft einen aufregenden Moment der Enthüllung, ähnlich wie beim Öffnen eines Geschenks
- **Überraschung & Freude:** Der Moment der Namen-Reveal soll ein positives "Aha!"-Erlebnis sein
- **Weihnachtliche Stimmung:** Festlich, warm, gemütlich - emotional verbunden mit der Wichtel-Tradition
- **Einfach & Sorglos:** Kein Stress oder technische Hürden, nur positive Emotionen

**Für Organisator:**
- **Kompetenz & Kontrolle:** Das Gefühl, die Situation souverän im Griff zu haben
- **Effizienz:** Befriedigung durch schnelles, reibungsloses Abschließen der Aufgabe
- **Vertrauen:** Sicherheit, dass die Anonymität für alle (inklusive sich selbst) gewahrt bleibt
- **Zufriedenheit:** Stolz auf erfolgreich organisierte Wichtel-Runde

**Differenzierung von Konkurrenten:**
Die Wichtel-App erzeugt **Delight statt bloßer Funktionalität**. Die animierte Namen-Reveal verwandelt eine einfache Information in ein emotionales Erlebnis. Nutzer erzählen Freunden davon, weil es nicht nur "funktioniert", sondern Spaß macht und überrascht.

### Emotional Journey Mapping

**Teilnehmer-Journey:**

1. **Bei Entdeckung (WhatsApp-Nachricht erhalten):**
   - **Emotion:** Neugier, Vorfreude, Antizipation
   - **Gedanke:** "Oh, eine Nachricht vom Organisator! Das Wichteln beginnt!"
   - **UX-Ziel:** Klare, einladende Nachricht die zum Klicken motiviert

2. **Während Kern-Erfahrung (Animation läuft):**
   - **Emotion:** Spannung, Aufregung, Spielfreude, Kindliche Neugier
   - **Gedanke:** "Die Namen laufen durch... wer wird es sein?"
   - **UX-Ziel:** Animation hält Spannung, aber ist nicht zu lang (2-3 Sekunden optimal)

3. **Nach Abschluss (Name ist enthüllt):**
   - **Emotion:** Überraschung, Freude, Motivation, Vorfreude
   - **Gedanke:** "Ah, Peter! Ich weiß schon, was ich ihm schenken werde! 🎁"
   - **UX-Ziel:** Klare Darstellung des Namens, festliche Bestätigung

4. **Bei technischem Problem:**
   - **Gewünschte Emotion:** Verständnis statt Frustration, Zuversicht statt Angst
   - **UX-Ziel:** Klare, freundliche Fehlermeldung mit Lösungsweg

5. **Bei Rückkehr (Link erneut öffnen):**
   - **Emotion:** Bestätigung, Erinnerung, Kontinuität
   - **Gedanke:** "Ja, ich beschenke immer noch Peter"
   - **UX-Ziel:** Konsistente Information, keine neue Animation (bereits gesehen)

**Organisator-Journey:**

1. **Bei Entdeckung (App öffnen):**
   - **Emotion:** Zuversicht, positive Erwartung, leichte Vorfreude
   - **Gedanke:** "Das wird einfach sein"
   - **UX-Ziel:** Sofort klarer Einstiegspunkt, keine Überforderung

2. **Während Setup (Teilnehmer hinzufügen):**
   - **Emotion:** Flow, Kontrolle, Kompetenz
   - **Gedanke:** "Das geht schnell!"
   - **UX-Ziel:** Reibungsloser Input-Prozess, sofortiges Feedback

3. **Bei Auslosung:**
   - **Emotion:** Kurze Spannung, dann Erleichterung und Vorfreude
   - **Gedanke:** "Fertig! Jetzt nur noch versenden"
   - **UX-Ziel:** Bestätigung der erfolgreichen Auslosung, klare nächste Schritte

4. **Während WhatsApp-Versand:**
   - **Emotion:** Effizienz, Rhythmus, Flow-Gefühl
   - **Gedanke:** "Klick, klick, klick... läuft!"
   - **UX-Ziel:** Nahtlose Wiederholung, sichtbarer Fortschritt

5. **Nach Abschluss:**
   - **Emotion:** Zufriedenheit, Stolz, Erleichterung, Erfüllung
   - **Gedanke:** "Das war so viel einfacher als letztes Jahr! ✅"
   - **UX-Ziel:** Klare Abschluss-Bestätigung, positive Verstärkung

### Micro-Emotions

**Vertrauen vs. Skepsis:**
- **Kritisch für:** Organisator als Teilnehmer
- **Ziel:** Vollständiges Vertrauen in die Anonymität aufbauen
- **Design-Ansatz:**
  - Explizite Kommunikation: "Niemand (auch nicht der Organisator) kennt die Zuteilungen im Voraus"
  - UI verhindert versehentliches Sehen fremder Zuteilungen
  - Transparente Erklärung des Anonymitäts-Mechanismus

**Vorfreude vs. Ungeduld:**
- **Kritisch für:** Teilnehmer während Animation
- **Ziel:** Spannung aufbauen ohne zu langweilen
- **Design-Ansatz:**
  - Animation dauert 2-3 Sekunden (sweet spot)
  - Visuell ansprechend und dynamisch
  - Klarer Endpunkt erkennbar

**Kompetenz vs. Überforderung:**
- **Kritisch für:** Organisator beim ersten Durchlauf
- **Ziel:** Nutzer fühlt sich kompetent und im Kontroll
- **Design-Ansatz:**
  - Self-explanatory UI ohne Tutorial-Notwendigkeit
  - Progressive Disclosure: Nur zeigen, was jetzt relevant ist
  - Klare visuelle Hierarchie und Orientierung

**Freude vs. bloße Zufriedenheit:**
- **Kritisch für:** Gesamte User Experience
- **Ziel:** Delight kreieren, nicht nur "funktioniert"
- **Design-Ansatz:**
  - Animierte Namen-Reveal als Highlight
  - Festliche, weihnachtliche Gestaltung
  - Micro-Interactions und visuelle Details
  - Überraschungsmomente einbauen

**Effizienz vs. Hektik:**
- **Kritisch für:** Organisator während WhatsApp-Versand
- **Ziel:** Schnell, aber nicht gehetzt fühlen
- **Design-Ansatz:**
  - One-Click WhatsApp-Integration
  - Sichtbarer Fortschritt (wer wurde bereits benachrichtigt?)
  - Rhythmisches, flüssiges Tempo

### Design Implications

**Emotion → UX Design Verbindungen:**

**1. Vorfreude & Spannung (Teilnehmer):**
- **Animation-Design:** Slot-Machine-ähnlicher Effekt mit durchlaufenden Namen
- **Timing:** 2-3 Sekunden Animation für optimale Spannungskurve
- **Sound (optional):** Leichter Sound-Effect beim Stoppen der Animation
- **Visual Design:** Festliche Farben und Bewegung

**2. Vertrauen (Organisator):**
- **Information Architecture:** Klare Trennung zwischen "Meine Zuteilung" und "Teilnehmer-Liste"
- **Copy:** Explizite Bestätigungen wie "Deine Zuteilung ist nur für dich sichtbar"
- **Visual Cues:** Icons oder Symbole für "verschlossene" Information
- **Transparency:** Kurze Erklärung des Anonymitäts-Mechanismus

**3. Effizienz (Organisator):**
- **WhatsApp-Integration:** wa.me URL mit pre-filled message
- **Progress Indicators:** Checkmarks bei versendeten Teilnehmern
- **Single-Page Flow:** Kein unnötiges Navigieren zwischen Screens
- **Feedback:** Sofortige visuelle Bestätigung nach jeder Aktion

**4. Freude (Beide User-Gruppen):**
- **Festive Design:** Weihnachtliche Farbpalette (ohne kitschig zu wirken)
- **Micro-Interactions:** Subtile Animationen bei Hover/Tap
- **Celebration Moments:** Confetti oder ähnlicher Effect nach Auslosung
- **Copywriting:** Freundlich, persönlich, festlich

**5. Kompetenz (Organisator):**
- **Visual Hierarchy:** Klare Schritt-für-Schritt Führung
- **Empty States:** Hilfreiche Placeholder-Texte
- **Validation:** Inline-Validierung bei Formular-Eingaben
- **Error Prevention:** Confirmation Dialogs bei kritischen Aktionen

### Emotional Design Principles

**1. Surprise Over Routine**
*Verwandle Routine-Informationen in unvergessliche Momente*

Die Namen-Enthüllung ist keine statische Anzeige, sondern ein animiertes Erlebnis. Selbst wiederholte Aktionen (wie WhatsApp-Versand) sollten sich flüssig und angenehm anfühlen, nicht mechanisch.

**2. Trust Through Clarity**
*Vertrauen entsteht durch transparente Kommunikation, nicht durch Verschleierung*

Anonymität wird nicht nur technisch garantiert, sondern emotional spürbar gemacht. Nutzer verstehen WARUM und WIE ihre Daten geschützt sind.

**3. Efficiency Without Sterility**
*Schnelligkeit darf nicht auf Kosten der Freude gehen*

Der 5-Minuten-Flow bedeutet nicht spartanisches Design. Effizienz wird durch durchdachte UX erreicht, während visuelle Freude erhalten bleibt.

**4. Celebration of Small Wins**
*Jeder abgeschlossene Schritt ist ein Erfolg*

Positive Verstärkung nach jedem Meilenstein: Teilnehmer hinzugefügt ✓, Auslosung durchgeführt ✓, Nachricht versendet ✓. Nutzer fühlen kontinuierlichen Fortschritt.

**5. Emotional Continuity**
*Von der ersten Interaktion bis zum Abschluss bleibt die emotionale Tonalität konsistent*

Festlich, freundlich, einladend - durchgehend. Keine abrupten Wechsel von warm zu kalt, von verspielt zu technisch. Die Weihnachtsstimmung zieht sich durch alle Touchpoints.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Duolingo:**
- **Animation & Gamification:** Belohnungen durch Animationen, Confetti-Effekte bei Erfolgen
- **Spannung & Reveal:** Progress-Animationen die Erfolg visuell feiern
- **Emotional Design:** Freude durch visuelle Feedback-Loops
- **Micro-Interactions:** Jede Aktion fühlt sich belohnend an

### Transferable UX Patterns

**Von Duolingo übernehmen:**
- **Celebration Animations:** Confetti/visuelle Belohnung nach Auslosung
- **Progress Indicators:** Klare visuelle Bestätigung für jeden abgeschlossenen Schritt
- **Delightful Feedback:** Jede Aktion bekommt visuelles Feedback
- **Slot-Machine Animation:** Namen-Reveal ähnlich wie Duolingo's Progress-Animationen

### Anti-Patterns to Avoid

- **Zu lange Animationen:** Duolingo hält sie kurz (1-3 Sek) - wir auch
- **Überladenes UI:** Fokus auf eine Aktion zur Zeit
- **Versteckte Next Steps:** Immer klar was als nächstes kommt

### Design Inspiration Strategy

**Adopt:** Celebration animations, kurze impact-volle Animationen, visuelles Feedback
**Adapt:** Duolingo's Gamification auf festliche Weihnachts-Ästhetik anpassen
**Avoid:** Komplexität, zu viele gleichzeitige Animationen

## Design System Choice

### Selected Approach

**Themeable System: Tailwind CSS**

**Rationale:**
- Mobile-first responsive design out of the box
- Schnelle Entwicklung mit Utility-first approach
- Vollständige Flexibilität für festliche Weihnachts-Anpassungen
- Hervorragende Performance (keine Runtime CSS)
- Modern, weit verbreitet, große Community

**Benefits for wichtel-app:**
- Einfache Anpassung der Farbpalette für Weihnachtsthema
- Responsive Design ohne zusätzlichen Aufwand
- Schnelle Prototyping-Möglichkeiten
- Keine Lizenzkosten
- Perfekt für Animation-Integration (mit Framer Motion/GSAP)

## UX Patterns für Anonymitäts-Garantie

### Multi-Layer Defense in der UI

**Problem:** Organisator als Teilnehmer darf KEINE fremden Zuteilungen sehen, auch nicht versehentlich.

**UX Strategy (Aligned mit Architecture):**

#### **1. Admin-Interface: Zero Assignment Visibility**

**UI Pattern:** Progressive Disclosure - Nur relevante Information zeigen

```
✅ ZEIGE im Admin nach Auslosung:
┌────────────────────────────────────┐
│ Auslosung erfolgreich! 🎉          │
│                                    │
│ Nächster Schritt:                 │
│ Sende allen Teilnehmern ihren Link│
│                                    │
│ ✓ Max Mustermann                  │
│   [📱 WhatsApp öffnen]            │
│                                    │
│ Anna Schmidt                       │
│   [📱 WhatsApp öffnen]            │
│                                    │
│ Peter (Du selbst)                  │
│   [📱 WhatsApp öffnen]            │
└────────────────────────────────────┘

❌ ZEIGE NIEMALS:
- "Wer beschenkt wen"-Übersicht
- Assignment-Details in Teilnehmer-Liste
- Zuteilungs-Matrix oder Graphen
```

#### **2. Vertrauens-Aufbau: Transparente Kommunikation**

**UI Pattern:** Proaktive Klarstellung VOR der Auslosung

```
┌────────────────────────────────────┐
│ Auslosung durchführen?             │
│                                    │
│ ℹ️ Wichtig:                        │
│ Auch DU wirst erst beim Öffnen    │
│ deines eigenen Links sehen, wen   │
│ du beschenkst. Niemand (auch      │
│ nicht du als Organisator) kennt   │
│ die Zuteilungen im Voraus.        │
│                                    │
│ [Verstanden, Auslosung starten]   │
│ [Abbrechen]                        │
└────────────────────────────────────┘
```

#### **3. Visual Cues: Eigenen Status kennzeichnen**

**UI Pattern:** Subtle Differenzierung ohne Sonderbehandlung

```
Teilnehmer-Liste nach Auslosung:

✓ Max Mustermann    [📱 WhatsApp]
  Anna Schmidt      [📱 WhatsApp]
✓ Peter (Du) 👤     [📱 WhatsApp]  ← Icon zeigt "das bist du"
  Maria Müller      [📱 WhatsApp]
```

**Design Rationale:**
- 👤 Icon signalisiert "das bist du"
- ABER: Keine funktionale Unterscheidung
- Gleicher Button, gleicher Flow wie alle anderen

#### **4. Self-Send Confirmation: Besondere Aufmerksamkeit**

**UI Pattern:** Bestätigung vor Selbst-Versand

```
┌────────────────────────────────────┐
│ An dich selbst senden?             │
│                                    │
│ Du sendest jetzt WhatsApp an       │
│ deine eigene Nummer.               │
│                                    │
│ 💡 Tipp: Öffne den Link später,   │
│ um zu sehen, wen du beschenkst.   │
│                                    │
│ [Ja, an mich senden]              │
│ [Überspringen]                     │
└────────────────────────────────────┘
```

#### **5. Error Prevention: Kein Peek-Mode**

**Anti-Pattern:** NIEMALS diese Features bauen:

❌ "Vorschau"-Button für Organisator
❌ "Alle Zuteilungen anzeigen" (auch nicht hinter Admin-Passwort)
❌ Debug-Mode der Assignments zeigt
❌ Hover-Tooltips mit Assignment-Info
❌ Console.logs mit Assignment-Daten

**Stattdessen:**
✅ TypeScript Interfaces ohne `assigned_to_id` für Admin-Views
✅ Explizite SELECT-Queries ohne Assignment-Feld
✅ Code-Reviews für versehentliche Datenleaks

#### **6. Positive Reinforcement: Trust-Building Micro-Copy**

**UI Pattern:** Kontinuierliche Bestätigung der Anonymität

```
Nach erfolgreichem WhatsApp-Versand an alle:

┌────────────────────────────────────┐
│ ✅ Alle Nachrichten versendet!     │
│                                    │
│ Jeder Teilnehmer (inklusive du)   │
│ hat jetzt seinen persönlichen     │
│ Link erhalten.                     │
│                                    │
│ 🔒 Niemand kennt die Zuteilungen  │
│ bis zum Öffnen des eigenen Links. │
│                                    │
│ [Fertig]                           │
└────────────────────────────────────┘
```

### Design Validation Checklist

**Vor der Implementierung prüfen:**

- [ ] Admin-UI zeigt NIEMALS `assigned_to_id` Daten
- [ ] TypeScript Types erzwingen Assignment-Ausschluss
- [ ] Bestätigungs-Dialog vor Auslosung erklärt Anonymität
- [ ] Self-Send hat spezielle Bestätigung
- [ ] Micro-Copy verstärkt Vertrauen durchgehend
- [ ] Keine "Peek"-Features oder Debug-Modi
- [ ] Organisator-Teilnahme ist visuell gekennzeichnet aber funktional identisch
