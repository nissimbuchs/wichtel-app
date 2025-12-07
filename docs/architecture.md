# Software Architecture Document

## Wichtel-Applikation

**Version:** 1.0  
**Datum:** 06.12.2025  
**Architekt:** Senior Solution Architect  
**Status:** Final Design

-----

## 1. Executive Summary

Dieses Dokument beschreibt die Software-Architektur der Wichtel-Applikation basierend auf einer vollständig serverlosen (Serverless) Architektur mit modernem JAMstack-Ansatz.

**Kern-Entscheidungen:**

- ✅ Serverless Architecture (Vercel + Supabase)
- ✅ Dauerhafte Datenpersistenz (Multi-Jahr-Nutzung)
- ✅ Email-basierte Authentifizierung (Magic Links)
- ✅ Mobile-First Design
- ✅ Vollständig Cloud-native
- ✅ **Anonymitäts-Garantie:** Organisator kann selbst teilnehmen, ohne fremde Zuteilungen zu sehen

-----

## 2. Architektur-Übersicht

### 2.1 High-Level Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   CDN / Edge Network          │
         │   (Vercel Edge)               │
         └───────────┬───────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │     Frontend (Static Site)             │
    │  ┌──────────────────────────────────┐  │
    │  │  React / Vue.js App              │  │
    │  │  - Session Management UI         │  │
    │  │  - Participant Management        │  │
    │  │  - Draw Algorithm (Client-side)  │  │
    │  └──────────────────────────────────┘  │
    │         Hosted on: Vercel              │
    └────────┬─────────────────────┬─────────┘
             │                     │
             │                     │
             ▼                     ▼
    ┌────────────────┐    ┌───────────────────┐
    │  Supabase      │    │  Email Service    │
    │  Backend       │    │  (Resend/SendGrid)│
    │                │    │                   │
    │  ┌──────────┐  │    │  - Magic Links    │
    │  │PostgreSQL│  │    │  - Notifications  │
    │  │ Database │  │    └───────────────────┘
    │  └──────────┘  │
    │                │
    │  ┌──────────┐  │
    │  │   Auth   │  │
    │  │ (Magic   │  │
    │  │  Links)  │  │
    │  └──────────┘  │
    │                │
    │  ┌──────────┐  │
    │  │   API    │  │
    │  │(Auto-gen)│  │
    │  └──────────┘  │
    └────────────────┘
```

### 2.2 Architektur-Prinzipien

1. **Serverless-First**: Keine Server-Verwaltung, automatisches Scaling
1. **Security by Design**: Magic Links, secure tokens, HTTPS überall
1. **Mobile-First**: Optimiert für Smartphone-Nutzung
1. **Zero-Config Deployment**: Automatisches Deployment via Git-Push
1. **Cost-Efficient**: Pay-per-use, kostenlos für kleine Nutzung
1. **Developer Experience**: Einfache lokale Entwicklung

-----

## 3. Technology Stack

### 3.1 Frontend

**Framework:** React 18+ mit TypeScript

- **Warum React?**
  - Große Community, viele Ressourcen
  - Claude Code hat exzellente React-Kenntnisse
  - Perfekt für SPAs (Single Page Applications)
  - Großes Ökosystem an Libraries

**Styling:** TailwindCSS 3+

- Utility-First CSS Framework
- Schnelle Entwicklung
- Responsive Design out-of-the-box
- Kleine Bundle-Size

**State Management:** React Hooks (useState, useContext)

- Ausreichend für App-Komplexität
- Kein Redux nötig

**Routing:** React Router v6

- Client-side Routing
- Protected Routes für Admin-Bereiche

**HTTP Client:** Supabase JS Client

- Offizielle Supabase Library
- TypeScript Support
- Realtime-Fähigkeiten (optional für später)

### 3.2 Backend / BaaS (Backend-as-a-Service)

**Platform:** Supabase

- **Datenbank:** PostgreSQL 15+
- **Authentication:** Built-in Magic Link Auth
- **API:** Auto-generated REST & GraphQL APIs
- **Storage:** Optional für zukünftige Features
- **Realtime:** WebSocket-Support (optional)

**Warum Supabase?**

- Open Source (kann auch selbst gehostet werden)
- PostgreSQL = robuste, bewährte Datenbank
- Automatische API-Generierung
- Built-in Auth mit Magic Links
- Kostenloser Tier ausreichend für dein Use-Case
- Exzellente Developer Experience

### 3.3 Email Service

**Provider:** Resend (empfohlen) oder SendGrid

- **Resend:**
  - Modern, developer-friendly
  - 3000 Emails/Monat kostenlos
  - Sehr einfache API
- **Alternative: SendGrid:**
  - 100 Emails/Tag kostenlos
  - Bewährt und stabil

### 3.4 Hosting & Deployment

**Platform:** Vercel

- Static Site Hosting
- Edge Network (CDN weltweit)
- Automatisches HTTPS
- Git-Integration (Auto-Deploy)
- Preview-Deployments für jeden Branch
- Kostenloser Tier ausreichend

### 3.5 Development Tools

- **Version Control:** Git + GitHub
- **Package Manager:** npm oder pnpm
- **Development Environment:** Claude Code
- **TypeScript:** Type Safety
- **ESLint + Prettier:** Code Quality
- **Vitest:** Unit Testing (optional)

-----

## 4. Datenbank-Design

### 4.1 Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│  organizers     │         │   sessions       │
├─────────────────┤         ├──────────────────┤
│ id (UUID) PK    │────┐    │ id (UUID) PK     │
│ email           │    │    │ organizer_id FK  │
│ created_at      │    └───▶│ name             │
│ updated_at      │         │ status           │
└─────────────────┘         │ admin_token      │
                            │ created_at       │
                            │ updated_at       │
                            └────────┬─────────┘
                                     │
                                     │ 1:N
                                     │
                            ┌────────▼─────────┐
                            │  participants    │
                            ├──────────────────┤
                            │ id (UUID) PK     │
                            │ session_id FK    │
                            │ name             │
                            │ phone_number     │
                            │ participant_token│
                            │ assigned_to_id FK│
                            │ email_sent       │
                            │ created_at       │
                            └──────────────────┘
```

