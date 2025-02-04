// app/api/url/update/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const runtime = "edge";

export async function PATCH(request: Request) {
    try {
        const { id, active, long_url, slug } = await request.json();
        if (!id) {
            return NextResponse.json(
                { message: 'Falta el parámetro id' },
                { status: 400 }
            );
        }
        const updateData: Record<string, any> = {};
        if (active !== undefined) updateData.active = active;
        if (long_url !== undefined) updateData.long_url = long_url;
        if (slug !== undefined) updateData.slug = slug;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { message: 'No se especifica ningún campo para actualizar' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('urls')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { message: 'Error al actualizar la URL', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Actualización exitosa', data });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error en el servidor', error: error.message },
            { status: 500 }
        );
    }
}
