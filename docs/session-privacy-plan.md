# Session Privacy Enhancement Plan

## Objective

**Optional** end-to-end encryption for Wichtel-App sessions. Organizers can choose to encrypt their sessions with a master password, ensuring:
- DB administrators cannot read session content
- Developers (even with service role) cannot access data
- Data at rest is encrypted and meaningless without the key
- Only the organizer holding the encryption key can decrypt

**Important**: Encryption is completely **optional**. Organizers can choose to use the app without encryption (current behavior) or enable encryption for additional privacy.

---

## Current State Analysis

### Current Authentication
- **Supabase Magic Link** - Organizers receive email link to login (passwordless)
- No encryption password exists currently
- All data stored in plaintext

### Current Security Model
```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│  Browser ──► Supabase API ──► PostgreSQL (plaintext)        │
│                                                              │
│  WHO CAN ACCESS DATA:                                        │
│  ✓ Organizer (via RLS)                                      │
│  ✓ DB Admin (direct SQL access)                             │
│  ✓ Developer (service role key)                             │
│  ✓ Supabase employees (infrastructure)                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Currently Stored in Plaintext
| Table | Sensitive Fields |
|-------|------------------|
| sessions | admin_token |
| participants | name, phone_number, assigned_to_id, partner_id |

---

## Proposed Architecture: Optional Zero-Knowledge Encryption

### Key Design Decisions

1. **Encryption is optional** - Organizers choose whether to enable encryption or not
2. **Session name stays PLAINTEXT** - Visible on dashboard without unlocking (in both modes)
3. **One master password per organizer** - If encryption enabled: single password for all sessions
4. **WebAuthn for biometrics** - Face ID / Touch ID to unlock without typing password (when encrypted)
5. **Separate reveal tracking** - Non-sensitive metadata stays unencrypted (in both modes)
6. **Backward compatible** - Non-encrypted sessions work exactly like current implementation

### What's Encrypted vs Plaintext

**Mode 1: Non-Encrypted Sessions (Default)**
```
┌─────────────────────────────────────────────────────────────┐
│              ALL DATA STORED AS PLAINTEXT                    │
├─────────────────────────────────────────────────────────────┤
│  ├── Session ID, name, status                               │
│  ├── Participant names                                      │
│  ├── Phone numbers                                          │
│  ├── Assignments (in separate participants table)           │
│  ├── Partner exclusions                                     │
│  ├── Admin token                                            │
│  └── Reveal tracking                                        │
│                                                              │
│  Protected by: RLS policies (organizer_id = auth.uid())     │
│  Visible to: Organizer + DB admins + service role           │
└─────────────────────────────────────────────────────────────┘
```

**Mode 2: Encrypted Sessions (Optional)**
```
┌─────────────────────────────────────────────────────────────┐
│              PLAINTEXT (visible without password)            │
├─────────────────────────────────────────────────────────────┤
│  ├── Session ID                                             │
│  ├── Session name                                           │
│  ├── Session status (planning/drawn/completed/archived)     │
│  ├── Created/updated timestamps                             │
│  ├── Organizer ID                                           │
│  ├── is_encrypted flag (TRUE)                               │
│  └── Reveal tracking (viewed_at timestamps, view counts)    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ENCRYPTED (requires master password)            │
├─────────────────────────────────────────────────────────────┤
│  ├── Participant names                                      │
│  ├── Phone numbers                                          │
│  ├── Assignments (who gives to whom)                        │
│  ├── Partner exclusions                                     │
│  └── Admin token                                            │
│                                                              │
│  Protected by: AES-256-GCM encryption                       │
│  Visible to: Only organizer with password                   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Overview

