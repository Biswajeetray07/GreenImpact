import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Use service-role client for public charity listing (no auth required)
    const supabase = createServerClient() as any;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('charities')
      .select('*, charity_events(*)');

    query = query.eq('is_active', true);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: charities, error } = await query;
    if (error) throw error;

    const today = new Date().toISOString();
    const result = (charities || []).map((charity: any) => {
      const upcomingEvents = (charity.charity_events || []).filter(
        (e: any) => new Date(e.event_date) >= new Date(today)
      ).sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      
      return { ...charity, charity_events: upcomingEvents };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, image_url, website } = await req.json();
    const supabase = createServerClient() as any;
    const { data, error } = await supabase.from('charities').insert({
      name, description, image_url, website
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, field, value } = await req.json();
    const supabase = createServerClient() as any;
    const { error } = await supabase.from('charities').update({ [field]: value }).eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    const supabase = createServerClient() as any;
    const { error } = await supabase.from('charities').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
