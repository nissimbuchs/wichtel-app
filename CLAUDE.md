# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wichtel App** - A modern serverless Secret Santa / gift exchange organizer with guaranteed anonymity, even for organizers who participate. Built with Next.js 16, Supabase, and deployed on Vercel. All UI and documentation in German.

## Common Commands

### Development
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build for production (validates types and build output)
npm start          # Run production build locally
npm run lint       # Run ESLint checks
```

### Database Management
```bash
# Using Supabase CLI (requires installation: npm install -g supabase)
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push                    # Apply migrations to remote database
supabase db reset                   # Reset local database with migrations
supabase gen types typescript       # Regenerate TypeScript types from schema
```

### Testing
- No automated tests currently implemented
- Manual testing workflow: Create session → Add participants → Run draw → Test WhatsApp links → Test reveal page

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 App Router with React 19, TypeScript 5.9
- **Backend**: Supabase (PostgreSQL + Auth + Auto-generated REST APIs)
- **Styling**: Tailwind CSS 3.4 with custom Christmas-themed glassmorphism design system
- **Animation**: Framer Motion 12 for slot machine reveal effect
- **Icons**: Lucide React wrapped in custom `WichtelIcon` component
- **Auth**: Supabase Magic Links (passwordless email authentication)

### Key Architecture Patterns

**1. Serverless JAMstack Architecture**
- All pages are Next.js App Router routes (Server Components by default)
- API routes use Next.js Route Handlers (`/app/api/*/route.ts`)
- Static generation where possible, server-side rendering for authenticated pages

**2. Multi-Client Supabase Pattern**
Three distinct Supabase client configurations:
- `services/supabase/client.ts` - Browser client (client components)
- `services/supabase/server.ts` - Server client (Server Components, Server Actions)
- Admin client with `SUPABASE_SERVICE_ROLE_KEY` - Only in `/app/api/draw/route.ts` for bypassing RLS during draw

**3. Token-Based Participant Access**
- Participants access reveal pages via unique tokens (UUIDs), not authentication
- Pattern: `/reveal/[token]` pages are public, tokens stored in `participants.participant_token`
- Organizers use full authentication; participants use simple token links

**4. Guaranteed Anonymity System**
Multi-layer defense to ensure organizers cannot see other participants' assignments:
- **Database**: `assigned_to_id` field exists but RLS + query patterns restrict access
- **Type System**: `ParticipantAdmin` type explicitly excludes `assigned_to_id` field
- **API**: Draw algorithm runs with service role key, updates happen server-side only
- **Frontend**: No UI components display assignments except on reveal page

**5. Derangement Algorithm**
Location: `services/drawAlgorithm.ts`
- Implements Fisher-Yates shuffle with validation
- Guarantees no self-assignment (derangement constraint)
- Runs client-side to generate assignments, then persists via API call

### Database Schema

**Core Tables**:
```
sessions
├── id (UUID, PK)
├── organizer_id (UUID, FK to auth.users)
├── name (VARCHAR)
├── status ('planning' | 'drawn' | 'completed' | 'archived')
├── admin_token (VARCHAR, unique)
└── timestamps

participants
├── id (UUID, PK)
├── session_id (UUID, FK to sessions, CASCADE DELETE)
├── name (VARCHAR)
├── phone_number (VARCHAR)
├── participant_token (VARCHAR, unique)
├── assigned_to_id (UUID, FK to participants, SET NULL)
├── is_organizer (BOOLEAN)
├── whatsapp_sent_at (TIMESTAMP)
└── timestamps

CONSTRAINT: no_self_assignment CHECK (id != assigned_to_id)
```

**Important**: There is NO separate `organizers` table. Organizers are users in `auth.users` table, linked via `sessions.organizer_id`.

**Custom Types** (`types/database.types.ts`):
- `ParticipantAdmin` - View for organizers, excludes `assigned_to_id`
- `ParticipantWithAssignment` - View for reveal pages, includes `assigned_to_id`

**RLS Policies**:
- Sessions: Users can only access their own sessions (`organizer_id = auth.uid()`)
- Participants: Organizers can manage participants in their sessions; public can read by token

### Project Structure

```
app/
├── page.tsx                      # Landing page (public)
├── login/page.tsx                # Magic link authentication
├── auth/callback/route.ts        # OAuth callback handler
├── app/                          # Protected area (requires auth)
│   ├── page.tsx                  # Dashboard with session list
│   └── session/
│       ├── new/page.tsx          # Create new session
│       └── [id]/page.tsx         # Session detail & participant management
├── reveal/[token]/page.tsx       # Public reveal page with slot machine animation
└── api/
    └── draw/route.ts             # Server-side draw algorithm execution

components/
├── effects/                      # SnowfallBackground
├── icons/                        # WichtelIcon wrapper
├── layout/                       # Footer
├── reveal/                       # SlotMachineReveal animation
└── sessions/                     # Session management components

services/
├── supabase/                     # Client configurations
│   ├── client.ts                 # Browser client
│   ├── server.ts                 # Server client with cookies
│   └── middleware.ts             # Auth middleware
├── drawAlgorithm.ts              # Derangement algorithm
└── whatsappService.ts            # WhatsApp deep link generation

types/
└── database.types.ts             # Auto-generated + custom types

supabase/
├── migrations/                   # Database schema migrations
└── email-templates/              # Custom auth email templates
```

### Authentication Flow

1. User visits `/login` and enters email
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback`
4. Callback exchanges code for session, stores in cookies
5. Middleware protects `/app/*` routes, redirects unauthenticated users
6. Use `useAuth()` hook in client components or `createServerClient()` in Server Components

**Access the current user**:
```typescript
// Client Component
import { useAuth } from '@/hooks/useAuth';
const { user, loading, signOut } = useAuth();

// Server Component
import { createServerClient } from '@/services/supabase/server';
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Database Queries

**Always use the correct Supabase client**:
- Client Components: `createBrowserClient()`
- Server Components/Actions: `createServerClient()` (async function)
- Admin operations: Service role key (only in API routes)

**Fetch sessions for current user**:
```typescript
const { data: sessions } = await supabase
  .from('sessions')
  .select('*')
  .eq('organizer_id', user.id)
  .order('created_at', { ascending: false });
```

**Fetch participants for session (organizer view - NO assignments)**:
```typescript
const { data: participants } = await supabase
  .from('participants')
  .select('id, name, phone_number, participant_token, is_organizer, whatsapp_sent_at')
  .eq('session_id', sessionId)
  .order('created_at');
```

**Fetch participant assignment (reveal page)**:
```typescript
const { data: participant } = await supabase
  .from('participants')
  .select('id, name, assigned_to_id')
  .eq('participant_token', token)
  .single();

const { data: assignedPerson } = await supabase
  .from('participants')
  .select('name')
  .eq('id', participant.assigned_to_id)
  .single();
```

### Styling System

**Tailwind + Custom Utilities**:
- Base config in `tailwind.config.ts`
- Custom utilities in `app/globals.css`

**Custom Classes**:
```css
.glass-card          # Glassmorphism card with frost shadow
.glass-button        # Primary glass button with hover states
.glass-button-secondary  # Secondary glass button
.shadow-frost        # Custom frost shadow
.bg-christmas-gradient   # Red to green gradient
```

**Color Palette**:
```javascript
'christmas-red': '#DC2626'
'christmas-green': '#059669'
'christmas-gold': '#F59E0B'
'christmas-bg': '#0F172A'
```

**Animation Classes**:
```css
animate-wiggle       # Subtle rotation animation
animate-float        # Floating effect
animate-glow-pulse   # Pulsing glow effect
```

**Icon Usage**:
```tsx
import WichtelIcon from '@/components/icons/WichtelIcon';
<WichtelIcon name="gift" size={24} className="..." />
```

### WhatsApp Integration

**Service**: `services/whatsappService.ts`

**Generate WhatsApp link**:
```typescript
import { generateWhatsAppLink } from '@/services/whatsappService';

const link = generateWhatsAppLink(
  participant.phone_number,
  `🎄 Hallo ${participant.name}! Hier ist dein Wichtel-Link: ${revealUrl}`
);
```

**Smart Number Handling**:
- Converts Swiss numbers: `0XX XXX XX XX` → `41XXXXXXXXX`
- Removes all non-digit characters
- Uses `api.whatsapp.com/send` for cross-platform compatibility

### Session Lifecycle

**Status Flow**:
```
planning → drawn → completed → archived
```

**Key Operations**:
- **Archive**: Sets `status = 'archived'`, hides from main dashboard
- **Restore**: Sets `status = 'completed'`, shows in dashboard
- **Duplicate**: Creates new session with same participants, resets `assigned_to_id`, generates new tokens
- **Delete**: Cascade deletes all participants

### Important Files for Context

When modifying features, read these files first:
- `/app/app/session/[id]/page.tsx` - Main session management UI
- `/services/drawAlgorithm.ts` - Core draw logic
- `/app/api/draw/route.ts` - Draw persistence API
- `/app/reveal/[token]/page.tsx` - Reveal experience
- `/types/database.types.ts` - Type definitions
- `/docs/architecture.md` - Detailed architecture decisions

### Critical Security Considerations

**NEVER expose `assigned_to_id` to organizers**:
- Always use `ParticipantAdmin` type for organizer queries
- Never SELECT `assigned_to_id` in queries for `/app/*` routes
- Only reveal page (`/reveal/[token]`) should access assignments

**Service Role Key**:
- Only used in `/app/api/draw/route.ts`
- Never exposed to client
- Required to bypass RLS during draw algorithm execution

**Token Security**:
- Participant tokens are UUIDs (cryptographically secure)
- Admin tokens are UUIDs (for session management URLs)
- Never log or expose tokens in error messages

### Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-side only
```

### Common Development Tasks

**Add a new page**:
1. Create in `/app/` following App Router conventions
2. Use Server Components by default (async components)
3. Add client component only if needed ('use client' directive)
4. Protect with middleware if authentication required

**Add a new component**:
1. Place in `/components/[feature]/`
2. Use TypeScript with proper prop types
3. Use Tailwind + custom utility classes
4. Import `WichtelIcon` for icons, not direct Lucide imports

**Modify database schema**:
1. Create new migration in `/supabase/migrations/`
2. Use format: `YYYYMMDD_description.sql`
3. Test locally with `supabase db reset`
4. Push to production with `supabase db push`
5. Regenerate types with `supabase gen types typescript`

**Update email templates**:
- Modify files in `/supabase/email-templates/`
- Upload to Supabase Dashboard → Authentication → Email Templates

### UI/UX Guidelines

**Language**: All user-facing text in German
**Theme**: Christmas colors (red, green, gold) with glassmorphism
**Mobile-First**: Optimize for smartphone usage (WhatsApp integration)
**Animation**: Use Framer Motion for complex animations, CSS for simple transitions
**Error Messages**: German, friendly tone, actionable guidance
**Loading States**: Show loading indicators for async operations
**Empty States**: Provide clear next steps when no data exists

### Deployment

**Production Environment**: Vercel
**Database**: Supabase Production Project
**Build Validation**: Always run `npm run build` before deploying
**Environment Variables**: Set in Vercel dashboard for production
**Auth Redirect URLs**: Configure in Supabase Dashboard → Authentication → URL Configuration

### Performance Considerations

- Images use Next.js Image component with optimization
- Server Components by default (reduce client-side JavaScript)
- Minimal client-side state (prefer Server Components)
- Database queries use indexes (see migrations for index definitions)
- WhatsApp links generated on-demand (no database storage)

### Known Patterns to Follow

**Client vs Server Components**:
- Default to Server Components (better performance)
- Use Client Components only for interactivity, browser APIs, or React hooks
- Server Components can directly query database
- Client Components need to fetch via API routes or server actions

**Error Handling**:
```typescript
// Server-side
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error description:', error);
  // Return user-friendly German error message
}
```

**Form Submissions**:
- Prefer Server Actions for form handling
- Use `formData` API for form data
- Validate on server-side
- Return German success/error messages
- Revalidate paths after mutations

### Documentation References

- **Full Architecture**: `/docs/architecture.md`
- **User Stories**: `/docs/epics.md`
- **UX Design**: `/docs/ux-design-specification.md`
- **Product Requirements**: `/docs/prd.md`
