import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const { percentage } = await req.json();

    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = parseInt(percentage, 10);
    if (!p || p < 10) {
      return NextResponse.json({ error: 'Minimum charity contribution is 10%' }, { status: 400 });
    }
    if (p > 100) {
      return NextResponse.json({ error: 'Maximum charity contribution is 100%' }, { status: 400 });
    }

    const supabase = createServerClient() as any;
    const { error } = await supabase
      .from('subscriptions')
      .update({ charity_percentage: p })
      .eq('user_id', userObj.dbUser?.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