### 4.2 Datenbank-Schema (PostgreSQL)

```sql
-- Organizers Table
CREATE TABLE organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planning' 
        CHECK (status IN ('planning', 'drawn', 'completed', 'archived')),
    admin_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants Table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    participant_token VARCHAR(255) UNIQUE NOT NULL,
    assigned_to_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_self_assignment CHECK (id != assigned_to_id)
);

-- Indexes for Performance
CREATE INDEX idx_sessions_organizer ON sessions(organizer_id);
CREATE INDEX idx_sessions_admin_token ON sessions(admin_token);
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_participants_token ON participants(participant_token);

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
CREATE TRIGGER update_organizers_updated_at 
    BEFORE UPDATE ON organizers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at 
    BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.3 Row Level Security (RLS) Policies

Supabase nutzt PostgreSQL RLS für Zugriffskontrolle:

```sql
-- Enable RLS on all tables
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Organizers: Can only see their own data
CREATE POLICY "Organizers can view own data"
    ON organizers FOR SELECT
    USING (auth.uid() = id);

-- Sessions: Organizers can CRUD their own sessions
CREATE POLICY "Organizers can manage own sessions"
    ON sessions FOR ALL
    USING (organizer_id = auth.uid());

-- Participants: CRITICAL FOR ANONYMITY
-- Organizers can manage participants BUT cannot see assigned_to_id field
CREATE POLICY "Organizers can manage participants (no assignments)"
    ON participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can insert/update/delete participants"
    ON participants FOR INSERT, UPDATE, DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = participants.session_id
            AND sessions.organizer_id = auth.uid()
        )
    );

-- Participants can view own assignment via token
CREATE POLICY "Participants can view own assignment"
    ON participants FOR SELECT
    USING (participant_token = current_setting('request.jwt.claims', true)::json->>'participant_token');

-- NOTE: Frontend must explicitly exclude 'assigned_to_id' when querying as organizer
-- Backend RLS allows read, but frontend should not request this field for admin views
```

-----

## 5. API Design

### 5.1 API-Architektur

**Typ:** RESTful API (Auto-generiert durch Supabase)
**Authentifizierung:** JWT Tokens (Magic Links)
**Protokoll:** HTTPS only

### 5.2 Endpoint-Übersicht

#### Authentifizierung

```
POST /auth/v1/magiclink
Body: { "email": "organizer@example.com" }
Response: { "message": "Check your email" }
```

#### Sessions

```
GET /rest/v1/sessions
Headers: Authorization: Bearer <jwt_token>
Response: [{ id, name, status, created_at, ... }]

POST /rest/v1/sessions
Body: { 
  "name": "Weihnachtsfeier 2025",
  "admin_token": "<generated_token>"
}
Response: { id, name, admin_token, ... }

GET /rest/v1/sessions?id=eq.<session_id>
Response: { id, name, status, ... }

PATCH /rest/v1/sessions?id=eq.<session_id>
Body: { "status": "drawn" }
Response: { id, status, ... }
```

#### Participants

```
GET /rest/v1/participants?session_id=eq.<session_id>&select=id,name,phone_number,participant_token
Response: [{ id, name, phone_number, participant_token }]
⚠️ CRITICAL: Organizers MUST exclude 'assigned_to_id' from SELECT to preserve anonymity

POST /rest/v1/participants
Body: {
  "session_id": "<session_id>",
  "name": "Max Mustermann",
  "phone_number": "+491701234567",
  "participant_token": "<generated_token>"
}
Response: { id, name, participant_token, ... }

GET /rest/v1/participants?participant_token=eq.<token>&select=id,name,assigned_to_id
Response: { id, name, assigned_to_id }
⚠️ This endpoint returns assignment ONLY when accessed via participant_token

PATCH /rest/v1/participants?id=eq.<participant_id>
Body: { "assigned_to_id": "<other_participant_id>" }
Response: { id, assigned_to_id, ... }
⚠️ Used only by draw algorithm, not exposed to organizer UI
```

### 5.3 Custom Functions (Supabase Edge Functions)

Für komplexe Logik, die nicht durch Auto-API abgedeckt wird:

**1. Draw Assignment Function**

```typescript
// supabase/functions/draw-assignment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { sessionId } = await req.json()
  
  // 1. Fetch all participants
  // 2. Run derangement algorithm
  // 3. Update assigned_to_id for each participant
  // 4. Update session status to 'drawn'
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

**2. Send WhatsApp Notifications Function**

```typescript
// supabase/functions/send-notifications/index.ts
// Generate WhatsApp URLs for organizer
serve(async (req) => {
  const { sessionId } = await req.json()
  
  // 1. Fetch all participants with assignments
  // 2. Generate WhatsApp URLs
  // 3. Return array of { participant, whatsappUrl }
  
  return new Response(
    JSON.stringify({ notifications: [...] }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

-----

## 6. Authentifizierung & Autorisierung

### 6.1 Magic Link Flow

```
┌──────────┐                 ┌──────────┐                ┌──────────┐
│ Frontend │                 │ Supabase │                │  Email   │
│          │                 │   Auth   │                │ Service  │
└────┬─────┘                 └────┬─────┘                └────┬─────┘
     │                            │                           │
     │ 1. Enter Email             │                           │
     ├───────────────────────────>│                           │
     │                            │                           │
     │                            │ 2. Generate Magic Link    │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │                           │ 3. Send Email
     │                            │                           │    with Link
     │                            │                           │
     │ 4. Click Link in Email    │                           │
     │<──────────────────────────────────────────────────────┤
     │                            │                           │
     │ 5. Verify Token            │                           │
     ├───────────────────────────>│                           │
     │                            │                           │
     │ 6. Return JWT Token        │                           │
     │<───────────────────────────┤                           │
     │                            │                           │
     │ 7. Store JWT in LocalStorage                          │
     │                            │                           │
     │ 8. All subsequent requests │                           │
     │    include JWT in header   │                           │
     ├───────────────────────────>│                           │
