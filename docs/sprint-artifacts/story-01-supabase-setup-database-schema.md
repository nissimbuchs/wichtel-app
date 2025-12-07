# Story-01: Supabase Setup & Database Schema

**Epic:** 0 - Technical Foundation
**Story ID:** Story-01
**Story Key:** `story-01-supabase-setup-database-schema`
**Story Points:** 8
**Priorität:** MUST HAVE
**Status:** ready-for-dev

---

## User Story

**Als** Entwickler
**möchte ich** die Supabase-Infrastruktur und das Datenbankschema bereitstellen
**damit** die App Daten persistent speichern kann

---

## Business Context

Diese Story legt das technische Fundament für die gesamte Wichtel-Applikation. Ohne funktionierende Datenbank-Infrastruktur können keine weiteren Features entwickelt werden. Das Schema ist optimiert für:

- **Anonymität:** Multi-Layer Defense durch RLS Policies
- **Performance:** Strategische Indexes für häufige Queries
- **Skalierbarkeit:** UUID Primary Keys, Foreign Key Constraints
- **Audit-Trail:** Automatic timestamps mit Triggers
- **Data Integrity:** CHECK Constraints und CASCADE Deletes

**Epic Goal Reference:** Als Entwicklungsteam haben wir die technische Infrastruktur bereitgestellt, sodass wir mit der Feature-Entwicklung beginnen können.

---

## Akzeptanzkriterien

### 1. Supabase Projekt erstellt ✅

- [ ] Neues Supabase Projekt in Frankfurt Region (eu-central-1) erstellt
- [ ] Projekt Name: `wichtel-app-production` oder `wichtel-app-dev`
- [ ] Organization: Personal oder Team Organization
- [ ] Database Password sicher gespeichert (1Password, Environment Variables)
- [ ] Projekt URL dokumentiert: `https://[project-ref].supabase.co`

### 2. Database Schema deployed ✅

**Tabellen müssen in dieser Reihenfolge erstellt werden (wegen Foreign Keys):**

#### 2.1 `organizers` Table
- [ ] Table erstellt mit allen Feldern (id, email, created_at, updated_at)
- [ ] UUID Primary Key mit `uuid_generate_v4()` default
- [ ] Email UNIQUE constraint
- [ ] Timestamps mit timezone

#### 2.2 `sessions` Table
- [ ] Table erstellt mit Foreign Key zu `organizers`
- [ ] Status CHECK constraint für ('planning', 'drawn', 'completed', 'archived')
- [ ] Admin Token UNIQUE constraint
- [ ] ON DELETE CASCADE für organizer_id

#### 2.3 `participants` Table
- [ ] Table erstellt mit Foreign Keys zu `sessions` und self-reference für `assigned_to_id`
- [ ] CHECK constraint: `no_self_assignment` (id != assigned_to_id)
- [ ] ON DELETE CASCADE für session_id
- [ ] ON DELETE SET NULL für assigned_to_id
- [ ] Participant Token UNIQUE constraint

### 3. Indexes für Performance erstellt ✅

- [ ] `idx_sessions_organizer` auf `sessions(organizer_id)`
- [ ] `idx_sessions_admin_token` auf `sessions(admin_token)`
- [ ] `idx_participants_session` auf `participants(session_id)`
- [ ] `idx_participants_token` auf `participants(participant_token)`

### 4. Updated_at Trigger Function ✅

- [ ] Function `update_updated_at_column()` erstellt
- [ ] Trigger auf `organizers` table
- [ ] Trigger auf `sessions` table
- [ ] Trigger auf `participants` table

### 5. Row Level Security Policies konfiguriert ✅

- [ ] RLS aktiviert auf allen 3 Tables
- [ ] Policy: "Organizers can view own data" auf `organizers`
- [ ] Policy: "Organizers can manage own sessions" auf `sessions`
- [ ] Policy: "Organizers can manage participants (no assignments)" auf `participants` (SELECT)
- [ ] Policy: "Organizers can insert/update/delete participants" auf `participants` (INSERT/UPDATE/DELETE)
- [ ] Policy: "Participants can view own assignment" auf `participants` (via token)

**CRITICAL:** Frontend muss explizit `assigned_to_id` ausschließen wenn Organizer Participants abfragt!

### 6. Migration Files in `/supabase/migrations/` ✅