**With Encryption Enabled:**
```
┌─────────────────────────────────────────────────────────────┐
│                    ENCRYPTED MODE ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│  Browser                                                     │
│  ├── Master password (set once per organizer)               │
│  ├── WebAuthn stores password in device secure enclave      │
│  ├── Face ID / Touch ID retrieves password                  │
│  ├── PBKDF2 derives AES-256 key from password               │
│  ├── Encrypt/decrypt session data locally                   │
│  └── Send encrypted blob to Supabase                        │
│                                                              │
│  Supabase (stores only encrypted data)                      │
│  ├── sessions: name (plaintext) + encrypted_data (blob)     │
│  ├── reveal_links: per-participant encrypted assignments    │
│  └── reveal_tracking: plaintext timestamps                  │
│                                                              │
│  WHO CAN ACCESS DATA:                                        │
│  ✓ Organizer (with password + Face ID)                      │
│  ✗ DB Admin (sees only encrypted blobs)                     │
│  ✗ Developer (sees only encrypted blobs)                    │
│  ✗ Supabase employees (sees only encrypted blobs)           │
└─────────────────────────────────────────────────────────────┘
```

**Without Encryption (Default):**
```
┌─────────────────────────────────────────────────────────────┐
│                    NON-ENCRYPTED MODE                        │
├─────────────────────────────────────────────────────────────┤
│  Browser ──► Supabase API ──► PostgreSQL (plaintext)        │
│                                                              │
│  WHO CAN ACCESS DATA:                                        │
│  ✓ Organizer (via RLS)                                      │
│  ✓ DB Admin (direct SQL access)                             │
│  ✓ Developer (service role key)                             │
│  ✓ Supabase employees (infrastructure)                      │
│                                                              │
│  This is the current behavior - simple and fast.            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Tables and Changes

```sql
-- Migration: 20251211_encrypted_sessions.sql

