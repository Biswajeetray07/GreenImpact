import { createServerClient } from '@/lib/supabase';
import AdminDrawsClient from '@/components/admin/AdminDrawsClient';

export default async function AdminDrawsPage() {
  const supabase = createServerClient() as any;
  const { data: draws } = await supabase.from('draws').select('*').order('month', { ascending: false });

  return <AdminDrawsClient initialDraws={draws || []} />;
}
