# i18n Implementation - Fortsetzungsplan

**Stand:** Phase 1-2 komplett, Phase 3 begonnen
**Datum:** 2025-12-11

## ✅ Abgeschlossen

### Phase 1: Foundation Setup
- [x] next-intl installiert (`npm install next-intl`)
- [x] `/i18n.ts` Konfiguration erstellt
- [x] `next.config.mjs` mit next-intl Plugin erweitert
- [x] Middleware umgeschrieben (i18n + Supabase Chain)
- [x] App-Struktur auf `[locale]/` umgestellt
- [x] Root Layout angepasst
- [x] Locale Layout erstellt (`app/[locale]/layout.tsx`)
- [x] Alle Pages nach `app/[locale]/` verschoben

### Phase 2: Translation Files
- [x] `locales/de.json` - Alle ~150 Strings
- [x] `locales/fr.json` - Vollständig übersetzt
- [x] `locales/it.json` - Vollständig übersetzt
- [x] `locales/en.json` - Vollständig übersetzt

### Phase 3: Pages Migration (TEILWEISE)
- [x] Landing Page (`app/[locale]/page.tsx`) - FERTIG als Referenz-Beispiel

## 🚧 Verbleibende Arbeit

### Phase 3: Pages Migration (6 verbleibend)

#### 1. Login Page - `app/[locale]/login/page.tsx`
**Pattern:**
```typescript
import { getTranslations } from 'next-intl/server'
import { useLocale } from 'next-intl' // für Client Components

// Server Component
const t = await getTranslations('auth.login')

// Client Component
const t = useTranslations('auth.login')
```

**Zu ersetzende Strings (13):**
- Titel: "Organisiere dein Wichteln..."
- Labels: emailLabel, emailPlaceholder
- Buttons: submitButton, submittingButton
- Info-Text: infoText
- Success Message: successMessage (mit {browserName} Interpolation)
- Error Messages: auth.errors.* (expiredLink, wrongBrowser, expired, invalid, used)

**Wichtig:** Browser-Name-Detection mit Locale kombinieren für successMessage

#### 2. Dashboard - `app/[locale]/app/page.tsx`
**Zu ersetzende Strings (13):**
- dashboard.title, subtitle
- Navigation: showActive, showArchive, newSession, logout
- Status badges: common.status.* (planning, drawn, completed, archived)
- Empty states: dashboard.empty.*
- Session info mit Pluralisierung: `{count, plural, =0 {...} one {...} other {...}}`

#### 3. Session New - `app/[locale]/app/session/new/page.tsx`
**Zu ersetzende Strings (9):**
- session.new.* (title, nameLabel, namePlaceholder, nameHelp, partnerExclusion, etc.)
- Default name mit Jahr: `t('session.new.defaultName', { year: currentYear })`

#### 4. Session Detail - `app/[locale]/app/session/[id]/page.tsx`
**Zu ersetzende Strings (30+):**
- session.* (title, sessionInfo, actions, sections, alerts, modals)
- Alert messages: Benutze `window.confirm(t('session.participant.confirmDelete', { name }))`
- Modal content: session.modals.duplicate.*, session.modals.delete.*

#### 5. Reveal Page - `app/[locale]/reveal/[token]/page.tsx`
**Zu ersetzende Strings (8):**
- reveal.* (loading, error, errorContact, errors, greeting, label, reminder)
- Funny names: reveal.funnyNames.*
- Error handling mit Interpolation

#### 6. Auth Callback - `app/auth/callback/route.ts`
**BLEIBT UNVERÄNDERT** - API Route außerhalb [locale]

---

### Phase 4: Components Migration (11 Components)

#### Pattern für Client Components:
```typescript
'use client'
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('session.participant')
  return <button>{t('addButton')}</button>
}
```

#### Components Liste:

1. **`components/sessions/ParticipantList.tsx`** (3 Strings)
   - removeButton, confirmDelete, confirmDeleteWithPartner, partnerInfo, organizerBadge

2. **`components/sessions/ParticipantForm.tsx`** (10 Strings)
   - session.participant.* (alle Form-Labels, Placeholders, Validation Errors)
   - Wichtig: Phone validation errors mit Name interpolation

3. **`components/sessions/DrawButton.tsx`** (2 Strings)
   - session.draw.buttonEnabled, buttonDisabled

4. **`components/sessions/DrawConfirmationModal.tsx`** (8 Strings)
   - session.draw.modal.* (title, important, info1, info2, partnerInfo, cancel, confirm)

5. **`components/sessions/WhatsAppList.tsx`** (16 Strings)
   - whatsapp.* (title, subtitle, statusSent, statusViewed, buttons)
   - Timestamps mit `useFormatter()` formatieren

6. **`components/sessions/CompletionModal.tsx`** (4 Strings)
   - whatsapp.completion.*

7. **`components/sessions/SelfSendConfirmationModal.tsx`** (4 Strings)
   - whatsapp.selfSend.*

8. **`components/reveal/SlotMachineReveal.tsx`** (7 Strings)
   - reveal.* (sessionName, greeting, label, reminder, alreadySeen, funnyNames)

9. **`components/layout/Footer.tsx`** (3 Strings)
   - footer.* (appName, tagline, copyright, message, buildLabel)

---

### Phase 5: WhatsApp Service Mehrsprachig

#### 1. Database Migration
**Datei:** `supabase/migrations/20251211_add_language_to_sessions.sql`

```sql
-- Add language column to sessions (organizer's language)
ALTER TABLE sessions ADD COLUMN language VARCHAR(2) DEFAULT 'de';

-- Add index for performance
CREATE INDEX idx_sessions_language ON sessions(language);
```

**Ausführen:** `supabase db push` oder via Supabase Dashboard

