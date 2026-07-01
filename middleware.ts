import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = req.nextUrl.pathname
  const onOnboarding = path === '/onboarding'
  const redirect = (to: string) => NextResponse.redirect(new URL(to, req.url))

  // Unauthenticated → only /auth is reachable for these protected routes.
  if (!user) return redirect('/auth')

  // Authenticated → branch on onboarding status.
  const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', user.id).single()
  const onboarded = profile?.onboarded ?? false

  if (!onboarded && !onOnboarding) return redirect('/onboarding')
  if (onboarded && onOnboarding) return redirect('/dashboard')

  return res
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/onboarding'],
}
