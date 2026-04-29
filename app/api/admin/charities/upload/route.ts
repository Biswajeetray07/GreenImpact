import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-route';
import { createServerClient } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const routeClient = createRouteClient() as any;
    const userObj = await getUser(routeClient) as any;
    if (!userObj || userObj.dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient() as any;
    
    // Ensure bucket exists
    await supabase.storage.createBucket('charities', { public: true });

    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('charities')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('charities')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
