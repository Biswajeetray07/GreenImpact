import { createServerClient } from '@/lib/supabase';

export default async function AdminReports() {
  const supabase = createServerClient() as any;

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: allSubscriptions },
    { data: draws },
    { data: donations },
    { data: winners },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('plan, status'),
    supabase.from('draws').select('*').order('month', { ascending: false }),
    supabase.from('donations').select('amount, type, created_at'),
    supabase.from('winners').select('prize_amount, status, tier'),
  ]);

  const totalUsersCount = totalUsers || 0;
  const activeSubsCount = activeSubscribers || 0;

  const monthlySubs = allSubscriptions ? allSubscriptions.filter((s: any) => s.plan === 'monthly' && s.status === 'active').length : 0;
  const yearlySubs = allSubscriptions ? allSubscriptions.filter((s: any) => s.plan === 'yearly' && s.status === 'active').length : 0;
  const lapsedSubs = allSubscriptions ? allSubscriptions.filter((s: any) => s.status === 'lapsed').length : 0;
  const cancelledSubs = allSubscriptions ? allSubscriptions.filter((s: any) => s.status === 'cancelled').length : 0;

  const publishedDraws = draws ? draws.filter((d: any) => d.status === 'published').length : 0;
  const totalPrizePoolAll = draws ? draws.reduce((sum: number, d: any) => sum + Number(d.prize_pool_total || 0), 0) : 0;
  const currentDraw = draws && draws.length > 0 ? draws[0] : null;

  const totalDonations = donations ? donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0) : 0;
  const independentDonations = donations ? donations.filter((d: any) => d.type === 'independent').reduce((sum: number, d: any) => sum + Number(d.amount), 0) : 0;
  const subscriptionSplits = donations ? donations.filter((d: any) => d.type === 'subscription_split').reduce((sum: number, d: any) => sum + Number(d.amount), 0) : 0;

  const totalPaidOut = winners ? winners.filter((w: any) => w.status === 'paid').reduce((sum: number, w: any) => sum + Number(w.prize_amount), 0) : 0;
  const pendingPayouts = winners ? winners.filter((w: any) => w.status === 'pending' || w.status === 'approved').reduce((sum: number, w: any) => sum + Number(w.prize_amount), 0) : 0;
  const totalWinners = winners ? winners.length : 0;
  const tier5Winners = winners ? winners.filter((w: any) => w.tier === 5).length : 0;
  const tier4Winners = winners ? winners.filter((w: any) => w.tier === 4).length : 0;
  const tier3Winners = winners ? winners.filter((w: any) => w.tier === 3).length : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-serif text-4xl text-primary">Reports &amp; Analytics</h1>

      {/* User Stats */}
      <section>
        <h2 className="font-serif text-2xl text-primary mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Registered Users" value={totalUsersCount.toString()} />
          <Card title="Active Subscribers" value={activeSubsCount.toString()} />
          <Card title="Monthly Plans" value={monthlySubs.toString()} />
          <Card title="Yearly Plans" value={yearlySubs.toString()} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Card title="Lapsed Subscriptions" value={lapsedSubs.toString()} variant="warning" />
          <Card title="Cancelled Subscriptions" value={cancelledSubs.toString()} variant="danger" />
        </div>
      </section>

      {/* Draw Stats */}
      <section>
        <h2 className="font-serif text-2xl text-primary mb-4">Draw Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Total Published Draws" value={publishedDraws.toString()} />
          <Card title="All-Time Prize Pool" value={`£${totalPrizePoolAll.toFixed(2)}`} />
          <Card title="Current Month Pool" value={`£${currentDraw ? Number(currentDraw.prize_pool_total || 0).toFixed(2) : '0.00'}`} />
        </div>
      </section>

      {/* Charity Stats */}
      <section>
        <h2 className="font-serif text-2xl text-primary mb-4">Charity Contributions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card title="Total Raised for Charity" value={`£${totalDonations.toFixed(2)}`} />
          <Card title="Independent Donations" value={`£${independentDonations.toFixed(2)}`} />
          <Card title="Subscription Splits" value={`£${subscriptionSplits.toFixed(2)}`} />
        </div>
      </section>

      {/* Winner Stats */}
      <section>
        <h2 className="font-serif text-2xl text-primary mb-4">Winner Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Winners" value={totalWinners.toString()} />
          <Card title="Tier 5 (Jackpot)" value={tier5Winners.toString()} />
          <Card title="Tier 4" value={tier4Winners.toString()} />
          <Card title="Tier 3" value={tier3Winners.toString()} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Card title="Total Paid Out" value={`£${totalPaidOut.toFixed(2)}`} />
          <Card title="Pending Payouts" value={`£${pendingPayouts.toFixed(2)}`} variant="warning" />
        </div>
      </section>
    </div>
  );
}

function Card({ title, value, variant }: { title: string; value: string; variant?: 'warning' | 'danger' }) {
  let bgClass = 'bg-white border-[#E5E7EB]';
  if (variant === 'warning') bgClass = 'bg-[#FFF8E7] border-accent';
  if (variant === 'danger') bgClass = 'bg-[#FEF2F2] border-danger border-opacity-30';

  return (
    <div className={`p-6 rounded-[16px] border shadow-sm hover:scale-[1.02] transition-transform ${bgClass}`}>
      <p className="text-sm font-bold text-text-muted mb-2">{title}</p>
      <p className="font-serif text-3xl text-primary">{value}</p>
    </div>
  );
}