- [ ] Migration File erstellt: `20251207_initial_schema.sql`
- [ ] File enthält COMPLETE Schema (Tables + Indexes + Triggers + RLS)
- [ ] Migration kann idempotent ausgeführt werden (IF NOT EXISTS checks wo möglich)
- [ ] Migration lokal getestet mit `supabase db reset`

### 7. Seed-Data für Development ✅

- [ ] Seed File erstellt: `/supabase/seed.sql`
- [ ] Mindestens 1 Test-Organizer mit Email
- [ ] Mindestens 1 Test-Session mit Admin Token
- [ ] Mindestens 3 Test-Participants für Derangement Testing
- [ ] Seed Script lokal testbar

---

## Technical Requirements

### Technology Stack

**Backend-as-a-Service:** Supabase (PostgreSQL 15+)
- **Region:** EU Central 1 (Frankfurt) - GDPR Compliance
- **Database:** PostgreSQL 15.x mit PostGIS extension (nicht benötigt, aber verfügbar)
- **Authentication:** Supabase Auth (Magic Links) - wird in Story-03 konfiguriert
- **API:** Auto-generated REST API via PostgREST

**Local Development:**
- Supabase CLI v1.x
- Docker Desktop (für Local Supabase)
- Node.js 18+ (für Migration Scripts)

### Database Schema Details

**Complete Schema aus Architecture Document Kapitel 4.2:**

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizers Table
CREATE TABLE IF NOT EXISTS organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
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
CREATE TABLE IF NOT EXISTS participants (
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
CREATE INDEX IF NOT EXISTS idx_sessions_organizer ON sessions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_token ON sessions(admin_token);
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(participant_token);

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS update_organizers_updated_at ON organizers;
CREATE TRIGGER update_organizers_updated_at
    BEFORE UPDATE ON organizers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS) Policies

**Complete RLS from Architecture Document Kapitel 4.3:**

```sql
-- Enable RLS on all tables
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Organizers can view own data" ON organizers;
DROP POLICY IF EXISTS "Organizers can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Organizers can manage participants (no assignments)" ON participants;
DROP POLICY IF EXISTS "Organizers can insert/update/delete participants" ON participants;
DROP POLICY IF EXISTS "Participants can view own assignment" ON participants;

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
```

**CRITICAL NOTE:** RLS allows Organizers to SELECT from participants, BUT the Frontend MUST explicitly exclude `assigned_to_id` field in queries! This is Layer 2 of Multi-Layer Defense for anonymity.

---

## Architecture Compliance

### Multi-Layer Defense for Anonymity (Architecture Doc Kapitel 11.3)

Diese Story implementiert **Layer 1 (Backend RLS)**:

1. ✅ **Backend RLS:** Policies erlauben Organizers Zugriff auf participants
2. ⚠️ **API Layer:** Frontend muss explizit SELECT ohne `assigned_to_id` machen (Story-04+)
3. ⚠️ **Frontend Defense:** TypeScript Interfaces ohne `assigned_to_id` für Admin Views (Story-04+)

**Developer Guardrail:** Wenn du später Frontend-Queries schreibst (Story-04+), NIEMALS `assigned_to_id` in Organizer-Queries inkludieren!

### Data Retention & GDPR

- Session-Daten werden NICHT automatisch gelöscht
- ON DELETE CASCADE sorgt für saubere Löschung wenn Organizer deleted wird
- Timestamps ermöglichen späte GDPR-Compliance Features (Post-MVP)

### Performance Considerations

**Indexes sind optimiert für:**
- Organizer findet eigene Sessions: `idx_sessions_organizer`
- Admin Token Lookup: `idx_sessions_admin_token`
- Participant Listing für Session: `idx_participants_session`
- Reveal Page Token Lookup: `idx_participants_token`

**Query Pattern Prediction:**
- Sessions: Filter by `organizer_id` (häufig)
- Participants: Filter by `session_id` (sehr häufig)
- Participants: Lookup by `participant_token` (bei jedem Reveal)

---

## File Structure Requirements

### Supabase Directory Structure (NEU zu erstellen)

```
wichtel-app/
├── supabase/
│   ├── config.toml              # Supabase Project Config
│   ├── .gitignore               # Ignore .env files
│   ├── migrations/
│   │   └── 20251207_initial_schema.sql    # THIS STORY
│   └── seed.sql                 # Development Seed Data
├── .env.local                   # Supabase Credentials (NICHT committen!)
└── .env.example                 # Template für .env.local
```

### Migration File Template

**Filename:** `supabase/migrations/20251207_initial_schema.sql`

**Content:** Complete Schema + RLS Policies (siehe oben)