-- Store encryption salt per organizer (NOT the password/key)
CREATE TABLE organizer_encryption (
  organizer_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  encryption_salt TEXT NOT NULL,        -- Random salt for PBKDF2
  encryption_version INTEGER DEFAULT 1, -- For future algorithm upgrades
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Organizers can only access their own encryption metadata
ALTER TABLE organizer_encryption ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage their own encryption"
  ON organizer_encryption FOR ALL
  USING (organizer_id = auth.uid());

-- Modify sessions table (name stays plaintext)
ALTER TABLE sessions ADD COLUMN encrypted_data TEXT;
ALTER TABLE sessions ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE;

-- Index for encrypted sessions
CREATE INDEX idx_sessions_is_encrypted ON sessions(is_encrypted);

-- Reveal tracking table (plaintext metadata)
CREATE TABLE reveal_tracking (
  participant_token UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  reveal_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Anyone can update their own tracking (token acts as auth)
ALTER TABLE reveal_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can mark reveal as viewed"
  ON reveal_tracking FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Organizer can view tracking for their sessions"
  ON reveal_tracking FOR SELECT
  USING (session_id IN (
    SELECT id FROM sessions WHERE organizer_id = auth.uid()
  ));

-- Pre-generated reveal data (encrypted per-participant)
CREATE TABLE reveal_links (
  participant_token UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  encrypted_assignment TEXT NOT NULL,  -- Encrypted with token-derived key
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Anyone can read reveal links (token in URL acts as auth)
ALTER TABLE reveal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reveal links"
  ON reveal_links FOR SELECT
  USING (true);

CREATE POLICY "Organizer can manage reveal links for their sessions"
  ON reveal_links FOR ALL
  USING (session_id IN (
    SELECT id FROM sessions WHERE organizer_id = auth.uid()
  ));
```

### Encrypted Data Structure

```typescript
// types/encrypted.types.ts

// What's stored in sessions.encrypted_data (as JSON blob)
interface EncryptedSessionData {
  admin_token: string;
  partner_exclusion_enabled: boolean;
  participants: EncryptedParticipant[];
}

interface EncryptedParticipant {
  id: string;
  name: string;
  phone_number: string;
  assigned_to_id: string | null;
  partner_id: string | null;
  is_organizer: boolean;
  participant_token: string;
  whatsapp_sent_at: string | null;
}

// What's stored in reveal_links.encrypted_assignment
interface RevealAssignment {
  participant_name: string;
  assigned_to_name: string;
  session_name: string;
}
```

---

## Encryption Implementation

### Phase 1: Core Crypto Library

```typescript
// lib/crypto.ts
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

interface EncryptedPayload {
  iv: string;      // Base64 encoded
  ciphertext: string;  // Base64 encoded
}

// Utility functions
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base64ToBuffer(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// Generate random salt for new organizer
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufferToBase64(salt);
}

// Derive encryption key from master password
export async function deriveKey(
  password: string,
  saltBase64: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = base64ToBuffer(saltBase64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data with the derived key
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );

  return {
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
  };
}

// Decrypt data with the derived key
export async function decrypt(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return decoder.decode(plaintext);
}

// Verify password is correct by attempting decryption
export async function verifyPassword(
  password: string,
  saltBase64: string,
  testPayload: EncryptedPayload
): Promise<boolean> {
  try {
    const key = await deriveKey(password, saltBase64);
    await decrypt(testPayload, key);
    return true;
  } catch {
    return false;
  }
}
```

---

## WebAuthn Biometric Storage

### Phase 2: Face ID / Touch ID Integration

```typescript
// lib/biometric-storage.ts
import {
  startRegistration,
  startAuthentication
} from '@simplewebauthn/browser';

const CREDENTIAL_ID_KEY = 'wichtel-webauthn-credential-id';
const ENCRYPTED_PASSWORD_KEY = 'wichtel-encrypted-master-pwd';

// Check if device supports biometric authentication
export function isBiometricAvailable(): boolean {
  return !!(
    window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
  );
}

export async function checkBiometricSupport(): Promise<boolean> {
  if (!isBiometricAvailable()) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// Register biometric authentication and store password
export async function setupBiometricUnlock(
  organizerId: string,
  password: string
): Promise<boolean> {
  try {
    // 1. Generate a challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    // 2. Register with WebAuthn (triggers Face ID enrollment)
    const registration = await startRegistration({
      challenge: bufferToBase64(challenge),
      rp: {
        name: 'Wichtel App',
        id: window.location.hostname,
      },
      user: {
        id: organizerId,
        name: organizerId,
        displayName: 'Wichtel Organizer',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',  // Use device biometrics
        userVerification: 'required',         // Require Face ID/Touch ID
        residentKey: 'required',
      },
      timeout: 60000,
    });

    // 3. Derive a storage key from the credential
    const storageKey = await deriveStorageKey(registration.id);

    // 4. Encrypt the master password with storage key
    const encryptedPassword = await encryptPassword(password, storageKey);

    // 5. Store in localStorage (encrypted, safe)
    localStorage.setItem(CREDENTIAL_ID_KEY, registration.id);
    localStorage.setItem(ENCRYPTED_PASSWORD_KEY, JSON.stringify(encryptedPassword));

    return true;
  } catch (error) {
    console.error('Biometric setup failed:', error);
    return false;
  }
}

// Retrieve password using Face ID / Touch ID
export async function unlockWithBiometrics(): Promise<string | null> {
  try {
    const credentialId = localStorage.getItem(CREDENTIAL_ID_KEY);
    const encryptedPasswordJson = localStorage.getItem(ENCRYPTED_PASSWORD_KEY);

    if (!credentialId || !encryptedPasswordJson) {
      return null; // Biometrics not set up
    }

    // 1. Generate challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    // 2. Authenticate with WebAuthn (triggers Face ID prompt)
    const authentication = await startAuthentication({
      challenge: bufferToBase64(challenge),
      rpId: window.location.hostname,
      allowCredentials: [{
        id: credentialId,
        type: 'public-key',
        transports: ['internal'],
      }],
      userVerification: 'required',
      timeout: 60000,
    });

    // 3. Derive storage key from credential
    const storageKey = await deriveStorageKey(authentication.id);

    // 4. Decrypt the master password
    const encryptedPassword = JSON.parse(encryptedPasswordJson);
    const password = await decryptPassword(encryptedPassword, storageKey);

    return password;
  } catch (error) {
    console.error('Biometric unlock failed:', error);
    return null;
  }
}

// Check if biometrics are already set up
export function isBiometricSetUp(): boolean {
  return !!(
    localStorage.getItem(CREDENTIAL_ID_KEY) &&
    localStorage.getItem(ENCRYPTED_PASSWORD_KEY)
  );
}

// Clear biometric data (for logout or reset)
export function clearBiometricData(): void {
  localStorage.removeItem(CREDENTIAL_ID_KEY);
  localStorage.removeItem(ENCRYPTED_PASSWORD_KEY);
}

// Helper: Derive a key from credential ID for local storage encryption
async function deriveStorageKey(credentialId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(credentialId),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Use a fixed salt for local storage (credential ID provides uniqueness)
  const salt = encoder.encode('wichtel-local-storage-salt');

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptPassword(
  password: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(password)
  );

  return {
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptPassword(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return decoder.decode(plaintext);
}
```

---

## Master Password Flow

### One Password for All Sessions

```
┌─────────────────────────────────────────────────────────────┐
│                 MASTER PASSWORD ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  organizer_encryption table:                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ organizer_id │ encryption_salt │ encryption_version │    │
│  │ uuid-123     │ base64-salt     │ 1                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Key Derivation (same for ALL sessions):                    │
│  password + salt ──► PBKDF2(100K iterations) ──► AES-256    │
│                                                              │
│  Session 1: encrypted with organizer's key                  │
│  Session 2: encrypted with organizer's key (same key!)      │
│  Session 3: encrypted with organizer's key (same key!)      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Flow: First-Time Organizer

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRST TIME SETUP                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Organizer logs in via magic link (Supabase auth)        │
│                                                              │
│  2. Creates first session                                   │
│                                                              │
│  3. System detects: no encryption_salt in organizer_encryption │
│                                                              │
│  4. OPTIONAL encryption prompt shown:                       │
│  ┌──────────────────────────────────────┐                   │
│  │ 🔒 Enable Encryption? (Optional)     │                   │
│  │                                      │                   │
│  │ You can protect ALL your sessions    │                   │
│  │ with a master password.              │                   │
│  │                                      │                   │
│  │ Benefits:                            │                   │
│  │ • Only you can access your data      │                   │
│  │ • Even DB admins cannot read it      │                   │
│  │ • Use Face ID for quick unlock       │                   │
│  │                                      │                   │
│  │ Drawback:                            │                   │
│  │ • Lost password = lost data forever  │                   │
│  │                                      │                   │
│  │ Password:  [••••••••••••••••]        │                   │
│  │ Confirm:   [••••••••••••••••]        │                   │
│  │                                      │                   │
│  │ [Enable Encryption]                  │                   │
│  │ [Skip - Use Without Encryption]      │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  5a. If "Enable Encryption" clicked:                        │
│     - Generate random salt                                  │
│     - Store salt in organizer_encryption                    │
│     - Derive key from password + salt                       │
│     - Encrypt session data                                  │
│     - Store encrypted_data in sessions (is_encrypted=TRUE)  │
│     - Offer biometric setup (next step)                     │
│                                                              │
│  5b. If "Skip" clicked:                                     │
│     - Create session normally (current behavior)            │
│     - No encryption_salt created                            │
│     - Store data in participants table (is_encrypted=FALSE) │
│     - Continue to session management                        │
│                                                              │
│  6. (Only if encryption enabled) Offer biometric setup:     │
│  ┌──────────────────────────────────────┐                   │
│  │ 🔐 Enable Face ID?                   │                   │
│  │                                      │                   │
│  │ Unlock your sessions with Face ID    │                   │
│  │ instead of typing your password.     │                   │
│  │                                      │                   │
│  │ [Enable Face ID]  [Skip for now]     │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Flow: Returning Organizer

```
┌─────────────────────────────────────────────────────────────┐
│                    RETURNING ORGANIZER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Organizer logs in via magic link                        │
│                                                              │
│  2. Dashboard shows session list (names always visible!):   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Your Sessions                                        │   │
│  │                                                      │   │
│  │ 🔒 Christmas 2025         planning    Dec 7         │   │
│  │ 🔒 Office Secret Santa    drawn       Dec 5         │   │
│  │ 🔓 Family Wichtel 2024    archived    Dec 1         │   │
│  │                                                      │   │
│  │ [+ New Session]                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  Note: 🔒 = encrypted, 🔓 = not encrypted                    │
│                                                              │
│  3. Clicks on a session                                     │
│                                                              │
│  4. System checks: is_encrypted flag                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PATH A: Non-Encrypted Session (is_encrypted=FALSE)  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  → Load directly, no unlock needed                  │    │
│  │  → Query participants table                         │    │
│  │  → Show participant list immediately                │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PATH B: Encrypted Session (is_encrypted=TRUE)       │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  5. System checks for biometric setup               │    │
│  │                                                      │    │
│  │  5a. If biometrics enabled:                         │    │
│  │  ┌──────────────────────────────────────┐           │    │
│  │  │ 🔒 Unlock: Christmas 2025            │           │    │
│  │  │                                      │           │    │
│  │  │     ┌────────────────────┐           │           │    │
│  │  │     │    [Face ID]       │           │           │    │
│  │  │     │                    │           │           │    │
│  │  │     │  Unlock with       │           │           │    │
│  │  │     │  Face ID           │           │           │    │
│  │  │     └────────────────────┘           │           │    │
│  │  │                                      │           │    │
│  │  │     ─────── or ───────               │           │    │
│  │  │                                      │           │    │
│  │  │  Enter password: [••••••••••]        │           │    │
│  │  │                                      │           │    │
│  │  │  [Unlock]                            │           │    │
│  │  └──────────────────────────────────────┘           │    │
│  │                                                      │    │
│  │  5b. If no biometrics:                              │    │
│  │  ┌──────────────────────────────────────┐           │    │
│  │  │ 🔒 Unlock: Christmas 2025            │           │    │
│  │  │                                      │           │    │
│  │  │ Master Password:                     │           │    │
│  │  │ [••••••••••••••••]                   │           │    │
│  │  │                                      │           │    │
│  │  │ ☐ Remember for this session          │           │    │
│  │  │                                      │           │    │
│  │  │ [Unlock]                             │           │    │
│  │  └──────────────────────────────────────┘           │    │
│  │                                                      │    │
│  │  6. Password/Face ID successful:                    │    │
│  │     - Derive key                                    │    │
│  │     - Decrypt session data                          │    │
│  │     - Store key in session storage (optional)       │    │
│  │     - Show decrypted participant list               │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Reveal Tracking (Without Password)

### How Participants Update reveal_viewed_at

```
┌─────────────────────────────────────────────────────────────┐
│                 PARTICIPANT REVEAL FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Participant receives WhatsApp link:                     │
│     https://wichtel.app/reveal/abc-123-token                │
│                                                              │
│  2. Clicks link → Frontend loads                            │
│                                                              │
│  3. Frontend fetches from reveal_links:                     │
│     SELECT encrypted_assignment                              │
│     FROM reveal_links                                        │
│     WHERE participant_token = 'abc-123-token'               │
│                                                              │
│  4. Frontend decrypts assignment:                           │
│     - Token itself is used to derive decryption key         │
│     - key = PBKDF2(token, session_salt)                     │
│     - decrypt(encrypted_assignment, key)                    │
│                                                              │
│  5. Display: "You are giving a gift to: Maria 🎁"           │
│                                                              │
│  6. Frontend calls tracking API (NO password needed):       │
│     POST /api/reveal-viewed                                 │
│     Body: { participant_token: "abc-123-token" }            │
│                                                              │
│  7. API updates reveal_tracking table:                      │
│     UPDATE reveal_tracking                                   │
│     SET reveal_viewed_at = NOW(),                           │
│         view_count = view_count + 1,                        │
│         last_viewed_at = NOW()                              │
│     WHERE participant_token = 'abc-123-token'               │
│                                                              │
│  ✅ No password required for tracking                       │
│  ✅ Organizer sees "3 of 5 viewed" on their dashboard       │
│  ✅ Sensitive data (names, phones) stays encrypted          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Generating Reveal Links (Organizer Side)

```typescript
// services/revealService.ts

export async function generateRevealLinks(
  sessionId: string,
  encryptionKey: CryptoKey,
  sessionSalt: string
): Promise<void> {
  // 1. Get encrypted session data
  const { data: session } = await supabase
    .from('sessions')
    .select('encrypted_data, name')
    .eq('id', sessionId)
    .single();

  // 2. Decrypt to get participants
  const decryptedData = await decryptSessionData(session.encrypted_data, encryptionKey);

  // 3. Generate reveal link for each participant
  for (const participant of decryptedData.participants) {
    if (!participant.assigned_to_id) continue;

    // Find who they're assigned to
    const assignedTo = decryptedData.participants.find(
      p => p.id === participant.assigned_to_id
    );

    if (!assignedTo) continue;

    // Create reveal payload
    const revealData: RevealAssignment = {
      participant_name: participant.name,
      assigned_to_name: assignedTo.name,
      session_name: session.name,
    };

    // Derive participant-specific key from their token
    const participantKey = await deriveKey(participant.participant_token, sessionSalt);

    // Encrypt the reveal data
    const encryptedAssignment = await encrypt(JSON.stringify(revealData), participantKey);

    // Store reveal link
    await supabase.from('reveal_links').upsert({
      participant_token: participant.participant_token,
      session_id: sessionId,
      encrypted_assignment: JSON.stringify(encryptedAssignment),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    // Create tracking entry
    await supabase.from('reveal_tracking').upsert({
      participant_token: participant.participant_token,
      session_id: sessionId,
      reveal_viewed_at: null,
      view_count: 0,
    });
  }
}
```

---

## Services Layer

### Encrypted Session Service

```typescript
// services/encryptedSessionService.ts

import { supabase } from '@/lib/supabase/client';
import { deriveKey, encrypt, decrypt, generateSalt } from '@/lib/crypto';

// Check if organizer has encryption set up
export async function hasEncryptionSetup(organizerId: string): Promise<boolean> {
  const { data } = await supabase
    .from('organizer_encryption')
    .select('encryption_salt')
    .eq('organizer_id', organizerId)
    .single();

  return !!data?.encryption_salt;
}

// Set up encryption for new organizer
export async function setupOrganizerEncryption(
  organizerId: string,
  password: string
): Promise<string> {
  const salt = generateSalt();

  await supabase.from('organizer_encryption').insert({
    organizer_id: organizerId,
    encryption_salt: salt,
    encryption_version: 1,
  });

  return salt;
}

// Get organizer's encryption salt
export async function getOrganizerSalt(organizerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('organizer_encryption')
    .select('encryption_salt')
    .eq('organizer_id', organizerId)
    .single();

  return data?.encryption_salt ?? null;
}

// Derive encryption key for organizer
export async function getOrganizerKey(
  organizerId: string,
  password: string
): Promise<CryptoKey> {
  const salt = await getOrganizerSalt(organizerId);
  if (!salt) {
    throw new Error('Organizer encryption not set up');
  }
  return deriveKey(password, salt);
}

// Create encrypted session
export async function createEncryptedSession(
  organizerId: string,
  encryptionKey: CryptoKey,
  sessionName: string,
  partnerExclusionEnabled: boolean = false
): Promise<string> {
  // Prepare data for encryption
  const dataToEncrypt: EncryptedSessionData = {
    admin_token: crypto.randomUUID(),
    partner_exclusion_enabled: partnerExclusionEnabled,
    participants: [],
  };

  // Encrypt
  const encryptedPayload = await encrypt(JSON.stringify(dataToEncrypt), encryptionKey);

  // Store in Supabase (name is plaintext!)
  const { data, error } = await supabase.from('sessions').insert({
    organizer_id: organizerId,
    name: sessionName,  // PLAINTEXT - visible on dashboard
    status: 'planning',
    is_encrypted: true,
    encrypted_data: JSON.stringify(encryptedPayload),
  }).select('id').single();

  if (error) throw error;
  return data.id;
}

// Get and decrypt session
export async function getDecryptedSession(
  sessionId: string,
  encryptionKey: CryptoKey
): Promise<{ session: Session; data: EncryptedSessionData }> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;

  if (!session.is_encrypted) {
    throw new Error('Session is not encrypted');
  }

  const encryptedPayload = JSON.parse(session.encrypted_data);
  const decryptedJson = await decrypt(encryptedPayload, encryptionKey);
  const decryptedData: EncryptedSessionData = JSON.parse(decryptedJson);

  return { session, data: decryptedData };
}

// Update encrypted session (e.g., add participant)
export async function updateEncryptedSession(
  sessionId: string,
  encryptionKey: CryptoKey,
  updatedData: EncryptedSessionData
): Promise<void> {
  const encryptedPayload = await encrypt(JSON.stringify(updatedData), encryptionKey);

  const { error } = await supabase
    .from('sessions')
    .update({
      encrypted_data: JSON.stringify(encryptedPayload),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) throw error;
}

// Add participant to encrypted session
export async function addParticipant(
  sessionId: string,
  encryptionKey: CryptoKey,
  participant: Omit<EncryptedParticipant, 'id' | 'participant_token'>
): Promise<void> {
  const { data: sessionData } = await getDecryptedSession(sessionId, encryptionKey);

  const newParticipant: EncryptedParticipant = {
    ...participant,
    id: crypto.randomUUID(),
    participant_token: crypto.randomUUID(),
    assigned_to_id: null,
    partner_id: null,
    whatsapp_sent_at: null,
  };

  sessionData.participants.push(newParticipant);

  await updateEncryptedSession(sessionId, encryptionKey, sessionData);
}
```

---

## User Experience Flow

### Dashboard (No Unlock Needed)

```
┌──────────────────────────────────────────────────────────────┐
│  Wichtel App                            [Logout]             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Welcome back, max@example.com                                │
│                                                               │
│  Your Sessions                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🔒 Christmas 2025         planning     Dec 7, 2025      ││
│  │    0 of 0 participants viewed                           ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ 🔒 Office Secret Santa    drawn        Dec 5, 2025      ││
│  │    3 of 5 participants viewed                           ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ 🔒 Family Wichtel 2024    archived     Dec 1, 2024      ││
│  │    8 of 8 participants viewed                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  [+ Create New Session]                                       │
│                                                               │
│  Note: Session names and view counts are visible.             │
│  Participant details are encrypted and require your           │
│  master password or Face ID to view.                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Unlock Modal

```
┌──────────────────────────────────────────┐
│  🔒 Unlock Session                       │
│                                          │
│  Christmas 2025                          │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │         [Face ID Icon]             │  │
│  │                                    │  │
│  │    Unlock with Face ID             │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ─────────────── or ───────────────      │
│                                          │
│  Master Password:                        │
│  [••••••••••••••••]                      │
│                                          │
│  ☐ Keep unlocked for this browser session│
│                                          │
│  [Unlock]              [Cancel]          │
│                                          │
└──────────────────────────────────────────┘
```

### Session View (After Unlock)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                Christmas 2025         [🔓 Unlocked]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Status: planning                                             │
│                                                               │
│  Participants (5)                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Name          Phone              Viewed      Actions     ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ Hans          +41 79 123 4567    ✓ Dec 8    [Resend]    ││
│  │ Maria         +41 79 234 5678    ✓ Dec 8    [Resend]    ││
│  │ Peter         +41 79 345 6789    ○ -        [Send]      ││
│  │ Anna          +41 79 456 7890    ○ -        [Send]      ││
│  │ Thomas        +41 79 567 8901    ○ -        [Send]      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  [+ Add Participant]                                          │
│                                                               │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  [Draw Names]                    [Send All WhatsApp Links]   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Platform Support

### WebAuthn Biometric Compatibility

| Platform | Biometric | Support |
|----------|-----------|---------|
| iOS Safari 14+ | Face ID / Touch ID | ✅ Full |
| Android Chrome 70+ | Fingerprint / Face | ✅ Full |
| macOS Safari 14+ | Touch ID | ✅ Full |
| macOS Chrome 67+ | Touch ID | ✅ Full |
| Windows 10+ Edge/Chrome | Windows Hello | ✅ Full |
| Linux | Limited | ⚠️ Fallback to password |
| Older browsers | None | ⚠️ Fallback to password |

---

## Security Considerations

### What This Protects Against
- ✅ Database breaches (data is encrypted at rest)
- ✅ Malicious DB administrators (cannot read encrypted blobs)
- ✅ Developer access via service role (cannot decrypt)
- ✅ Supabase infrastructure access (cannot decrypt)
- ✅ Legal subpoenas (you cannot provide what you cannot decrypt)

### What This Does NOT Protect Against
- ❌ Compromised client device (malware on organizer's computer)
- ❌ Weak passwords (brute force on stolen encrypted data)
- ❌ Organizer sharing their password
- ❌ Screen capture / shoulder surfing after unlock

### Recommendations
1. Enforce minimum password strength (12+ chars)
2. Rate-limit failed decryption attempts
3. Clear decrypted data from memory after session timeout
4. Log failed unlock attempts (without logging the password)

---

## Implementation Checklist

### Phase 1: Database & Core
- [ ] Create `organizer_encryption` table
- [ ] Add `encrypted_data`, `is_encrypted` to sessions
- [ ] Create `reveal_tracking` table
- [ ] Create `reveal_links` table
- [ ] Set up RLS policies

### Phase 2: Encryption Library
- [ ] Create `lib/crypto.ts` with AES-GCM utilities
- [ ] Create `lib/biometric-storage.ts` with WebAuthn
- [ ] Add `@simplewebauthn/browser` dependency

### Phase 3: Services
- [ ] Create `encryptedSessionService.ts`
- [ ] Create `revealService.ts`
- [ ] Update draw algorithm for encrypted data

### Phase 4: UI Components
- [ ] Master password setup modal
- [ ] Unlock modal with Face ID option
- [ ] Dashboard with lock icons
- [ ] Biometric setup prompt

### Phase 5: API Routes
- [ ] POST `/api/reveal-viewed` for tracking
- [ ] Update session CRUD routes

### Phase 6: Testing
- [ ] Unit tests for crypto functions
- [ ] Integration tests for full flow
- [ ] Test Face ID on iOS/macOS
- [ ] Test fingerprint on Android
- [ ] Test fallback to password

---

## Summary

| Feature | Non-Encrypted (Default) | Encrypted (Optional) |
|---------|-------------------------|----------------------|
| **Session names** | Plaintext - visible on dashboard | Plaintext - visible on dashboard |
| **Sensitive data** | Plaintext in database | AES-256-GCM encrypted |
| **Password required** | No | Yes - one master password per organizer |
| **Key derivation** | N/A | PBKDF2 with 100K iterations |
| **Biometric unlock** | N/A | WebAuthn - Face ID / Touch ID |
| **Reveal tracking** | Plaintext metadata | Plaintext metadata |
| **Password recovery** | N/A | Impossible - by design |
| **Access level** | RLS-protected (organizer + DB admins) | Only organizer with password |

**Encryption is completely optional.**

- **Without encryption**: Simple, fast, RLS-protected access. Good for low-sensitivity use cases.
- **With encryption**: Zero-knowledge architecture ensures only the organizer can decrypt data, even protecting against DB administrators. Good for high-sensitivity use cases.

Organizers can choose the mode that best fits their privacy requirements.
