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

    // 3. Look up user row — retry once after a short delay for signup race condition
    let dbUser = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('auth_id', user.id)
        .single();

      if (data) {
        dbUser = data;
        break;
      }

      if (attempt < 2) {
        // Wait 1 second before retry (gives DB trigger time to create the row)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // If still no user row after retries, create one from auth metadata
    if (!dbUser) {
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          auth_id: user.id,
          email: user.email,
          full_name: fullName,
          role: 'subscriber',
        })
        .select('id, email')
        .single();

      if (insertError || !newUser) {
        console.error('Checkout: Failed to create user row', insertError?.message);
        return NextResponse.json({ error: 'User setup in progress. Please try again in a moment.' }, { status: 503 });
      }
      dbUser = newUser;
    }
    
    const userId = dbUser.id;

    // 4. Check existing subscription for a customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, stripe_customer_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    // 5. If no customer ID in DB, also search Stripe directly
    if (!customerId) {
      const existingCustomers = await stripe.customers.list({ email: dbUser.email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }
    }

    // 6. If still no customer, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // 7. Immediately upsert a subscription row with the stripe_customer_id
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

    // Use NEXT_PUBLIC_APP_URL with fallback to request origin for production
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

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
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe/cancel`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