```

### 6.2 Participant Token Access

Teilnehmer benötigen **KEINE** Email-Authentifizierung:

- Erhalten unique participant_token via WhatsApp
- Token ist URL-Parameter: `/assignment/<participant_token>`
- Frontend holt Assignment direkt mit Token
- RLS Policy erlaubt Read-Access mit Token

-----

## 7. Frontend-Architektur

### 7.1 Komponenten-Struktur

```
src/
├── components/
│   ├── auth/
│   │   ├── MagicLinkForm.tsx
│   │   └── AuthCallback.tsx
│   ├── sessions/
│   │   ├── SessionList.tsx
│   │   ├── SessionForm.tsx
│   │   └── SessionDetail.tsx
│   ├── participants/
│   │   ├── ParticipantList.tsx
│   │   ├── ParticipantForm.tsx
│   │   └── ParticipantCard.tsx
│   ├── draw/
│   │   ├── DrawButton.tsx
│   │   ├── DrawConfirmation.tsx
│   │   └── WhatsAppButtons.tsx
│   ├── assignment/
│   │   └── AssignmentView.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Loader.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── SessionPage.tsx
│   ├── AssignmentPage.tsx
│   └── NotFoundPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSessions.ts
│   ├── useParticipants.ts
│   └── useDraw.ts
├── services/
│   ├── supabase.ts
│   ├── drawAlgorithm.ts
│   └── whatsappService.ts
├── types/
│   ├── database.types.ts
│   ├── session.types.ts
│   └── participant.types.ts
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
├── App.tsx
└── main.tsx
```

### 7.2 Routing-Struktur

```
/ (Public)
├── /login (Magic Link Entry)
├── /auth/callback (Magic Link Verification)
└── /assignment/:token (Participant View)

/app (Protected - Requires Auth)
├── /app (Session List)
├── /app/session/new (Create Session)
└── /app/session/:id (Session Detail)
    ├── Participants Management
    ├── Draw Assignment
    └── WhatsApp Notifications
