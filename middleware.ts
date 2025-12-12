import createMiddleware from 'next-intl/middleware'
import { updateSession } from './services/supabase/middleware'
import { type NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'

// i18n Middleware with cookie-based locale (no URL prefix)
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never', // No locale in URL path
  localeDetection: true, // Auto-detect from browser/cookie
})

export async function middleware(request: NextRequest) {
  // Handle i18n routing first (sets locale from cookie/browser)
  const i18nResponse = intlMiddleware(request)

  // If i18n middleware returned a response (e.g., setting cookies), use it
  if (i18nResponse) {
    // Continue with Supabase auth using the i18n response
    const supabaseResponse = await updateSession(request)

    // Merge i18n cookies with Supabase response
    if (supabaseResponse) {
      i18nResponse.cookies.getAll().forEach(cookie => {
        supabaseResponse.cookies.set(cookie)
      })
      return supabaseResponse
    }

    return i18nResponse
  }

  // If no i18n response, just handle Supabase auth
  const supabaseResponse = await updateSession(request)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
