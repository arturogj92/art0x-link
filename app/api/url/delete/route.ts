// app/api/url/delete/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ message: 'Falta el parámetro id' }, { status: 400 });
        }
        const { data, error } = await supabase
            .from('urls')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ message: 'Error al borrar la URL', error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'URL eliminada correctamente', data });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
    }
}
