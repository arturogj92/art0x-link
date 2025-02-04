// app/api/url/list/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
    const { data, error } = await supabase
        .from('urls')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json(
            { message: 'Error al obtener los registros', error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ urls: data });
}
