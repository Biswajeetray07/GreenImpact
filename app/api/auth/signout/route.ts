import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';

export async function POST(request: Request) {
  const supabase = createRouteClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}
