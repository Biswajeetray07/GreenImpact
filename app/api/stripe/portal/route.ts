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
      console.error('Portal: Auth failed', authError?.message);
      return NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 });
    }

    // 2. Get user email from DB (service-role bypasses RLS)
    const supabase = createServerClient() as any;
    const { data: dbUser, error: dbErr } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth_id', user.id)
      .single();

    if (dbErr || !dbUser) {
      console.error('Portal: DB user not found', dbErr?.message, 'auth_id:', user.id);
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    console.log('Portal: Looking up Stripe customer for', dbUser.email);

    // 3. Strategy A: Check subscriptions table first (fast path)
    let customerId: string | null = null;

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', dbUser.id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sub?.stripe_customer_id) {
      customerId = sub.stripe_customer_id;
      console.log('Portal: Found customer in DB:', customerId);
    }

    // 4. Strategy B: Search Stripe directly by email
    if (!customerId) {
      console.log('Portal: DB miss, searching Stripe by email:', dbUser.email);
      const customers = await stripe.customers.list({ email: dbUser.email, limit: 5 });
      console.log('Portal: Stripe returned', customers.data.length, 'customers');

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('Portal: Found customer in Stripe:', customerId);

        // Backfill into DB for next time
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
          .eq('user_id', dbUser.id);
      }
    }

    // 5. Strategy C: Search Stripe by auth email (in case DB email differs)
    if (!customerId && user.email && user.email !== dbUser.email) {
      console.log('Portal: Trying auth email:', user.email);
      const customers = await stripe.customers.list({ email: user.email, limit: 5 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('Portal: Found customer via auth email:', customerId);
      }
    }

    if (!customerId) {
      console.error('Portal: No customer found anywhere for', dbUser.email);
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe from the Pricing page first.' },
        { status: 400 }
      );
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
