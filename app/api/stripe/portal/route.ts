import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user from cookies
    const routeClient = createRouteClient() as any;
    const { data: { user }, error: authError } = await routeClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 });
    }

    // 2. Get DB user record
    const supabase = createServerClient() as any;
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // 3. Try to get stripe_customer_id from subscriptions table
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let customerId = sub?.stripe_customer_id;

    // 4. Fallback: if no customer ID in DB, search Stripe by email
    if (!customerId) {
      const customers = await stripe.customers.list({
        email: dbUser.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;

        // Backfill the customer ID into subscriptions for next time
        if (sub) {
          await supabase
            .from('subscriptions')
            .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
            .eq('user_id', dbUser.id);
        }
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found. Please subscribe first.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
