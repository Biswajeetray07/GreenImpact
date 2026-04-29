import { redirect } from 'next/navigation';
import { createRouteClient } from '@/lib/supabase-route';
import { getUser } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createRouteClient() as any;
  const userObj = await getUser(supabase) as any;

  if (!userObj || !userObj.dbUser || userObj.dbUser.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