**Best Practices:**
- Use `IF NOT EXISTS` wo möglich
- `DROP POLICY IF EXISTS` vor `CREATE POLICY`
- `DROP TRIGGER IF EXISTS` vor `CREATE TRIGGER`
- Kommentare für jede Section

### Seed Data Template

**Filename:** `supabase/seed.sql`

```sql
-- Seed Data for Development & Testing
-- Run with: supabase db reset (includes migrations + seed)

-- Insert Test Organizer
INSERT INTO organizers (id, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'test@example.com')
ON CONFLICT (email) DO NOTHING;

-- Insert Test Session
INSERT INTO sessions (id, organizer_id, name, admin_token, status) VALUES
    ('00000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001',
     'Test Wichteln 2025',
     'test-admin-token-12345',
     'planning')
ON CONFLICT (id) DO NOTHING;

-- Insert Test Participants (minimum 3 for Derangement)
INSERT INTO participants (id, session_id, name, phone_number, participant_token) VALUES
    ('00000000-0000-0000-0000-000000000100',
     '00000000-0000-0000-0000-000000000010',
     'Max Mustermann',
     '+4917012345678',
     'participant-token-max'),
    ('00000000-0000-0000-0000-000000000101',
     '00000000-0000-0000-0000-000000000010',
     'Anna Schmidt',
     '+4917087654321',
     'participant-token-anna'),
    ('00000000-0000-0000-0000-000000000102',
     '00000000-0000-0000-0000-000000000010',
     'Peter Müller',
     '+4917055555555',
     'participant-token-peter')
ON CONFLICT (id) DO NOTHING;
```

---

## Testing Requirements

### 1. Schema Validation Tests

**Manual Testing in Supabase SQL Editor:**

```sql
-- Test 1: Verify all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('organizers', 'sessions', 'participants');
-- Expected: 3 rows

-- Test 2: Verify indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('sessions', 'participants');
-- Expected: idx_sessions_organizer, idx_sessions_admin_token,
--           idx_participants_session, idx_participants_token

-- Test 3: Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizers', 'sessions', 'participants');
-- Expected: All have rowsecurity = true

-- Test 4: Verify policies exist
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE tablename IN ('organizers', 'sessions', 'participants');
-- Expected: 5 policies total

-- Test 5: Test CHECK constraint (should fail)
INSERT INTO participants (id, session_id, name, phone_number, participant_token, assigned_to_id)
VALUES (
    '00000000-0000-0000-0000-999999999999',
    '00000000-0000-0000-0000-000000000010',
    'Test',
    '+49170',
    'token-test',
    '00000000-0000-0000-0000-999999999999'  -- Same as id!
);
-- Expected: ERROR: new row violates check constraint "no_self_assignment"
```

### 2. RLS Policy Tests

**Test Organizer Access:**

```sql
-- Create test organizer and session via Supabase Auth
-- Then query as that authenticated user:

-- Test: Organizer can see own sessions
SELECT * FROM sessions WHERE organizer_id = auth.uid();
-- Expected: Only own sessions

-- Test: Organizer CANNOT see other organizer's sessions
SELECT * FROM sessions WHERE organizer_id != auth.uid();
-- Expected: 0 rows (RLS blocks)

-- Test: Organizer can see participants of own session
SELECT id, name, phone_number FROM participants
WHERE session_id IN (SELECT id FROM sessions WHERE organizer_id = auth.uid());
-- Expected: Participants from own sessions
-- NOTE: assigned_to_id should NOT be queried!
```

### 3. Migration Idempotency Test

```bash
# Test 1: Run migration twice
supabase db reset  # First run
supabase db reset  # Second run - should succeed without errors

# Test 2: Manual re-apply
psql $DATABASE_URL < supabase/migrations/20251207_initial_schema.sql
psql $DATABASE_URL < supabase/migrations/20251207_initial_schema.sql
# Expected: No errors, warnings OK
```

### 4. Trigger Test

```sql
-- Test: Updated_at triggers work
UPDATE participants SET name = 'New Name'
WHERE participant_token = 'participant-token-max';

SELECT name, updated_at, created_at FROM participants
WHERE participant_token = 'participant-token-max';
-- Expected: updated_at > created_at
```

### 5. Foreign Key Cascade Test

```sql
-- Test: ON DELETE CASCADE from sessions to participants
DELETE FROM sessions WHERE admin_token = 'test-admin-token-12345';

SELECT COUNT(*) FROM participants
WHERE session_id = '00000000-0000-0000-0000-000000000010';
-- Expected: 0 (all participants deleted)
```

