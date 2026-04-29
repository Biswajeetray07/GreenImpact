import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import { sendWelcomeEmail, sendSubscriptionConfirmEmail, sendPaymentFailedEmail } from '@/lib/email';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createServerClient() as any;

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata.userId;

      if (session.metadata.type === 'independent') {
        const charityId = session.metadata.charityId;
        const amount = session.amount_total / 100;
        await supabase.from('donations').insert({
          user_id: userId,
          charity_id: charityId,
          amount,
          type: 'independent',
        });
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      const plan = subscription.items.data[0].plan.interval === 'year' ? 'yearly' : 'monthly';

      const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', userId).single();

      if (existingSub) {
        await supabase.from('subscriptions').update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
          plan,
          status: 'active',
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', existingSub.id);
      } else {
        await supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
          plan,
          status: 'active',
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        });
      }

      const { data: user } = await supabase.from('users').select('full_name, email').eq('id', userId).single();
      if (user) {
        if (!existingSub) {
          await sendWelcomeEmail(user.email, user.full_name);
        }
        await sendSubscriptionConfirmEmail(
          user.email,
          user.full_name,
          plan,
          new Date((subscription as any).current_period_end * 1000).toLocaleDateString('en-GB')
        );
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;
      let status = 'active';
      if (subscription.status === 'past_due') status = 'lapsed';
      if (subscription.status === 'canceled') status = 'cancelled';

      await supabase.from('subscriptions').update({
        status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }).eq('stripe_subscription_id', subscription.id);
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      await supabase.from('subscriptions').update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      }).eq('stripe_subscription_id', subscription.id);
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        await supabase.from('subscriptions').update({
          status: 'lapsed',
          updated_at: new Date().toISOString()
        }).eq('stripe_subscription_id', invoice.subscription as string);

        const { data: subUser } = await supabase.from('subscriptions').select('users(full_name, email)').eq('stripe_subscription_id', invoice.subscription as string).single();
        if (subUser && subUser.users) {
          await sendPaymentFailedEmail(subUser.users.email, subUser.users.full_name);
        }
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
