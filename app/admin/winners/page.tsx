import { createServerClient } from '@/lib/supabase';
import AdminWinnersClient from '@/components/admin/AdminWinnersClient';

export default async function AdminWinnersPage() {
  const supabase = createServerClient() as any;
  const { data: winners } = await supabase.from('winners').select('*, users(full_name), draws(month)').order('created_at', { ascending: false });

  return <AdminWinnersClient initialWinners={winners || []} />;
}
