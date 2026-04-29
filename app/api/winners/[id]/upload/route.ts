import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || !userObj.dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    const { data: winner } = await supabase.from('winners').select('*').eq('id', params.id).single();
    if (!winner) return NextResponse.json({ error: 'Winner not found' }, { status: 404 });
    if (winner.user_id !== userObj.dbUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (winner.status !== 'pending') return NextResponse.json({ error: 'Can only upload proof for pending winnings' }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get('proof') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `winners/${params.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(filePath);

    const proofUrl = publicUrlData.publicUrl;

    await supabase.from('winners').update({ proof_url: proofUrl }).eq('id', params.id);

    return NextResponse.json({ success: true, proofUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
