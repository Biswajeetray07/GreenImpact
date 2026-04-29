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
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('month', { ascending: false });

    if (error) throw error;
    return NextResponse.json(draws);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { month, drawType } = await req.json();

    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const { count } = await supabase
      .from('draws')
      .select('*', { count: 'exact', head: true })
      .eq('month', month);

    if (count && count > 0) {
      return NextResponse.json({ error: 'Draw already exists for this month' }, { status: 400 });
    }

    const { data: newDraw, error } = await supabase
      .from('draws')
      .insert({
        month,
        draw_type: drawType,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newDraw);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
