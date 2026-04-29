import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { getUser, getSubscription, isActiveSubscriber } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createRouteClient() as any;
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userObj.dbUser?.id)
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(scores);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { score, date } = await req.json();
    
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = userObj.dbUser?.id;

    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: 'Score must be an integer between 1 and 45' }, { status: 400 });
    }
    if (!date || isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'Valid date is required' }, { status: 400 });
    }

    const supabase = createRouteClient() as any;
    const sub = await getSubscription(supabase, userId);
    if (!isActiveSubscriber(sub)) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
    }

    const { count, error: countError } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('date', date);

    if (countError) throw countError;
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'A score already exists for this date. Please edit the existing entry instead.' },
        { status: 409 }
      );
    }

    const { data: newScore, error: insertError } = await supabase
      .from('scores')
      .insert({ user_id: userId, score, date })
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: allScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (allScores && allScores.length > 5) {
      const excessCount = allScores.length - 5;
      const idsToDelete = allScores.slice(0, excessCount).map((s: any) => s.id);
      
      await supabase
        .from('scores')
        .delete()
        .in('id', idsToDelete);
    }

    return NextResponse.json(newScore);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