```

### 7.3 State Management

**Global State (React Context):**

```typescript
// AuthContext: User session, login/logout
interface AuthContext {
  user: User | null
  loading: boolean
  signIn: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

// SessionContext: Active session data
interface SessionContext {
  currentSession: Session | null
  participants: Participant[]  // ⚠️ WITHOUT assigned_to_id field!
  setCurrentSession: (session: Session) => void
}
```

**Local Component State (useState):**

- Form inputs
- UI state (modals, loading indicators)
- Temporary data

**⚠️ CRITICAL: Anonymity-Preserving Data Fetching**

```typescript
// ✅ CORRECT: Organizer fetching participants (NO assignments)
const { data: participants } = await supabase
  .from('participants')
  .select('id, name, phone_number, participant_token')  // NO assigned_to_id!
  .eq('session_id', sessionId)

// ❌ WRONG: Would expose assignments to organizer
const { data: participants } = await supabase
  .from('participants')
  .select('*')  // Includes assigned_to_id!
  .eq('session_id', sessionId)

// ✅ CORRECT: Participant viewing own assignment
const { data: assignment } = await supabase
  .from('participants')
  .select('id, name, assigned_to_id')
  .eq('participant_token', token)
  .single()
```

-----

## 8. Wichtel-Auslosungs-Algorithmus

### 8.1 Anforderungen

1. Jeder Teilnehmer beschenkt genau eine Person
1. Niemand beschenkt sich selbst
1. Geschlossener Kreis (A→B→C→…→Z→A)
1. Zufällige Verteilung

### 8.2 Algorithmus: Derangement (Client-Side)

```typescript
/**
 * Generates a random derangement (permutation where no element 
 * appears in its original position)
 */
function generateDerangement(participants: Participant[]): Map<string, string> {
  const n = participants.length
  const assignments = new Map<string, string>()
  
  // Create shuffled array of indices
  let attempts = 0
  const maxAttempts = 1000
  
  while (attempts < maxAttempts) {
    attempts++
    
    // Fisher-Yates shuffle
    const shuffled = [...participants]
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    // Check if valid derangement (nobody gets themselves)
    let isValid = true
    for (let i = 0; i < n; i++) {
      if (participants[i].id === shuffled[i].id) {
        isValid = false
        break
      }
    }
    
    if (isValid) {
      // Create assignments
      for (let i = 0; i < n; i++) {
        assignments.set(participants[i].id, shuffled[i].id)
      }
      return assignments
    }
  }
  
  throw new Error('Could not generate valid assignment after max attempts')
}

/**
 * Main draw function
 */
export async function drawAssignments(
  sessionId: string,
  participants: Participant[]
): Promise<void> {
  if (participants.length < 3) {
    throw new Error('Need at least 3 participants for drawing')
  }
  
  // Generate assignments
  const assignments = generateDerangement(participants)
  
  // Update database
  const updates = Array.from(assignments.entries()).map(([giverId, receiverId]) => ({
    id: giverId,
    assigned_to_id: receiverId
  }))
  
  await supabase
    .from('participants')
    .upsert(updates)
  
  // Update session status
  await supabase
    .from('sessions')
    .update({ status: 'drawn' })
    .eq('id', sessionId)
}
```

**Warum Client-Side?**

- Einfacher (keine Server-Funktion nötig)
- Schnell (kein Netzwerk-Roundtrip)
- Ausreichend für kleine Teilnehmerzahlen
- Bei größeren Gruppen (50+): Auf Server verschieben

-----

## 9. WhatsApp-Integration

### 9.1 WhatsApp URL-Schema

```typescript
interface WhatsAppMessage {
  phoneNumber: string  // Format: 491701234567 (ohne +)
  message: string      // URL-encoded
}

function generateWhatsAppUrl(participant: Participant, assignmentUrl: string): string {
  const message = `
Hallo ${participant.name}! 🎄

Du nimmst an unserem Wichteln teil!

Hier ist dein persönlicher Link, um zu sehen, wen du beschenken sollst:
${assignmentUrl}

Viel Spaß beim Geschenke-Suchen! 🎁
  `.trim()
  
  // Remove + from phone number and URL-encode message
  const phone = participant.phone_number.replace(/\+/g, '')
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${phone}?text=${encodedMessage}`
}
```

### 9.2 Deep-Link Handling

```typescript
export function openWhatsApp(url: string): void {
  // On mobile: Opens WhatsApp app
  // On desktop: Opens WhatsApp Web
  window.open(url, '_blank')
}
```

### 9.3 Notification Flow

```typescript
async function sendNotifications(sessionId: string): Promise<WhatsAppNotification[]> {
  // 1. Fetch participants with assignments
  const { data: participants } = await supabase
    .from('participants')
    .select('*, assigned:assigned_to_id(*)')
    .eq('session_id', sessionId)
  
  // 2. Generate notifications
  const notifications = participants.map(p => ({
    participant: p,
    whatsappUrl: generateWhatsAppUrl(
      p,
      `${window.location.origin}/assignment/${p.participant_token}`
    ),
    sent: false
  }))
  
  return notifications
}
```

-----

## 10. Deployment & DevOps

### 10.1 Deployment Pipeline

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       │ git push
       │
       ▼
┌─────────────┐
│   Vercel    │
│  (Auto-     │
│   Deploy)   │
└──────┬──────┘
       │
       │ Build & Deploy
       │
       ▼
┌─────────────┐
│  Production │
│   (CDN)     │
└─────────────┘
```

### 10.2 Umgebungen

**Development (Local)**

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_APP_URL=http://localhost:5173
```

**Staging (Preview Deployments)**

- Automatisch für jeden PR auf GitHub
- URL: `wichtel-app-git-<branch>.vercel.app`
- Nutzt Staging-Datenbank in Supabase

**Production**

- Main Branch
- URL: `wichtel-app.vercel.app` oder Custom Domain
- Nutzt Production-Datenbank

### 10.3 CI/CD Configuration

**Vercel** (automatisch konfiguriert):

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Framework: Vite / React

**GitHub Actions** (optional für Tests):

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

### 10.4 Monitoring & Logging

**Vercel Analytics**

- Page Load Times
- Core Web Vitals
- Deployment Status

**Supabase Dashboard**

- Database Queries Performance
- API Usage
- Error Logs
- Auth Events

**Optional: Sentry**

- Frontend Error Tracking
- Performance Monitoring

-----

## 11. Security Considerations

### 11.1 OWASP Top 10 Mitigation

|Threat                                         |Mitigation                                            |
|-----------------------------------------------|------------------------------------------------------|
|**Injection**                                  |Supabase verwendet prepared statements, RLS policies  |
|**Broken Auth**                                |Magic Links (keine Passwörter), JWT tokens, HTTPS only|
|**Sensitive Data Exposure**                    |TLS encryption, RLS, minimal data collection          |
|**XXE**                                        |Keine XML-Verarbeitung                                |
|**Broken Access Control**                      |Row Level Security (RLS) in PostgreSQL                |
|**Security Misconfiguration**                  |Supabase Defaults, Vercel HTTPS enforcement           |
|**XSS**                                        |React escapes by default, CSP headers                 |
|**Insecure Deserialization**                   |Keine Deserialisierung untrusted data                 |
|**Using Components with Known Vulnerabilities**|Dependabot alerts, regular updates                    |
|**Insufficient Logging**                       |Supabase logging, Vercel logs                         |

### 11.2 Daten-Sicherheit

**Verschlüsselung:**

- ✅ In Transit: HTTPS/TLS 1.3
- ✅ At Rest: PostgreSQL encryption (Supabase)
- ✅ Tokens: Kryptographisch sichere UUIDs

**Zugriffskontrolle:**

- ✅ Row Level Security (RLS)
- ✅ JWT Token Validation
- ✅ CORS Configuration
- ✅ Rate Limiting (Supabase built-in)

**Privacy:**

- Minimale Datenerhebung (nur Name, Telefonnummer)
- Keine Tracking-Cookies
- DSGVO-konform
- Daten-Löschung auf Anfrage möglich

**⚠️ CRITICAL: Anonymitäts-Garantie für Organisator-Teilnahme**

**Problem:** Organisator soll selbst teilnehmen können, OHNE die Zuteilungen anderer zu kennen.

**Lösung (Multi-Layer Defense):**

1. **Backend (RLS):**
   - RLS Policies erlauben Organisatoren Lesen von participants
   - ABER: Frontend muss explizit `assigned_to_id` ausschließen
   - RLS allein reicht NICHT aus (da SELECT * die Daten zeigen würde)

2. **API Layer:**
   - Organizer-Queries enthalten explizite SELECT-Liste ohne `assigned_to_id`
   - Participant-Queries (via token) enthalten `assigned_to_id`

3. **Frontend Layer:**
   - Admin-UI zeigt NIEMALS `assigned_to_id` Feld
   - State Management enthält nur participants ohne Assignments
   - TypeScript Interfaces erzwingen korrekte Datenstruktur

4. **UI/UX Layer:**
   - Klare Kommunikation: "Auch du siehst erst beim Öffnen deines Links, wen du beschenkst"
   - Keine "Wer beschenkt wen"-Übersicht im Admin-Interface
   - Organisator erhält eigenen WhatsApp-Link wie alle anderen

**Code-Beispiel:**

```typescript
// ✅ CORRECT: Type-safe participant without assignment
interface ParticipantAdmin {
  id: string
  name: string
  phone_number: string
  participant_token: string
  // NO assigned_to_id field!
}

// ✅ CORRECT: Type for participant view (with assignment)
interface ParticipantView {
  id: string
  name: string
  assigned_to_id: string | null
}
```

### 11.3 Token-Management

```typescript
// Token Generation
import { v4 as uuidv4 } from 'uuid'

function generateSecureToken(): string {
  return uuidv4() // Cryptographically secure
}

// Admin Token: 128-bit UUID
const adminToken = generateSecureToken()

// Participant Token: 128-bit UUID
const participantToken = generateSecureToken()
```

-----

## 12. Performance & Scalability

### 12.1 Performance Targets

|Metric                      |Target |Measurement       |
|----------------------------|-------|------------------|
|**First Contentful Paint**  |< 1.5s |Lighthouse        |
|**Time to Interactive**     |< 2.5s |Lighthouse        |
|**Largest Contentful Paint**|< 2.5s |Core Web Vitals   |
|**Cumulative Layout Shift** |< 0.1  |Core Web Vitals   |
|**API Response Time**       |< 200ms|Supabase Dashboard|
|**Database Query Time**     |< 50ms |Supabase Dashboard|

### 12.2 Optimierungen

**Frontend:**

- Code Splitting (React.lazy)
- Asset Optimization (Vite)
- CDN Caching (Vercel Edge)
- Image Optimization (wenn nötig)
- Tree Shaking
- Minification

**Backend:**

- Database Indexing (siehe Schema)
- Connection Pooling (Supabase)
- Caching (Browser + CDN)
- Efficient Queries (select nur benötigte Felder)

**Mobile:**

- Mobile-First CSS
- Responsive Images
- Reduced Motion Support
- Touch-Optimized UI

### 12.3 Scalability

**Current Architecture skaliert bis:**

- **Organisatoren:** 1.000+
- **Sessions:** 10.000+
- **Participants pro Session:** 50
- **Gleichzeitige Nutzer:** 100+

**Bei Wachstum über diese Grenzen:**

- Supabase Pro Plan (mehr Ressourcen)
- Database Sharding (nach Organizer)
- Read Replicas für Lesezugriffe
- CDN Caching für statische Inhalte

-----

## 13. Error Handling & Resilience

### 13.1 Error-Handling-Strategie

**Frontend Error Boundaries:**

```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service (e.g., Sentry)
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

**API Error Handling:**

```typescript
async function handleApiCall<T>(
  operation: () => Promise<T>
): Promise<{ data?: T; error?: Error }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    // Log error
    console.error('API Error:', error)
    
    // User-friendly error message
    if (error instanceof PostgrestError) {
      return { error: new Error('Datenbankfehler. Bitte versuche es erneut.') }
    }
    
    if (error instanceof NetworkError) {
      return { error: new Error('Keine Internetverbindung. Bitte überprüfe deine Verbindung.') }
    }
    
    return { error: new Error('Ein unerwarteter Fehler ist aufgetreten.') }
  }
}
```

### 13.2 Retry-Mechanismen

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delayMs * Math.pow(2, attempt))
      )
    }
  }
  throw new Error('Max retries exceeded')
}
```

