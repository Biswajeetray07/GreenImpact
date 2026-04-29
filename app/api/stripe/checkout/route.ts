import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { planType } = await req.json();

    // 1. Authenticate from cookies
    const routeClient = createRouteClient() as any;
    const { data: { user }, error: authError } = await routeClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 });
    }

    // 2. Use service-role client for all DB operations (bypasses RLS)
    const supabase = createServerClient() as any;

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth_id', user.id)
      .single();

    if (dbError || !dbUser) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }
    
    const userId = dbUser.id;

    // 3. Check existing subscription for a customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, stripe_customer_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    // 4. If no customer ID in DB, also search Stripe directly
    if (!customerId) {
      const existingCustomers = await stripe.customers.list({ email: dbUser.email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }
    }

    // 5. If still no customer, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // 6. Immediately upsert a subscription row with the stripe_customer_id
    //    so the portal route can always find it (even if webhook hasn't fired yet)
    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', existingSub.id);
    } else {
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan: planType,
        status: 'inactive',
      });
    }

    const priceId = planType === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price ID not configured in environment' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/cancel`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
