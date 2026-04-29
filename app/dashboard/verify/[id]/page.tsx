import { redirect } from 'next/navigation';
import { createRouteClient } from '@/lib/supabase-route';
import { getUser } from '@/lib/auth';
import ProofUpload from '@/components/ProofUpload';
import Link from 'next/link';

export default async function VerifyWinnerPage({ params }: { params: { id: string } }) {
  const supabase = createRouteClient() as any;
  const userObj = await getUser(supabase) as any;

  if (!userObj || !userObj.dbUser) {
    redirect('/login');
  }

  const { data: winner } = await supabase
    .from('winners')
    .select('*, draws(month)')
    .eq('id', params.id)
    .single();

  if (!winner || winner.user_id !== userObj.dbUser.id) {
    redirect('/dashboard');
  }

  const dateObj = new Date(winner.draws.month);
  const monthString = dateObj.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Link href="/dashboard" className="text-sm font-bold text-text-muted hover:text-primary transition-colors flex items-center mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </Link>
        <div className="bg-white p-8 md:p-12 rounded-[16px] border border-[#E5E7EB] shadow-sm">
          <h1 className="font-serif text-4xl text-primary mb-2">Claim Your Prize</h1>
          <p className="text-text-muted text-lg mb-8">Draw: {monthString}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#FFF8E7] p-6 rounded-[12px] border border-accent">
              <p className="text-sm font-bold text-text-dark mb-1">Match Tier</p>
              <p className="text-3xl font-serif text-primary">{winner.tier} Matches</p>
            </div>
            <div className="bg-[#F0F7F4] p-6 rounded-[12px] border border-success">
              <p className="text-sm font-bold text-text-dark mb-1">Prize Amount</p>
              <p className="text-3xl font-serif text-primary">£{winner.prize_amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-2xl text-primary mb-4">Verification Required</h2>
            <p className="text-text-dark leading-relaxed mb-6">
              To process your payout, we need to verify your scores. Please upload a screenshot from your golf tracking platform showing your submitted scores for the draw period.
            </p>
            <ProofUpload 
              winnerId={winner.id} 
              currentStatus={winner.status} 
              proofUrl={winner.proof_url} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
