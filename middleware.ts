import createMiddleware from 'next-intl/middleware'
import { updateSession } from './services/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// i18n Middleware
const intlMiddleware = createMiddleware({
  locales: ['de', 'fr', 'it', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed', // /app = de, /fr/app = fr
  localeDetection: true,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle reveal pages specially: redirect /reveal/* to /de/reveal/*
  if (pathname.startsWith('/reveal/') && !pathname.startsWith('/de/reveal/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/de${pathname}`
    return NextResponse.redirect(url)
  }

  // Handle i18n routing first
  const i18nResponse = intlMiddleware(request)

  // If i18n middleware returned a response (redirect/rewrite), return it
  if (i18nResponse) {
    return i18nResponse
  }

  // Then handle Supabase auth with the original request
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
