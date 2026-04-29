import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

/**
 * Cookie-based server client — for API routes and server components.
 * Reads the user session from request cookies so auth.getUser() works.
 * 
 * IMPORTANT: This file can ONLY be imported in server-side code (API routes, 
 * server components, middleware). Never import this in 'use client' components.
 */
export function createRouteClient() {
  const cookieStore = cookies()
  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch (e) { /* read-only in RSC */ }
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch (e) { /* read-only in RSC */ }
        },
      },
    }
  )
}
