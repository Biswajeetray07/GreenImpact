import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { calculateMatches, getTier } from '@/lib/drawEngine';
import { calculatePrizePool, calculatePrizePerWinner } from '@/lib/prizeCalculator';
import { sendDrawResultsEmail, sendWinnerAlertEmail } from '@/lib/email';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const { data: draw } = await supabase.from('draws').select('*').eq('id', params.id).single();
    if (!draw || draw.status !== 'simulated') {
      return NextResponse.json({ error: 'Draw must be simulated before publishing' }, { status: 400 });
    }

    const drawnNumbers = draw.drawn_numbers;
    if (!drawnNumbers || drawnNumbers.length !== 5) {
      return NextResponse.json({ error: 'Invalid drawn numbers' }, { status: 400 });
    }

    const { data: subs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
    const activeSubscriberCount = subs?.length || 0;

    const dateObj = new Date(draw.month);
    const endOfMonthStr = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const matches: any[] = [];
    let tier5Count = 0; let tier4Count = 0; let tier3Count = 0;

    for (const sub of subs || []) {
      const { data: userScores } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', sub.user_id)
        .lte('date', endOfMonthStr)
        .order('date', { ascending: false })
        .limit(5);

      const scoreValues = userScores ? userScores.map((s: any) => s.score) : [];
      const matchCount = calculateMatches(scoreValues, drawnNumbers);
      const tier = getTier(matchCount);

      if (tier === 5) tier5Count++;
      if (tier === 4) tier4Count++;
      if (tier === 3) tier3Count++;

      matches.push({ userId: sub.user_id, matchCount, tier, scoreValues });
    }

    const { data: prevDraws } = await supabase
      .from('draws')
      .select('prize_pool_total')
      .eq('jackpot_rollover', true)
      .lt('month', draw.month)
      .order('month', { ascending: false })
      .limit(1);

    const previousJackpot = prevDraws && prevDraws.length > 0 ? prevDraws[0].prize_pool_total * 0.40 : 0;
    const prizeContributionPerSubscriber = 5.00;
    const prizeBreakdown = calculatePrizePool(activeSubscriberCount, prizeContributionPerSubscriber, previousJackpot);

    const prizePerT5 = calculatePrizePerWinner(prizeBreakdown.jackpot, tier5Count);
    const prizePerT4 = calculatePrizePerWinner(prizeBreakdown.fourMatch, tier4Count);
    const prizePerT3 = calculatePrizePerWinner(prizeBreakdown.threeMatch, tier3Count);

    let winnersCount = 0;

    for (const m of matches) {
      await supabase.from('draw_entries').insert({
        draw_id: draw.id,
        user_id: m.userId,
        user_scores: m.scoreValues,
        match_count: m.matchCount,
        tier: m.tier
      });

      if (m.tier !== null) {
        let amount = 0;
        if (m.tier === 5) amount = prizePerT5;
        if (m.tier === 4) amount = prizePerT4;
        if (m.tier === 3) amount = prizePerT3;

        await supabase.from('winners').insert({
          draw_id: draw.id,
          user_id: m.userId,
          tier: m.tier,
          prize_amount: amount,
          status: 'pending'
        });
        winnersCount++;
        
        const { data: u } = await supabase.from('users').select('full_name, email').eq('id', m.userId).single();
        if (u) {
          const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
          await sendWinnerAlertEmail(u.email, u.full_name, m.tier, amount, verifyUrl);
        }
      }
      
      const { data: u2 } = await supabase.from('users').select('full_name, email').eq('id', m.userId).single();
      if (u2) {
        await sendDrawResultsEmail(u2.email, u2.full_name, drawnNumbers, m.scoreValues, m.matchCount, m.tier);
      }
    }

    const jackpotRollover = tier5Count === 0;

    await supabase.from('draws').update({
      status: 'published',
      jackpot_rollover: jackpotRollover
    }).eq('id', draw.id);

    return NextResponse.json({ success: true, winnersCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
