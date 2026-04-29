import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type AppUser = {
  dbUser: Database['public']['Tables']['users']['Row'] | null;
}

/**
 * Get the current authenticated user from a Supabase client.
 * IMPORTANT: The `supabase` client passed here MUST be a cookie-based client
 * (from createRouteClient) so that auth.getUser() has session context.
 * A service-role client will always return null.
 */
export async function getUser(supabase: SupabaseClient<Database>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  return {
    ...user,
    dbUser
  }
}

export async function getSubscription(supabase: SupabaseClient<Database>, userId: string) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return subscription
}

export function isAdmin(user: AppUser | any) {
  return user?.dbUser?.role === 'admin'
}

export function isActiveSubscriber(subscription: any) {
  return subscription?.status === 'active'
}