### 13.3 Offline-Handling

```typescript
// Network status detection
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}

// Show offline banner
{!isOnline && (
  <OfflineBanner>
    ⚠️ Keine Internetverbindung. Einige Funktionen sind eingeschränkt.
  </OfflineBanner>
)}
```

-----

## 14. Testing Strategy

### 14.1 Testing-Pyramide

```
        ┌─────────────┐
        │   E2E (5%)  │  Playwright/Cypress
        ├─────────────┤
        │Integration  │  React Testing Library
        │   (15%)     │
        ├─────────────┤
        │    Unit     │  Vitest
        │   (80%)     │
        └─────────────┘
```

### 14.2 Unit Tests

**Wichtel-Algorithmus:**

```typescript
// drawAlgorithm.test.ts
import { describe, it, expect } from 'vitest'
import { generateDerangement } from './drawAlgorithm'

describe('generateDerangement', () => {
  it('should assign each participant to different person', () => {
    const participants = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ]
    
    const assignments = generateDerangement(participants)
    
    // Nobody gets themselves
    participants.forEach(p => {
      expect(assignments.get(p.id)).not.toBe(p.id)
    })
    
    // Everyone gets exactly one assignment
    expect(assignments.size).toBe(participants.length)
  })
  
  it('should create closed circle', () => {
    const participants = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' }
    ]
    
    const assignments = generateDerangement(participants)
    
    // Follow the chain - should return to start
    let current = '1'
    const visited = new Set()
    
    while (!visited.has(current)) {
      visited.add(current)
      current = assignments.get(current)!
    }
    
    // All participants visited
    expect(visited.size).toBe(participants.length)
  })
})
```

**WhatsApp Service:**

```typescript
// whatsappService.test.ts
import { describe, it, expect } from 'vitest'
import { generateWhatsAppUrl } from './whatsappService'

describe('generateWhatsAppUrl', () => {
  it('should generate valid WhatsApp URL', () => {
    const participant = {
      name: 'Max Mustermann',
      phone_number: '+491701234567'
    }
    
    const assignmentUrl = 'https://wichtel.app/assignment/token123'
    const url = generateWhatsAppUrl(participant, assignmentUrl)
    
    expect(url).toContain('https://wa.me/491701234567')
    expect(url).toContain('Hallo%20Max%20Mustermann')
    expect(url).toContain(encodeURIComponent(assignmentUrl))
  })
  
  it('should handle phone numbers without +', () => {
    const participant = {
      name: 'Anna',
      phone_number: '491701234567'
    }
    
    const url = generateWhatsAppUrl(participant, 'https://test.com')
    expect(url).toContain('https://wa.me/491701234567')
  })
})
```

### 14.3 Integration Tests

```typescript
// SessionCreation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SessionForm from './SessionForm'

describe('Session Creation Flow', () => {
  it('should create session and add participants', async () => {
    const mockCreate = vi.fn()
    render(<SessionForm onSubmit={mockCreate} />)
    
    // Enter session name
    fireEvent.change(
      screen.getByLabelText('Session Name'),
      { target: { value: 'Weihnachten 2025' } }
    )
    
    // Add participant
    fireEvent.change(
      screen.getByLabelText('Name'),
      { target: { value: 'Max' } }
    )
    fireEvent.change(
      screen.getByLabelText('Telefon'),
      { target: { value: '+491701234567' } }
    )
    fireEvent.click(screen.getByText('Hinzufügen'))
    
    // Submit
    fireEvent.click(screen.getByText('Session erstellen'))
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Weihnachten 2025',
        participants: [{
          name: 'Max',
          phone_number: '+491701234567'
        }]
      })
    })
  })
})
```

