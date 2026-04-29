import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...payload } = await req.json();
    const supabase = createServerClient() as any;
    const userId = params.id;

    if (action === 'edit_profile') {
      const { full_name, email } = payload;
      const { error } = await supabase.from('users').update({ full_name, email }).eq('id', userId);
      if (error) throw error;

      const { data: updatedUser } = await supabase.from('users').select('*, subscriptions(*)').eq('id', userId).single();
      return NextResponse.json(updatedUser);
    }

    if (action === 'toggle_subscription') {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!sub) {
        return NextResponse.json({ error: 'No subscription found for this user' }, { status: 404 });
      }

      const newStatus = sub.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase.from('subscriptions').update({
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', sub.id);

      if (error) throw error;

      const { data: updatedUser } = await supabase.from('users').select('*, subscriptions(*)').eq('id', userId).single();
      return NextResponse.json(updatedUser);
    }

    if (action === 'update_score') {
      const { scoreId, score } = payload;
      if (!Number.isInteger(score) || score < 1 || score > 45) {
        return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
      }
      const { error } = await supabase.from('scores').update({ score }).eq('id', scoreId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_score') {
      const { scoreId } = payload;
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', params.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(scores || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
