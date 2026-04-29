import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const { charityId } = await req.json();

    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!charityId) {
      return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 });
    }

    const supabase = createServerClient() as any;
    const { error } = await supabase
      .from('subscriptions')
      .update({ charity_id: charityId })
      .eq('user_id', userObj.dbUser?.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