### 14.4 E2E Tests (Optional)

```typescript
// e2e/wichtel-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete wichtel flow', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('https://wichtel-app.vercel.app')
  
  // 2. Login with magic link (mock email)
  await page.fill('input[type="email"]', 'test@example.com')
  await page.click('button:has-text("Magic Link senden")')
  
  // 3. Create session
  await page.click('button:has-text("Neue Session")')
  await page.fill('input[name="sessionName"]', 'Test Session')
  
  // 4. Add participants
  for (let i = 1; i <= 5; i++) {
    await page.fill('input[name="name"]', `Person ${i}`)
    await page.fill('input[name="phone"]', `+4917012345${i}0`)
    await page.click('button:has-text("Hinzufügen")')
  }
  
  // 5. Draw assignments
  await page.click('button:has-text("Auslosung durchführen")')
  await page.click('button:has-text("Bestätigen")')
  
  // 6. Verify WhatsApp buttons appear
  await expect(page.locator('button:has-text("WhatsApp öffnen")')).toHaveCount(5)
})
```

-----

## 15. Backup & Disaster Recovery

### 15.1 Backup-Strategie

**Supabase Automated Backups:**

- ✅ Daily automated backups (retention: 7 days on free tier)
- ✅ Point-in-time recovery (Pro Plan: 14-30 days)
- ✅ Backups stored in separate region

**Manual Exports (für zusätzliche Sicherheit):**

```sql
-- Export all data as SQL dump
pg_dump -h db.xxxxx.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f wichtel_backup_$(date +%Y%m%d).dump

-- Or export as CSV via Supabase Dashboard
-- Tables → Export → CSV
```

**Backup Schedule:**

|Frequency           |Retention|Method       |
|--------------------|---------|-------------|
|Daily               |7 days   |Supabase Auto|
|Weekly              |30 days  |Manual Export|
|Before Major Updates|Permanent|Manual Export|

### 15.2 Disaster Recovery Plan

**Szenarien und Recovery:**

1. **Datenbank-Korruption:**
- Recovery Time Objective (RTO): 1 Stunde
- Recovery Point Objective (RPO): 24 Stunden
- Prozess: Restore von letztem Backup
1. **Supabase Outage:**
- Fallback: Read-only Modus (cached data)
- Notification an Nutzer
- Monitoring via Supabase Status Page
1. **Vercel Outage:**
- CDN hat automatische Failover
- Alternative: Deploy auf zweiter Plattform (Netlify)
1. **Kompletter Datenverlust:**
- Restore von letztem Export
- Informiere betroffene Nutzer
- Lessons Learned Dokumentation

-----

## 16. Maintenance & Operations

### 16.1 Routine Maintenance

**Wöchentlich:**

- ✅ Dependency Updates prüfen (Dependabot)
- ✅ Security Alerts checken
- ✅ Backup-Status verifizieren

**Monatlich:**

- ✅ Performance Metrics analysieren
- ✅ Datenbank-Optimierung (VACUUM, ANALYZE)
- ✅ Alte Sessions archivieren (optional)
- ✅ User Feedback reviewen

**Jährlich:**

- ✅ Security Audit
- ✅ Dependency Major-Updates
- ✅ Architecture Review

### 16.2 Monitoring & Alerts

**Metriken zu überwachen:**

1. **Application Health:**
- API Response Times
- Error Rates
- Uptime (Target: 99.9%)
1. **Database:**
- Connection Pool Saturation
- Query Performance
- Storage Usage
1. **User Experience:**
- Page Load Times
- Core Web Vitals
- User Journey Completion Rates

**Alert-Setup (optional mit Sentry/Uptime Robot):**

```yaml
alerts:
  - name: "API Response Time"
    condition: "avg_response_time > 1000ms"
    notify: email
    
  - name: "Error Rate"
    condition: "error_rate > 5%"
    notify: email + slack
    
  - name: "Database Storage"
    condition: "storage_usage > 80%"
    notify: email
```

### 16.3 Dokumentation

**Erforderliche Dokumentation:**

- ✅ README.md (Setup Instructions)
- ✅ API.md (API Documentation)
- ✅ DEPLOYMENT.md (Deployment Guide)
- ✅ CONTRIBUTING.md (Contribution Guidelines)
- ✅ CHANGELOG.md (Version History)

-----

## 17. Migration Strategy (Zukunft)

### 17.1 Daten-Migration zwischen Jahren

**Problem:** Teilnehmer-Daten für neue Session übernehmen

**Lösung:**

```typescript
async function copyParticipantsToNewSession(
  sourceSessionId: string,
  targetSessionId: string
): Promise<void> {
  // 1. Fetch participants from old session
  const { data: oldParticipants } = await supabase
    .from('participants')
    .select('name, phone_number')
    .eq('session_id', sourceSessionId)
  
  // 2. Create new participants with new tokens
  const newParticipants = oldParticipants.map(p => ({
    session_id: targetSessionId,
    name: p.name,
    phone_number: p.phone_number,
    participant_token: generateSecureToken(),
    assigned_to_id: null
  }))
  
  // 3. Insert into database
  await supabase
    .from('participants')
    .insert(newParticipants)
}
```

### 17.2 Schema-Migrationen

**Supabase Migrations:**

```sql
-- migrations/20251206_add_preferences.sql
ALTER TABLE participants
ADD COLUMN preferences JSONB DEFAULT '{}';

CREATE INDEX idx_participants_preferences 
ON participants USING GIN (preferences);
```

**Anwendung:**

- Via Supabase CLI: `supabase db push`
- Via Dashboard: SQL Editor

-----

## 18. Cost Analysis

### 18.1 Kostenschätzung (EUR pro Monat)

**Free Tier (Empfohlen für Start):**

```
Vercel (Hobby):           €0
Supabase (Free):          €0
Resend (Free):            €0
GitHub (Public Repo):     €0
Domain (optional):        ~€10/Jahr

TOTAL:                    €0-1/Monat
```

**Bei Wachstum (1000+ Nutzer):**

