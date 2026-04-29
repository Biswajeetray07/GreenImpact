import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { planType, userId } = await req.json();
    const supabase = createRouteClient() as any;

    // 1. Check existing subscription for a customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Get user email
      const { data: userRecord } = await supabase.from('users').select('email').eq('id', userId).single();
      if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const customer = await stripe.customers.create({
        email: userRecord.email,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