---

## Implementation Steps

### Step 1: Supabase Project Setup

1. **Create Supabase Account** (if not exists)
   - Go to https://supabase.com
   - Sign up / Sign in
   - Verify Email

2. **Create New Project**
   - Click "New Project"
   - Organization: Select or create
   - Project Name: `wichtel-app` (dev) or `wichtel-app-production`
   - Database Password: Generate strong password (min 12 chars)
   - Region: **Frankfurt (eu-central-1)** - CRITICAL for GDPR
   - Pricing Plan: Free Tier (sufficient for MVP)
   - Click "Create new project"
   - Wait ~2 minutes for provisioning

3. **Save Credentials**
   - Copy Project URL: `https://[project-ref].supabase.co`
   - Copy API Keys (Project Settings → API)
     - `anon` public key
     - `service_role` secret key (NEVER commit!)
   - Copy Database URL (Project Settings → Database → Connection String → URI)

4. **Create `.env.local` file** (root of project):
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

5. **Create `.env.example`** (for team members):
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

6. **Update `.gitignore`:**
```gitignore
.env.local
.env*.local
```

### Step 2: Local Supabase CLI Setup

1. **Install Supabase CLI:**
```bash
# macOS
brew install supabase/tap/supabase

# Windows / Linux - see https://supabase.com/docs/guides/cli
```

2. **Initialize Supabase locally:**
```bash
supabase init
# Creates supabase/ folder with config.toml
```

3. **Link to remote project:**
```bash
supabase login
supabase link --project-ref your-project-ref
# Enter database password when prompted
```

4. **Start local Supabase (optional for testing):**
```bash
supabase start
# Starts Docker containers for local dev
# Local Studio: http://localhost:54323
```

### Step 3: Create Migration File

1. **Create migrations directory:**
```bash
mkdir -p supabase/migrations
```

2. **Create migration file:**
```bash
touch supabase/migrations/20251207_initial_schema.sql
```

3. **Copy complete schema** (from "Database Schema Details" section above) into file

4. **Validate SQL syntax locally** (if local Supabase running):
```bash
supabase db reset
# Applies all migrations from scratch
```

### Step 4: Deploy to Supabase Cloud

**Option A: Via Supabase Dashboard (SQL Editor)**

1. Go to Project → SQL Editor
2. Create New Query
3. Paste complete schema from migration file
4. Click "Run" (or Cmd+Enter)
5. Verify success (green checkmark)

**Option B: Via Supabase CLI**

```bash
supabase db push
# Pushes local migrations to remote
```

**Option C: Via Database URL (psql)**

```bash
psql $DATABASE_URL < supabase/migrations/20251207_initial_schema.sql
```

### Step 5: Create Seed Data

1. **Create seed file:**
```bash
touch supabase/seed.sql
```

2. **Copy seed data** (from "Seed Data Template" section above)

3. **Apply seed data:**
```bash
# Via Dashboard SQL Editor: Copy/paste and Run
# Via CLI:
supabase db reset  # Includes seed.sql if present
# Via psql:
psql $DATABASE_URL < supabase/seed.sql
```

### Step 6: Verification

1. **Open Supabase Table Editor**
   - Project → Table Editor
   - Verify tables: `organizers`, `sessions`, `participants`
   - Check column types and constraints

2. **Check Authentication section**
   - Project → Database → Policies
   - Verify 5 RLS policies are listed

3. **Run Test Queries** (from "Testing Requirements" section)
   - SQL Editor → Run validation queries
   - All tests should pass

4. **Document Setup**
   - Add README section or create `docs/supabase-setup.md`
   - Document Project URL, Region, Migration status

---

## Common Pitfalls & How to Avoid

### ❌ Pitfall 1: RLS Policies nicht korrekt

**Problem:** Policies zu restriktiv oder zu permissive

**Solution:**
- Teste Policies mit echten Auth Tokens
- Use `auth.uid()` für Organizer identification
- Participant Token Policies via JWT claims

### ❌ Pitfall 2: Migration nicht idempotent

**Problem:** Migration fails beim zweiten Run

**Solution:**
- Use `CREATE TABLE IF NOT EXISTS`
- Use `DROP POLICY IF EXISTS` vor CREATE
- Test mit `supabase db reset` mehrfach

### ❌ Pitfall 3: Assigned_to_id Anonymitäts-Leak

