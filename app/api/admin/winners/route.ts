import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const url = new URL(req.url);
    const drawId = url.searchParams.get('drawId');
    const status = url.searchParams.get('status');
    const tier = url.searchParams.get('tier');

    let query = supabase
      .from('winners')
      .select('*, users(full_name, email), draws(month)')
      .order('created_at', { ascending: false });

    if (drawId) query = query.eq('draw_id', drawId);
    if (status) query = query.eq('status', status);
    if (tier) query = query.eq('tier', tier);

    const { data: winners, error } = await query;
    if (error) throw error;

    return NextResponse.json(winners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
