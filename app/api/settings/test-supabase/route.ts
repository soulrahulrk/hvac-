import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { url, key } = await req.json();
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Missing URL or key' }, { status: 400 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    
    // Test connection by checking if we can query anything or just check auth
    // Let's just check auth health or a dummy RPC
    const { error } = await supabase.from('_dummy').select('*').limit(1);
    
    // We expect an error maybe (table doesn't exist) but we should be able to reach the server.
    // Actually, network error vs table error:
    if (error && error.code === 'FETCH_ERROR') {
       throw new Error('Could not reach Supabase URL');
    }

    // If we reach here, it connected to Supabase
    return NextResponse.json({ success: true, message: 'Connected to Supabase' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
