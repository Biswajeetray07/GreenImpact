import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { planType } = await req.json();
    const supabase = createRouteClient() as any;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: No valid session' }, { status: 401 });
    }

    const { data: dbUser, error: dbError } = await supabase.from('users').select('id, email').eq('auth_id', user.id).single();
    if (dbError || !dbUser) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }
    
    const userId = dbUser.id;

    // 1. Check existing subscription for a customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        metadata: { userId },
      });
      customerId = customer.id;
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
