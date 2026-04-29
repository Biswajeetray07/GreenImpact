import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { stripe } from '@/lib/stripe';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { charityId, amount } = await req.json();

    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = userObj.dbUser?.id;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Amount must be at least £1' }, { status: 400 });
    }

    const amountPence = Math.round(amount * 100);

    // Use request origin as fallback when NEXT_PUBLIC_APP_URL isn't set for production
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Independent Donation',
              description: 'Thank you for your generous independent donation.',
            },
            unit_amount: amountPence,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        charityId,
        type: 'independent',
      },
      success_url: `${appUrl}/dashboard?donation=success`,
      cancel_url: `${appUrl}/charities/${charityId}?donation=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