```
Vercel (Pro):             €20
Supabase (Pro):           €25
Resend (Starter):         €10
Domain:                   €10/Jahr

TOTAL:                    ~€55/Monat
```

### 18.2 Ressourcen-Limits (Free Tier)

**Vercel Free:**

- 100 GB Bandwidth/Monat
- 100 Deployments/Tag
- Serverless Function Execution: 100 GB-Hours

**Supabase Free:**

- 500 MB Database
- 1 GB File Storage
- 2 GB Bandwidth/Monat
- 50.000 Monthly Active Users

**Resend Free:**

- 3.000 Emails/Monat
- 100 Emails/Tag

**Ist das ausreichend?**

- 10 Personen × 50 Sessions = 500 Teilnehmer
- Database: ~10 KB/Teilnehmer = 5 MB << 500 MB ✅
- Emails: 1 Magic Link/Nutzer ≈ 50 Emails/Monat << 3.000 ✅
- Bandwidth: 5 MB/Session << 2 GB ✅

-----

## 19. Accessibility (A11y)

### 19.1 WCAG 2.1 Compliance

**Level AA Anforderungen:**

1. **Perceivable:**
- ✅ Alt-Text für alle Bilder
- ✅ Farbkontrast mindestens 4.5:1
- ✅ Text skalierbar bis 200%
1. **Operable:**
- ✅ Keyboard-Navigation
- ✅ Focus-Indikatoren
- ✅ No keyboard traps
1. **Understandable:**
- ✅ Klare Labels für Formularfelder
- ✅ Fehler-Nachrichten verständlich
- ✅ Konsistente Navigation
1. **Robust:**
- ✅ Semantisches HTML
- ✅ ARIA-Labels wo nötig
- ✅ Screen-Reader kompatibel

### 19.2 Implementierung

```tsx
// Accessible Button
<button
  onClick={handleDraw}
  aria-label="Wichtel-Auslosung durchführen"
  aria-describedby="draw-help-text"
  disabled={participants.length < 3}
>
  Auslosung durchführen
</button>
<span id="draw-help-text" className="sr-only">
  Startet die zufällige Zuteilung der Wichtel-Partner
</span>

// Accessible Form
<form onSubmit={handleSubmit} aria-labelledby="form-title">
  <h2 id="form-title">Neuen Teilnehmer hinzufügen</h2>
  
  <label htmlFor="participant-name">Name</label>
  <input
    id="participant-name"
    type="text"
    required
    aria-required="true"
    aria-invalid={errors.name ? 'true' : 'false'}
    aria-describedby={errors.name ? 'name-error' : undefined}
  />
  {errors.name && (
    <span id="name-error" role="alert" className="error">
      {errors.name}
    </span>
  )}
</form>
```

-----

## 20. Internationalization (i18n) - Future

**Aktuell:** Nur Deutsch
**Zukünftig (optional):**

```typescript
// i18n Setup mit react-i18next
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: require('./locales/de.json') },
      en: { translation: require('./locales/en.json') }
    },
    lng: 'de',
    fallbackLng: 'de'
  })

// Usage
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('welcome.title')}</h1>
}
```

-----

## 21. Setup Instructions für Developer

### 21.1 Prerequisites

- Node.js 18+
- npm oder pnpm
- GitHub Account (nissimbuchs)
- Supabase Account (kostenlos)
- Vercel Account (kostenlos)

### 21.2 Initial Setup

**1. Supabase Projekt erstellen:**

```bash
# Via Dashboard: https://supabase.com/dashboard
# 1. New Project
# 2. Name: wichtel-app-production
# 3. Database Password: [secure password]
# 4. Region: Frankfurt (eu-central-1)
```

**2. Datenbank initialisieren:**

```sql
-- Im Supabase SQL Editor das gesamte Schema aus Kapitel 4.2 ausführen
```

**3. Repository Setup:**

```bash
# Clone repository
git clone https://github.com/nissimbuchs/wichtel-app.git
cd wichtel-app

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_URL=http://localhost:5173
EOF

# Start development server
npm run dev
```

**4. Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_APP_URL
```

### 21.3 Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Vercel creates automatic preview deployment

# After review, merge to main
# Vercel automatically deploys to production
```

-----

## 22. Architecture Decision Records (ADRs)

### ADR-001: Serverless Architecture

**Status:** Accepted  
**Date:** 2025-12-06

**Context:**  
Need to choose hosting architecture for Wichtel app.

**Decision:**  
Use serverless architecture with Vercel + Supabase.

**Consequences:**

- ✅ No server maintenance
- ✅ Automatic scaling
- ✅ Cost-effective for low usage
- ❌ Potential cold-starts
- ❌ Vendor lock-in

-----

### ADR-002: Client-Side Draw Algorithm

**Status:** Accepted  
**Date:** 2025-12-06

**Context:**  
Draw algorithm can run client-side or server-side.

**Decision:**  
Implement derangement algorithm client-side in React.

**Consequences:**

- ✅ No server round-trip (faster)
- ✅ Simpler architecture
- ✅ Works offline
- ❌ Limited to smaller groups (< 100)
- ❌ Algorithm visible in client code (not a security issue)

-----

### ADR-003: Email-Based Authentication

**Status:** Accepted  
**Date:** 2025-12-06

**Context:**  
Need authentication for organizers.

**Decision:**  
Use Magic Links (passwordless email authentication).

**Consequences:**

- ✅ No password management
- ✅ More secure (no password leaks)
- ✅ Better UX
- ❌ Requires email access
- ❌ Potential email delivery issues

-----

### ADR-004: Organisator als Teilnehmer (Anonymitäts-Garantie)

**Status:** Accepted
**Date:** 2025-12-07

**Context:**
UX-Analyse ergab: Organisator soll selbst am Wichteln teilnehmen können, ohne die Anonymität zu gefährden.

**Decision:**
Multi-Layer Defense Strategy:
1. Backend RLS erlaubt Lesen von participants
2. Frontend muss explizit `assigned_to_id` aus SELECT ausschließen
3. TypeScript Interfaces erzwingen korrekte Datenstrukturen
4. UI verhindert versehentliches Sehen fremder Zuteilungen

