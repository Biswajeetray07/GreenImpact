import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { generateRandomDraw, generateAlgorithmDraw, calculateMatches, getTier } from '@/lib/drawEngine';
import { calculatePrizePool, calculatePrizePerWinner } from '@/lib/prizeCalculator';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const { data: draw } = await supabase.from('draws').select('*').eq('id', params.id).single();
    if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });

    const { data: subs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
    const activeSubscriberCount = subs?.length || 0;

    let drawnNumbers: number[] = [];
    const dateObj = new Date(draw.month);
    const endOfMonthStr = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    
    if (draw.draw_type === 'algorithm') {
      const startOfMonthStr = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).toISOString();
      const { data: scoresInMonth } = await supabase
        .from('scores')
        .select('score')
        .gte('date', startOfMonthStr)
        .lte('date', endOfMonthStr);
        
      const allScores = scoresInMonth ? scoresInMonth.map((s: any) => s.score) : [];
      drawnNumbers = generateAlgorithmDraw(allScores);
    } else {
      drawnNumbers = generateRandomDraw();
    }

    const preview: any[] = [];
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

      preview.push({ userId: sub.user_id, matchCount, tier, scoreValues });
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

    for (const p of preview) {
      if (p.tier === 5) p.estimatedPrize = prizePerT5;
      else if (p.tier === 4) p.estimatedPrize = prizePerT4;
      else if (p.tier === 3) p.estimatedPrize = prizePerT3;
      else p.estimatedPrize = 0;
    }

    await supabase.from('draws').update({
      drawn_numbers: drawnNumbers,
      status: 'simulated',
      prize_pool_total: prizeBreakdown.total,
    }).eq('id', draw.id);

    return NextResponse.json({
      drawnNumbers,
      preview: preview.filter(p => p.tier !== null),
      prizeBreakdown
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
