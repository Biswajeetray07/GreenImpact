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

    const { action } = await req.json();
    
    const supabase = createServerClient() as any;
    const { data: winner } = await supabase.from('winners').select('*').eq('id', params.id).single();
    if (!winner) return NextResponse.json({ error: 'Winner not found' }, { status: 404 });

    let updateData: any = {};
    const now = new Date().toISOString();

    if (action === 'approve') {
      if (winner.status !== 'pending') return NextResponse.json({ error: 'Only pending winnings can be approved' }, { status: 400 });
      updateData = { status: 'approved', reviewed_at: now };
    } else if (action === 'reject') {
      if (winner.status !== 'pending') return NextResponse.json({ error: 'Only pending winnings can be rejected' }, { status: 400 });
      updateData = { status: 'rejected', reviewed_at: now };
    } else if (action === 'mark_paid') {
      if (winner.status !== 'approved') {
        return NextResponse.json({ error: 'Only approved winnings can be marked as paid' }, { status: 400 });
      }
      updateData = { status: 'paid', paid_at: now };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updatedWinner, error } = await supabase
      .from('winners')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updatedWinner);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
