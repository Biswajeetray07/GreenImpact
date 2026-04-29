import { createServerClient } from '@/lib/supabase';
import AdminCharitiesClient from '@/components/admin/AdminCharitiesClient';

export default async function AdminCharitiesPage() {
  const supabase = createServerClient() as any;
  const { data: charities } = await supabase.from('charities').select('*').order('created_at', { ascending: false });

  return <AdminCharitiesClient initialCharities={charities || []} />;
}
