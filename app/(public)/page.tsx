import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import FeaturedCharity from '@/components/FeaturedCharity';

export default async function Home() {
  const supabase = createServerClient() as any;

  const [
    { data: charities },
    { count: subscriberCount },
    { data: donations },
    { data: latestDraw },
  ] = await Promise.all([
    supabase.from('charities').select('*').eq('is_active', true).eq('is_featured', true).limit(3),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('donations').select('amount'),
    supabase.from('draws').select('prize_pool_total').eq('status', 'published').order('month', { ascending: false }).limit(1),
  ]);

  const totalDonated = donations ? donations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0) : 0;
  const currentPrizePool = latestDraw && latestDraw.length > 0 ? Number(latestDraw[0].prize_pool_total || 0) : 0;

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-primary overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 lg:py-44">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-block bg-accent text-[#1A1A1A] font-bold px-5 py-1.5 rounded-full text-sm uppercase tracking-widest mb-8 shadow-lg">
              Golf × Charity × Community
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white mb-8 leading-[1.1]">
              Every round <br />
              <span className="text-accent">changes a life.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#A1C1B1] max-w-xl mb-12 leading-relaxed">
              Track your Stableford scores, enter monthly prize draws, and direct a portion of every subscription to a cause you believe in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="btn-shine bg-accent text-[#1A1A1A] font-bold py-4 px-10 rounded-full text-center text-lg hover:scale-[1.03] transition-transform shadow-xl"
              >
                Start Your Impact
              </Link>
              <Link
                href="/charities"
                className="bg-transparent border-2 border-[#A1C1B1] text-[#A1C1B1] font-bold py-4 px-10 rounded-full text-center text-lg hover:bg-white hover:text-primary hover:border-white transition-all"
              >
                Our Charities
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,30 C320,60 720,0 1440,30 L1440,60 L0,60 Z" fill="#F7F4EE"/>
          </svg>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="bg-cream py-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 -mt-8 relative z-10 stagger-children">
            <div className="stat-card text-center">
              <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Active Members</p>
              <p className="text-4xl font-serif gradient-text">{subscriberCount || 0}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Raised for Charity</p>
              <p className="text-4xl font-serif gradient-text">£{totalDonated.toFixed(0)}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Current Prize Pool</p>
              <p className="text-4xl font-serif gradient-text">£{currentPrizePool.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="bg-cream py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-bold text-accent uppercase tracking-widest">Simple Process</span>
            <h2 className="font-serif text-4xl sm:text-5xl text-primary mt-3 mb-4">How it works</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">Three simple steps to start making a difference through golf.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 stagger-children">
            {[
              {
                step: '01',
                title: 'Subscribe',
                desc: 'Choose a monthly or yearly plan. At least 10% of your fee goes directly to a charity of your choice.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                ),
              },
              {
                step: '02',
                title: 'Play & Track',
                desc: 'Log your latest 5 Stableford scores. The platform keeps your most recent rounds for the monthly draw.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                ),
              },
              {
                step: '03',
                title: 'Win & Give',
                desc: 'Match your scores with the monthly draw numbers. 3, 4, or 5 matches win a share of the prize pool.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow group">
                <div className="absolute -top-4 left-8 bg-accent text-[#1A1A1A] font-bold px-4 py-1 rounded-full text-sm shadow-sm">
                  Step {item.step}
                </div>
                <div className="w-14 h-14 rounded-full bg-[#F0F7F4] flex items-center justify-center text-primary mb-6 mt-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-serif text-2xl text-primary mb-3">{item.title}</h3>
                <p className="text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED CHARITY ═══ */}
      <FeaturedCharity />

      {/* ═══ PRIZE TIERS ═══ */}
      <section className="bg-cream py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-accent uppercase tracking-widest">Rewards</span>
            <h2 className="font-serif text-4xl sm:text-5xl text-primary mt-3 mb-4">Prize breakdown</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Each month&apos;s prize pool is split across three tiers. No matches? The jackpot rolls over.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              { tier: '5 Matches', share: '40%', label: 'Jackpot', color: 'bg-[#FFF8E7] border-accent', iconBg: 'bg-accent', emoji: '🏆' },
              { tier: '4 Matches', share: '35%', label: 'Second Tier', color: 'bg-[#F0F7F4] border-success', iconBg: 'bg-success', emoji: '🥈' },
              { tier: '3 Matches', share: '25%', label: 'Third Tier', color: 'bg-white border-[#E5E7EB]', iconBg: 'bg-primary', emoji: '🥉' },
            ].map((t) => (
              <div key={t.tier} className={`rounded-2xl border-2 p-8 text-center hover:scale-[1.03] transition-transform shadow-sm ${t.color}`}>
                <span className="text-4xl mb-4 block">{t.emoji}</span>
                <h3 className="font-serif text-2xl text-primary mb-2">{t.tier}</h3>
                <p className="text-5xl font-serif text-primary mb-2">{t.share}</p>
                <p className="text-sm text-text-muted font-bold uppercase tracking-wider">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-primary py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6 leading-tight">
            Ready to play with purpose?
          </h2>
          <p className="text-[#A1C1B1] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join a community of golfers who believe that every round can make a real difference. Your scores, your charity, your impact.
          </p>
          <Link
            href="/signup"
            className="btn-shine inline-block bg-accent text-[#1A1A1A] font-bold py-4 px-12 rounded-full text-lg hover:scale-[1.03] transition-transform shadow-xl"
          >
            Get Started — It&apos;s £9.99/mo
          </Link>
        </div>
      </section>
    </>
  );
}