**Problem:** Organizer könnte `assigned_to_id` sehen

**Solution:**
- RLS allein reicht NICHT
- Frontend MUSS explizit exclude: `SELECT id, name, phone_number FROM participants`
- NIEMALS `SELECT *` für Organizer Queries

### ❌ Pitfall 4: Fehlende Indexes

**Problem:** Slow queries später

**Solution:**
- Alle 4 Indexes MÜSSEN angelegt werden
- Test mit `EXPLAIN ANALYZE` später

### ❌ Pitfall 5: Keine ON DELETE CASCADE

**Problem:** Orphaned participants bei Session Delete

**Solution:**
- `ON DELETE CASCADE` auf session_id Foreign Key
- `ON DELETE SET NULL` auf assigned_to_id (erlaubt Reassignment)

---

## Definition of Done

- [ ] ✅ Supabase Project erstellt in Frankfurt Region
- [ ] ✅ Database Schema vollständig deployed (3 Tables)
- [ ] ✅ All 4 Indexes erstellt
- [ ] ✅ Updated_at Triggers auf allen Tables
- [ ] ✅ RLS enabled auf allen Tables
- [ ] ✅ All 5 RLS Policies deployed und getestet
- [ ] ✅ Migration File in `supabase/migrations/` committed
- [ ] ✅ Seed Data in `supabase/seed.sql` committed
- [ ] ✅ `.env.local` mit Credentials erstellt (NOT committed!)
- [ ] ✅ `.env.example` committed
- [ ] ✅ `.gitignore` updated für .env files
- [ ] ✅ All Schema Validation Tests passed
- [ ] ✅ All RLS Policy Tests passed
- [ ] ✅ Migration Idempotency Test passed
- [ ] ✅ Trigger Tests passed
- [ ] ✅ Foreign Key Cascade Tests passed
- [ ] ✅ Documentation: Supabase Project URL dokumentiert
- [ ] ✅ Documentation: Region (Frankfurt) confirmed
- [ ] ✅ Code Review: Schema reviewed gegen Architecture Doc
- [ ] ✅ Deployment: Schema live in Production/Dev Supabase

---

## Next Steps After Completion

1. **Story-02:** Next.js + Tailwind Setup
   - Installiere `@supabase/supabase-js` client
   - Create Supabase client helper

2. **Story-03:** Supabase Auth Integration
   - Configure Magic Links
   - Setup Auth Context

3. **Story-04:** Session-Erstellung initiieren
   - Erste echte DB-Interaktion
   - CREATE Session mit Organizer FK

---

## External Resources & Documentation

### Supabase Documentation
- Main Docs: https://supabase.com/docs
- Database: https://supabase.com/docs/guides/database
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Migrations: https://supabase.com/docs/guides/cli/local-development#database-migrations
- SQL Editor: https://supabase.com/docs/guides/database/overview#the-sql-editor

### PostgreSQL Documentation
- CREATE TABLE: https://www.postgresql.org/docs/current/sql-createtable.html
- Indexes: https://www.postgresql.org/docs/current/indexes.html
- Triggers: https://www.postgresql.org/docs/current/trigger-definition.html
- RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

### Best Practices
- Database Design: https://supabase.com/docs/guides/database/tables
- Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Performance: https://supabase.com/docs/guides/database/postgres/indexes

---

## Notes from Architecture Document

**Zitat aus Architecture Doc, Kapitel 4.2:**
> "Das Schema ist optimiert für die Anonymitäts-Garantie: Organisatoren können Teilnehmer verwalten, aber die assigned_to_id darf im Admin-Interface niemals angezeigt werden."

**Zitat aus Architecture Doc, Kapitel 11.3:**
> "Multi-Layer Defense: RLS Policies erlauben Organizers Lesen von participants, ABER: Frontend muss explizit assigned_to_id ausschließen. RLS allein reicht NICHT aus."

**Zitat aus PRD, Kapitel 4.3:**
> "Der Organisator kann selbst als Teilnehmer am Wichteln teilnehmen, ohne die Anonymität zu gefährden oder die Zuteilungen anderer Teilnehmer zu kennen."

---

**Story Status:** Ready for Development ✅
**Context Completeness:** Ultimate Story Context Engine - Exhaustive Analysis Completed
**Developer Readiness:** 100% - All guardrails in place

**Generated:** 2025-12-07 by BMad Method Ultimate Story Context Engine
**Scrum Master:** Bob
**Validated Against:** PRD v1.0, Architecture v1.0, Epics v1.1
