import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || !userObj.dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userObj.dbUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!sub || !sub.stripe_customer_id) {
      return NextResponse.json({ error: 'No active Stripe customer found' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
