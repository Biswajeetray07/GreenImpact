import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single()

    const role = dbUser?.role || 'subscriber'

    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (path.startsWith('/dashboard')) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', dbUser?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (role !== 'admin') {
        const status = sub?.status || 'inactive';

        if (status === 'cancelled') {
          return NextResponse.redirect(new URL('/pricing', request.url))
        }

        if (status === 'lapsed' || status === 'inactive') {
          if (path !== '/dashboard' && !path.startsWith('/dashboard/verify')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
          response.headers.set('x-subscription-inactive', 'true')
          response.cookies.set('subscription_inactive', 'true')
        } else {
          // ensure cookie is removed if active
          response.cookies.delete('subscription_inactive')
        }
      }
    }
  }

  if (user && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