#### 2. WhatsApp Service erweitern
**Datei:** `services/whatsappService.ts`

```typescript
const WHATSAPP_MESSAGES = {
  de: (name: string, sessionName: string, url: string) =>
    `Hallo ${name}! 🎄\n\nHier ist dein Link für ${sessionName}:\n${url}\n\nÖffne den Link, um zu sehen, wen du beschenkst! 🎁`,
  fr: (name: string, sessionName: string, url: string) =>
    `Bonjour ${name}! 🎄\n\nVoici ton lien pour ${sessionName}:\n${url}\n\nOuvre le lien pour voir à qui tu offres un cadeau! 🎁`,
  // ... it, en
}

export function generateWhatsAppUrl(
  participant: ParticipantAdmin,
  assignmentUrl: string,
  sessionName: string = '',
  locale: 'de' | 'fr' | 'it' | 'en' = 'de'
): string {
  const messageFunc = WHATSAPP_MESSAGES[locale] || WHATSAPP_MESSAGES.de
  const message = messageFunc(participant.name, sessionName, assignmentUrl)
  // ... rest
}
```

#### 3. Session Creation updaten
**Datei:** `app/[locale]/app/session/new/page.tsx`

Bei Session-Erstellung: aktuelle Locale speichern
```typescript
const locale = useLocale()

const { data, error } = await supabase
  .from('sessions')
  .insert({
    name: sessionName,
    organizer_id: user.id,
    language: locale, // WICHTIG: Locale speichern
  })
```

#### 4. WhatsApp Sending updaten
**Datei:** `components/sessions/WhatsAppList.tsx`

Session-Language lesen und an generateWhatsAppUrl übergeben

---

### Phase 6: Email Template Mehrsprachig

#### 1. Login Flow updaten
**Datei:** `app/[locale]/login/page.tsx`

```typescript
const locale = useLocale()

const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    shouldCreateUser: true,
    data: {
      language: locale, // Sprache in User Metadata speichern
    }
  },
})
```

#### 2. Email Template mit Go Conditionals
**Datei:** `supabase/email-templates/magic-link.html`

Template-Struktur:
```html
{{ if eq .Data.language "de" }}
  <h2>Willkommen zurück!</h2>
  <p>Klicke auf den Button unten, um dich anzumelden:</p>
  <a href="{{ .ConfirmationURL }}">Jetzt anmelden</a>
{{ else if eq .Data.language "fr" }}
  <h2>Bienvenue!</h2>
  <!-- ... -->
{{ else if eq .Data.language "it" }}
  <!-- ... -->
{{ else }}
  <!-- EN als default -->
{{ end }}
```

**Upload:** Manuell in Supabase Dashboard → Authentication → Email Templates

---

### Phase 7: Language Switcher & Polish

#### 1. Language Switcher Component
**Neue Datei:** `components/layout/LanguageSwitcher.tsx`

```typescript
'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function changeLanguage(newLocale: string) {
    // Remove current locale from path
    const segments = pathname.split('/').filter(Boolean)
    const isLocaleInPath = ['de', 'fr', 'it', 'en'].includes(segments[0])
    const pathWithoutLocale = isLocaleInPath
      ? '/' + segments.slice(1).join('/')
      : pathname

    // Add new locale (unless it's 'de', which has no prefix)
    const newPath = newLocale === 'de'
      ? pathWithoutLocale
      : `/${newLocale}${pathWithoutLocale}`

    router.push(newPath)
  }

  return (
    <div className="flex gap-2">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded ${
            locale === lang.code
              ? 'bg-christmas-red text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
          title={lang.label}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  )
}
```

#### 2. Switcher einbinden
- Dashboard Navigation
- Landing Page Header
- Login Page (optional)

#### 3. Metadata lokalisieren
**Datei:** `app/[locale]/layout.tsx`

```typescript
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    title: t('title'),
    description: t('description'),
    // ...
  }
}
```

#### 4. Date/Time Formatting
Überall wo Dates formatiert werden:
```typescript
import { useFormatter } from 'next-intl'

const format = useFormatter()
const formattedDate = format.dateTime(date, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
```

---

## 🧪 Testing Checklist

Nach jeder Phase testen:

### Functional Tests
- [ ] Landing Page lädt in DE (default)
- [ ] `/fr`, `/it`, `/en` URLs funktionieren
- [ ] Reveal Links werden zu `/de/reveal/[token]` umgeleitet
- [ ] Login sendet Email in korrekter Sprache
- [ ] Session-Erstellung speichert Sprache
- [ ] WhatsApp-Nachrichten in Session-Sprache
- [ ] Language Switcher ändert URL und Content

### Browser Tests
- [ ] Chrome: Accept-Language Detection
- [ ] Safari: Language Detection
- [ ] Firefox: Language Detection

### Edge Cases
- [ ] `/app` (ohne Locale) = Deutsch
- [ ] Ungültige Locale in URL → 404
- [ ] Fehlende Translation → Fallback zu DE

---

## 📝 Nützliche Befehle

```bash
# Dev Server starten
npm run dev

# Build testen
npm run build

# Supabase Migration
supabase db push

# TypeScript Types regenerieren
supabase gen types typescript --local > types/database.types.ts
```

---

## 🎯 Nächste Session: Start hier

1. **Server Status prüfen:** `npm run dev` läuft?
2. **Phase 3 fortsetzen:** Login Page migrieren
3. **Nach jeder Page:** Browser-Test in DE/FR/IT/EN
4. **Bei Fehlern:** Translation Keys in JSON prüfen
5. **Nach Phase 3:** Phase 4 (Components) starten

**Pattern-Referenz:** Landing Page (`app/[locale]/page.tsx`) ist vollständig migriert als Beispiel.
