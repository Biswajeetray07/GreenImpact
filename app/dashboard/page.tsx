import { redirect } from 'next/navigation';
import { createRouteClient } from '@/lib/supabase-route';
import { getUser } from '@/lib/auth';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import ScoreModule from '@/components/dashboard/ScoreModule';
import CharityModule from '@/components/dashboard/CharityModule';
import DrawHistory from '@/components/dashboard/DrawHistory';
import Winnings from '@/components/dashboard/Winnings';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default async function DashboardPage() {
  const supabase = createRouteClient() as any;
  const userObj = await getUser(supabase) as any;

  if (!userObj || !userObj.dbUser) {
    redirect('/login');
  }

  const userId = userObj.dbUser.id;

  const [
    { data: subscription },
    { data: entries },
    { data: draws }
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('draw_entries').select('*, draws(month)').eq('user_id', userId).order('created_at', { ascending: false }).limit(6),
    supabase.from('draws').select('*').in('status', ['published', 'simulated', 'draft']).order('month', { ascending: false })
  ]);

  const isActive = subscription?.status === 'active';

  return (
    <div className="bg-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {!isActive && (
          <div className="bg-accent text-[#1A1A1A] p-4 rounded-[12px] font-bold text-center shadow-md">
            Your subscription is inactive — Resubscribe to continue playing and making an impact.
          </div>
        )}

        <h1 className="font-serif text-5xl text-primary mb-8">Your dashboard</h1>
        
        <ErrorBoundary>
          <SubscriptionStatus subscription={subscription} />
        </ErrorBoundary>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ErrorBoundary>
              <ScoreModule isActive={isActive} />
            </ErrorBoundary>
            <ErrorBoundary>
              <DrawHistory entries={entries || []} draws={draws || []} />
            </ErrorBoundary>
          </div>
          <div className="space-y-8">
            <ErrorBoundary>
              <CharityModule isActive={isActive} userId={userId} />
            </ErrorBoundary>
          </div>
        </div>

        <ErrorBoundary>
          <Winnings userId={userId} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
