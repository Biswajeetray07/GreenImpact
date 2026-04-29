import { createServerClient } from '@/lib/supabase';
import AdminUsersClient from '@/components/admin/AdminUsersClient';

export default async function AdminUsersPage() {
  const supabase = createServerClient() as any;
  const { data: users } = await supabase.from('users').select('*, subscriptions(*)').order('created_at', { ascending: false });

  return <AdminUsersClient initialUsers={users || []} />;
}
