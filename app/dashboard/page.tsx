import { redirect } from 'next/navigation';
import { createRouteClient } from '@/lib/supabase-route';
import { getUser } from '@/lib/auth';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import ScoreModule from '@/components/dashboard/ScoreModule';
import CharityModule from '@/components/dashboard/CharityModule';
import DrawHistory from '@/components/dashboard/DrawHistory';
import Winnings from '@/components/dashboard/Winnings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createRouteClient() as any;
  
  // Check auth session first
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect('/login');
  }

  const userObj = await getUser(supabase) as any;

  // If auth exists but DB user row doesn't yet (signup race condition),
  // show a setup screen instead of redirecting to login
  if (!userObj || !userObj.dbUser) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm text-center animate-fade-in">
          <div className="w-16 h-16 bg-[#F0F7F4] rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="font-serif text-3xl text-primary mb-3">Setting up your account...</h1>
          <p className="text-text-muted mb-6">
            Your account is being prepared. This usually takes just a moment.
          </p>
          <Link 
            href="/pricing"
            className="inline-block w-full bg-accent text-[#1A1A1A] font-bold py-3 px-4 rounded-full hover:scale-[1.02] transition-transform"
          >
            Choose a Plan
          </Link>
          <p className="text-text-muted text-sm mt-4">
            Or <a href="/dashboard" className="text-primary font-bold hover:text-accent">refresh the page</a> to check again.
          </p>
        </div>
      </div>
    );
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
            <span>Your subscription is inactive — </span>
            <Link href="/pricing" className="underline hover:no-underline">
              Resubscribe to continue playing and making an impact.
            </Link>
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