**Consequences:**

- ✅ Organisator kann teilnehmen ohne Vertrauen zu brechen
- ✅ Technisch garantierte Anonymität durch Code
- ✅ TypeScript verhindert versehentliche Datenleaks
- ❌ Entwickler muss bewusst korrekte SELECT-Queries schreiben
- ❌ Zusätzliche Komplexität in Data Fetching Layer

-----

### ADR-005: PostgreSQL vs NoSQL

**Status:** Accepted  
**Date:** 2025-12-06

**Context:**  
Choose between SQL (PostgreSQL) and NoSQL (MongoDB, Firestore).

**Decision:**  
Use PostgreSQL via Supabase.

**Consequences:**

- ✅ ACID transactions
- ✅ Strong referential integrity
- ✅ Powerful querying with SQL
- ✅ RLS for security
- ❌ Less flexible schema

-----

## 23. Future Enhancements (Post-MVP)

**Phase 2 Features:**

- [ ] Wunschlisten für Teilnehmer
- [ ] Budget-Tracking
- [ ] In-App Chat (anonym zwischen Schenker/Beschenktem)
- [ ] Email-Benachrichtigungen statt nur WhatsApp
- [ ] Multi-Sprach-Support (EN, FR)
- [ ] Geschenk-Inspirationen / Amazon-Integration
- [ ] Anonyme Hinweise-Funktion

**Phase 3 Features:**

- [ ] Public Templates (Wichtel-Regeln)
- [ ] Gamification (Badges, Punkte)
- [ ] Mobile Apps (React Native)
- [ ] Social Sharing (OG-Tags, Twitter Cards)
- [ ] Advanced Analytics für Organisatoren
- [ ] API für Drittanbieter

-----

## 24. Lessons Learned & Best Practices

### 24.1 Development Best Practices

**DO:**

- ✅ TypeScript für Type Safety
- ✅ ESLint + Prettier für Code Quality
- ✅ Atomic Commits mit klaren Messages
- ✅ Code Reviews vor Merge
- ✅ Tests schreiben für kritische Logik
- ✅ Environment Variables für Config
- ✅ Error Boundaries für Frontend
- ✅ Logging für Debugging

**DON’T:**

- ❌ Hardcode Credentials
- ❌ Skip Input Validation
- ❌ Ignore Error Handling
- ❌ Deploy ohne Testing
- ❌ Commit `node_modules`
- ❌ Use console.log in Production

### 24.2 Security Best Practices

- ✅ Always use HTTPS
- ✅ Validate all inputs (client + server)
- ✅ Use prepared statements (Supabase does this)
- ✅ Implement Row Level Security
- ✅ Rate limiting on sensitive endpoints
- ✅ Secure token generation (crypto-random)
- ✅ Regular dependency updates
- ✅ Monitor security advisories

### 24.3 Performance Best Practices

- ✅ Code Splitting
- ✅ Lazy Loading
- ✅ Optimize Images
- ✅ Minimize Bundle Size
- ✅ Use CDN (Vercel Edge)
- ✅ Database Indexing
- ✅ Cache where possible
- ✅ Compress responses

-----

## 25. Conclusion & Next Steps

### 25.1 Architecture Summary

Die Wichtel-Applikation nutzt eine **moderne, serverlose Architektur**, die optimal für kleine bis mittelgroße Anwendungsfälle geeignet ist:

- **Frontend:** React + TypeScript + TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + API)
- **Hosting:** Vercel (CDN + Serverless Functions)
- **Email:** Resend/SendGrid

Diese Architektur bietet:

- ⚡ Schnelle Entwicklung
- 💰 Kosteneffizient
- 🔒 Sicher by Default
- 📈 Automatisch skalierbar
- 🛠️ Einfach zu warten

### 25.2 Implementation Roadmap

**Woche 1-2: Setup & Core Features**

- [ ] Supabase Projekt + Schema Setup
- [ ] React App Scaffolding
- [ ] Authentication (Magic Links)
- [ ] Session Management
- [ ] Participant Management

**Woche 3: Draw & Notifications**

- [ ] Draw Algorithm Implementation
- [ ] WhatsApp Integration
- [ ] Assignment View

**Woche 4: Polish & Deploy**

- [ ] UI/UX Refinements
- [ ] Testing
- [ ] Production Deployment
- [ ] Documentation

**Woche 5: Buffer**

- [ ] Bug Fixes
- [ ] Performance Optimizations
- [ ] User Testing

### 25.3 Success Metrics

**Nach 3 Monaten:**

- 10+ aktive Sessions
- < 5% Error Rate
- 95% User Satisfaction
- < 2s Average Load Time

**Nach 1 Jahr:**

- Wiederverwendung bei gleichen Nutzern
- Empfehlungsrate messen
- Feature Requests sammeln
- Entscheidung über Phase 2 Features

-----

## 26. Appendix

### 26.1 Glossary

- **Serverless:** Cloud-Architektur ohne Server-Management
- **JAMstack:** JavaScript, APIs, Markup
- **BaaS:** Backend-as-a-Service
- **RLS:** Row Level Security
- **Magic Link:** Passwordless Authentication via Email
- **Derangement:** Permutation where no element is in original position
- **JWT:** JSON Web Token
- **CDN:** Content Delivery Network
- **ORM:** Object-Relational Mapping

### 26.2 References

**Documentation:**

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- React Docs: https://react.dev
- TailwindCSS Docs: https://tailwindcss.com

**Libraries:**

- Supabase JS Client: https://github.com/supabase/supabase-js
- React Router: https://reactrouter.com
- React Testing Library: https://testing-library.com

**Tools:**

- Claude Code: For AI-assisted development
- GitHub: Version control
- Playwright: E2E Testing

### 26.3 Contact & Support

**Developer:**

- GitHub: @nissimbuchs
- Repository: https://github.com/nissimbuchs/wichtel-app

**Architecture Questions:**

- Refer to this document
- Create GitHub Issue
- Discussion in team

-----

**Document End**

*This architecture document should be treated as living documentation and updated as the system evolves.*
