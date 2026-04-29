import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { score } = await req.json();
    const id = params.id;

    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: 'Score must be an integer between 1 and 45' }, { status: 400 });
    }

    const supabase = createServerClient() as any;
    const { data: existingScore } = await supabase
      .from('scores')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingScore) return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    if (existingScore.user_id !== userObj.dbUser?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updatedScore, error } = await supabase
      .from('scores')
      .update({ score })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedScore);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient() as any;
    const { data: existingScore } = await supabase
      .from('scores')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingScore) return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    if (existingScore.user_id !== userObj.dbUser?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('scores').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
